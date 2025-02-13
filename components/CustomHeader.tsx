import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Fragment } from "react";

const CustomHeader = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { top } = useSafeAreaInsets();

  // TODO: More features coming...
  const isHidden = true;

  return (
    <BlurView intensity={80} tint={"extraLight"} style={{ paddingTop: top }}>
      <View
        style={[
          styles.container,
          {
            height: 60,
            gap: 10,
            paddingHorizontal: 20,
            backgroundColor: "transparent",
          },
        ]}
      >
        <Link href={"/(authenticated)/(modals)/account-details"} asChild>
          <TouchableOpacity
            style={{
              width: 240,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.lightGray,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: Colors.primary, fontWeight: "500", fontSize: 16 }}
            >
              Welcome, {user?.firstName}!
            </Text>
          </TouchableOpacity>
        </Link>

        {isHidden ? null : (
          <Fragment>
            <View style={styles.searchSection}>
              <Ionicons
                style={styles.searchIcon}
                name="search"
                size={20}
                color={Colors.dark}
              />
              <TextInput
                style={styles.input}
                placeholder="Search"
                placeholderTextColor={Colors.dark}
              />
            </View>
            <View style={styles.circle}>
              <Ionicons name={"stats-chart"} size={20} color={Colors.dark} />
            </View>
          </Fragment>
        )}

        <TouchableOpacity onPress={() => signOut()}>
          <View style={styles.circle}>
            <Ionicons name={"card"} size={20} color={Colors.dark} />
          </View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    padding: 10,
    backgroundColor: Colors.gray,
  },
  searchSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 30,
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: Colors.lightGray,
    color: Colors.dark,
    borderRadius: 30,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default CustomHeader;
