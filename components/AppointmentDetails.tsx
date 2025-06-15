import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { BookingInfo } from "@/app/(authenticated)/(tabs)/home";

type AppointmentDetailsProps = {
  bookingInfo: BookingInfo;
  isAdmin: boolean;
  userMap: Record<string, { name: string; phone: string }>;
  isCurrentBooking: (date: string, startTime: string) => boolean;
};

const AppointmentDetails = ({
  bookingInfo,
  isAdmin,
  userMap,
  isCurrentBooking,
}: AppointmentDetailsProps) => {
  return (
    <View
      key={bookingInfo.id}
      style={[
        styles.bookingCard,
        isCurrentBooking(bookingInfo.date, bookingInfo.startTime) &&
          styles.currentBooking,
      ]}
    >
      <Text style={styles.bookingTitle}>
        {isCurrentBooking(bookingInfo.date, bookingInfo.startTime) && "📍 "}
        Appointment
      </Text>
      <Text style={styles.bookingDate}>Date: {bookingInfo.date}</Text>
      <Text style={styles.bookingTime}>Time: {bookingInfo.startTime}</Text>
      {isAdmin && userMap[bookingInfo.userId] ? (
        <>
          <Text style={styles.bookingClient}>
            Client: {userMap[bookingInfo.userId].name}
          </Text>
          <Text style={styles.bookingPhone}>
            Phone:{" "}
            <Link href={`sms:${userMap[bookingInfo.userId].phone}`}>
              {userMap[bookingInfo.userId].phone}
            </Link>
          </Text>
        </>
      ) : null}
      <Text style={styles.bookingDuration}>
        Duration: {Math.floor(bookingInfo.duration / 60)}h{" "}
        {bookingInfo.duration % 60}min
      </Text>
      <Text style={styles.bookingPrice}>
        Estimated Total Service Charge: ${bookingInfo.totalPrice}
      </Text>

      <Text style={styles.servicesTitle}>Services:</Text>
      {bookingInfo.services.map((service, index) => (
        <Text key={index} style={styles.serviceItem}>
          • {service}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
  bookingPhone: {
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

export default AppointmentDetails;
