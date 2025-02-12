import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import {
  useUser,
  useSignIn,
  useSignUp,
  isClerkAPIResponseError,
} from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";
import { Fragment, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import {
  Cursor,
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { useSupabase } from "@/hooks/useSupabase";

const CELL_COUNT = 6;

type SearchParams = {
  phone: string;
  signin: string;
};

const Page = () => {
  const { user } = useUser();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();

  const supabase = useSupabase();
  const { phone, signin } = useLocalSearchParams<SearchParams>();

  const [code, setCode] = useState("");

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  const catchError = (error: unknown, signin?: boolean) => {
    if (isClerkAPIResponseError(error)) {
      Alert.alert(
        `${signin ? "Sign In" : "Sign Up"} Error`,
        error.errors[0].message
      );
    }
  };

  const verifySignIn = async () => {
    try {
      await signIn!.attemptFirstFactor({
        strategy: "phone_code",
        code,
      });
      await setSignInActive!({ session: signIn!.createdSessionId });
    } catch (err) {
      catchError(err, true);
    }
  };

  const verifyCode = async () => {
    try {
      await signUp!.attemptPhoneNumberVerification({
        code,
      });
      await setSignUpActive!({ session: signUp!.createdSessionId });
    } catch (err) {
      catchError(err);
    }
  };

  // Verify the code
  useEffect(() => {
    if (code.length === 6) signin === "true" ? verifySignIn() : verifyCode();
  }, [code]);

  // Save the user to the SupaBase database
  useEffect(() => {
    const saveUserToSupabase = async () => {
      if (signin || !user) return;

      const { data, error } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumbers[0]?.phoneNumber,
          image_url: user.imageUrl,
          metadata: {
            lastLogin: new Date().toISOString(),
            // Add any other metadata you want to track
          },
        },
      ]);

      if (error) {
        console.error("Error creating user:", error);
      } else {
        console.info("User created: ", data);
      }
    };

    saveUserToSupabase();
  }, [user]);

  return (
    <View style={defaultStyles.container}>
      <Text style={defaultStyles.header}>6-digit code</Text>
      <Text style={defaultStyles.descriptionText}>Code sent to {phone}</Text>

      <CodeField
        ref={ref}
        {...props}
        value={code}
        onChangeText={setCode}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Fragment key={index}>
            <View
              // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[styles.cellRoot, isFocused && styles.focusCell]}
            >
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
            {index === 2 ? (
              <View key={`separator-${index}`} style={styles.separator} />
            ) : null}
          </Fragment>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  codeFieldRoot: {
    marginVertical: 20,
    marginLeft: "auto",
    marginRight: "auto",
    gap: 12,
  },
  cellRoot: {
    width: 45,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  cellText: {
    color: "#000",
    fontSize: 36,
    textAlign: "center",
  },
  focusCell: {
    paddingBottom: 8,
  },
  separator: {
    height: 2,
    width: 10,
    backgroundColor: Colors.gray,
    alignSelf: "center",
  },
});
export default Page;
