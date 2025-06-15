import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";

import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";

const Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint={"extraLight"}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.05)",
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: "transparent",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome name="registered" size={size} color={color} />
          ),
          header: () => <CustomHeader />,
          headerTransparent: true,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome name="line-chart" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Booking",
          tabBarIcon: ({ size, color }) => (
            <FontAwesome name="bitcoin" size={size} color={color} />
          ),
          headerTransparent: true,
        }}
      />
    </Tabs>
  );
};
export default Layout;
