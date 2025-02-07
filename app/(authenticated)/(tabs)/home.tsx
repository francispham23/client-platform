import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { useBooking } from "@/hooks/useBooking";
import { useUser } from "@clerk/clerk-expo";

export default function HomeScreen() {
  const { getItems } = useBooking();
  const { user } = useUser();
  console.log('User: ', user);
  const { bookings, loadBookings } = useBookingStore();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {

    const loadingBookings = async () => {
      try {
        const onlineBooking = await getItems();
        console.log("All onlineBooking:", onlineBooking);
      } catch (error) {
        console.error("Error loading onlineBooking:", error);
      }
    };
    if (user) {
      loadingBookings();
    }
  }, [getItems]);

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

      <ScrollView>
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
                <Text style={styles.bookingDuration}>
                  Duration: {Math.floor(bookingInfo.duration / 60)}h{" "}
                  {bookingInfo.duration % 60}min
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
  bookingDuration: {
    fontSize: 16,
    marginBottom: 15,
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
