import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/hooks/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";

import AppointmentDetails from "@/components/AppointmentDetails";
import { useForceRefresh } from "@/hooks/useForceRefresh";

export interface BookingInfo {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  duration: number;
  timeSlots: string[];
  services: string[];
  totalPrice: number;
}

export default function HomeScreen() {
  const { user } = useUser();
  const supabase = useSupabase();
  const headerHeight = useHeaderHeight();

  // Check if the user is an admin
  const isAdmin = user?.phoneNumbers[0].phoneNumber === "+12015550100";

  const {
    data: bookings = [],
    isLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", user?.id, isAdmin],
    queryFn: async (): Promise<BookingInfo[]> => {
      const query = supabase
        .from("bookings")
        .select("*")
        .order("date", { ascending: false });

      if (!isAdmin) {
        query.eq("user_id", user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((booking) => ({
        id: booking.id,
        userId: booking.user_id,
        date: booking.date,
        startTime: booking.start_time,
        duration: booking.duration,
        totalPrice: booking.total_price,
        timeSlots: booking.time_slots,
        services: booking.services,
      }));
    },
    enabled: !!user,
  });

  // Add query to fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, phone_number");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { forceRefreshing, onRefresh } = useForceRefresh(refetchBookings);

  // Create a map of user IDs to names
  const userMap = Object.fromEntries(
    users.map((user) => [
      user.id,
      { name: user.name, phone: user.phone_number },
    ])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.noBookings}>Loading bookings...</Text>
      </View>
    );
  }

  const isCurrentBooking = (bookingDate: string, startTime: string) => {
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate} ${startTime}`);
    return now.toDateString() === bookingDateTime.toDateString();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Home",
          headerStyle: {
            backgroundColor: "#f8f8f8",
          },
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            enabled
            refreshing={forceRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <Text style={styles.sectionTitle}>Your Bookings</Text>
        {bookings.length === 0 ? (
          <Text style={styles.noBookings}>No bookings yet</Text>
        ) : (
          bookings
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((bookingInfo) => (
              <AppointmentDetails
                key={bookingInfo.id}
                {...{ bookingInfo, isAdmin, userMap, isCurrentBooking }}
              />
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 20,
  },
  noBookings: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
