import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/hooks/useSupabase";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";

interface BookingInfo {
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

  const isAdmin = user?.phoneNumbers[0].phoneNumber === "+17785120389";

  const { data: bookings = [], isLoading } = useQuery({
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
      const { data, error } = await supabase.from("users").select("id, name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Create a map of user IDs to names
  const userMap = Object.fromEntries(users.map((user) => [user.id, user.name]));

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
              <View
                key={bookingInfo.id}
                style={[
                  styles.bookingCard,
                  isCurrentBooking(bookingInfo.date, bookingInfo.startTime) &&
                    styles.currentBooking,
                ]}
              >
                <Text style={styles.bookingTitle}>
                  {isCurrentBooking(bookingInfo.date, bookingInfo.startTime) &&
                    "📍 "}
                  Appointment
                </Text>
                <Text style={styles.bookingDate}>
                  Date: {new Date(bookingInfo.date).toLocaleDateString()}
                </Text>
                <Text style={styles.bookingTime}>
                  Time: {bookingInfo.startTime}
                </Text>
                {isAdmin && userMap[bookingInfo.userId] ? (
                  <Text style={styles.bookingClient}>
                    Client: {userMap[bookingInfo.userId]}
                  </Text>
                ) : null}
                <Text style={styles.bookingDuration}>
                  Duration: {Math.floor(bookingInfo.duration / 60)}h{" "}
                  {bookingInfo.duration % 60}min
                </Text>
                <Text style={styles.bookingPrice}>
                  Total Service Charge: ${bookingInfo.totalPrice}
                </Text>

                <Text style={styles.servicesTitle}>Services:</Text>
                {bookingInfo.services.map((service, index) => (
                  <Text key={index} style={styles.serviceItem}>
                    • {service}
                  </Text>
                ))}
              </View>
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
  bookingCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  currentBooking: {
    backgroundColor: "#f0f8ff",
    borderColor: "#007AFF",
  },
  bookingTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 15,
  },
  bookingDate: {
    fontSize: 16,
    marginBottom: 8,
  },
  bookingTime: {
    fontSize: 16,
    marginBottom: 8,
  },
  bookingClient: {
    fontSize: 16,
    marginBottom: 8,
  },
  bookingDuration: {
    fontSize: 16,
    marginBottom: 8,
  },
  bookingPrice: {
    fontSize: 16,
    marginBottom: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  serviceItem: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
    color: "#666",
  },
});
