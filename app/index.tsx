import { useState } from "react";
import {
  useSignUp,
  useSignIn,
  isClerkAPIResponseError,
} from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";

enum AuthType {
  Phone,
  Google,
}

const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;

const Page = () => {
  const router = useRouter();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();

  const [phoneNumber, setPhoneNumber] = useState("");

  const onAuth = async (type: AuthType) => {
    const fullPhoneNumber = `+1${phoneNumber}`;

    if (type === AuthType.Phone) {
      // sign in with phone number
      try {
        const { supportedFirstFactors } = await signIn!.create({
          identifier: fullPhoneNumber,
        });

        const firstPhoneFactor: any = supportedFirstFactors?.find(
          (factor: any) => {
            return factor.strategy === "phone_code";
          }
        );

        const { phoneNumberId } = firstPhoneFactor;

        await signIn!.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId,
        });

        router.push({
          pathname: "/verify/[phone]",
          params: { phone: fullPhoneNumber, signin: "true" },
        });
      } catch (error) {
        // if the user does not have an account, create one
        if (isClerkAPIResponseError(error)) {
          if (error.errors[0].code === "form_identifier_not_found") {
            try {
              await signUp!.create({
                phoneNumber: fullPhoneNumber,
              });
              signUp!.preparePhoneNumberVerification();

              router.push({
                pathname: "/verify/[phone]",
                params: { phone: fullPhoneNumber },
              });
            } catch (err) {
              Alert.alert(
                "SignUp Error",
                "System error. Please try again later."
              );
            }
          } else {
            Alert.alert(
              "SignIn Error",
              "System error. Please try again later."
            );
          }
        }
      }
    }
  };

  const handleOnPress = () => onAuth(AuthType.Phone);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={[defaultStyles.container, { padding: 20, marginTop: 80 }]}>
        <Text style={defaultStyles.header}>Let's get started!</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter your phone number for booking. We will send you a confirmation
          code there
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Mobile number"
            placeholderTextColor={Colors.gray}
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            phoneNumber !== "" ? styles.enabled : styles.disabled,
            { marginBottom: 20 },
          ]}
          onPress={handleOnPress}
        >
          <Text style={defaultStyles.buttonText}>Start Booking</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingTop: 20,
    marginVertical: 20,
    flexDirection: "row",
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 20,
    borderRadius: 16,
    fontSize: 20,
    marginRight: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.primaryMuted,
  },
});
export default Page;
