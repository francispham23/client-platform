import { useState, useMemo, useEffect, Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";

import { useBookingStore } from "@/store/bookingStore";
import { generateTimeSlots } from "@/utils";

// Helper function to format time
const formatTime = (hour: number, minute: number) => {
  const formattedHour = hour % 12 || 12;
  const formattedMinute = minute.toString().padStart(2, "0");
  return `${formattedHour}:${formattedMinute} ${hour >= 12 ? "PM" : "AM"}`;
};

interface BookingInfo {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  timeSlots: string[];
  services: string[];
}

export default function BookingScreen() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const {
    bookings,
    selectedServices: { duration, services },
  } = useBookingStore();
  const durationMinutes = duration;

  // Reset selections when duration changes
  useEffect(() => {
    setSelectedTime(null);
    setSelectedSlots([]);
  }, [duration]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedSlots([]);
  };

  // Add function to check if slot is booked
  const isSlotBooked = (date: string, time: string) => {
    return bookings.some((booking) => {
      if (booking.date === date) {
        return booking.timeSlots.includes(time);
      }
      return false;
    });
  };

  // Update handleTimeSelect to check for booked slots
  const handleTimeSelect = (time: string) => {
    const startIndex = timeSlots.findIndex(
      (slot) => formatTime(slot.hour, slot.minute) === time
    );

    // Calculate how many 30-minute slots we need
    const slotsNeeded = Math.ceil(durationMinutes / 30);

    // Check if we have enough slots available
    if (startIndex + slotsNeeded > timeSlots.length) {
      return;
    }

    // Get required slots
    const requiredSlots = timeSlots.slice(startIndex, startIndex + slotsNeeded);

    // Check if any required slot is already booked
    const hasBookedSlot = requiredSlots.some((slot) =>
      isSlotBooked(selectedDate, formatTime(slot.hour, slot.minute))
    );

    if (hasBookedSlot) {
      return;
    }

    const newSelectedSlots = requiredSlots.map((slot) =>
      formatTime(slot.hour, slot.minute)
    );

    setSelectedTime(time);
    setSelectedSlots(newSelectedSlots);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) return;

    const bookingInfo: BookingInfo = {
      id: Date.now().toString(),
      date: selectedDate,
      startTime: selectedTime,
      duration: durationMinutes,
      timeSlots: selectedSlots,
      services: services
        ? Object.keys(services).filter(
            (key) => services[key as keyof typeof services]
          )
        : [],
    };

    // Add booking to store
    useBookingStore.getState().addBooking(bookingInfo);

    // Reset selected services
    useBookingStore.getState().resetSelectedServices();

    // Navigate to home screen
    router.push("/home");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Booking",
          headerStyle: {
            backgroundColor: "#f8f8f8",
          },
        }}
      />

      <ScrollView style={styles.scrollView}>
        <Fragment>
          <Calendar
            style={styles.calendar}
            minDate={today}
            onDayPress={(day: { dateString: string }) =>
              handleDateSelect(day.dateString)
            }
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "#007AFF" },
            }}
            theme={{
              todayTextColor: "#007AFF",
              selectedDayBackgroundColor: "#007AFF",
            }}
          />

          {selectedDate ? (
            <View style={styles.timeContainer}>
              <Text style={styles.sectionTitle}>Available Times</Text>
              <View>
                {durationMinutes ? (
                  <Text style={styles.duration}>
                    Duration: {Math.floor(durationMinutes / 60)}h{" "}
                    {durationMinutes % 60}min
                  </Text>
                ) : (
                  <Text style={styles.thirdTitle}>
                    Please select a service for booking
                  </Text>
                )}
              </View>
              <View style={styles.timeSlotContainer}>
                {timeSlots.map((slot, index) => {
                  const time = formatTime(slot.hour, slot.minute);
                  const isSelected = selectedSlots.includes(time);
                  const isBooked = isSlotBooked(selectedDate, time);

                  const hasValidSlots = !!durationMinutes;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.selectedTimeSlot,
                        !hasValidSlots && styles.disabledTimeSlot,
                        isBooked && styles.bookedTimeSlot,
                      ]}
                      onPress={() => handleTimeSelect(time)}
                      disabled={!hasValidSlots || isBooked}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          isSelected && styles.selectedTimeText,
                          !hasValidSlots && styles.disabledTimeText,
                          isBooked && styles.bookedTimeText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </Fragment>
      </ScrollView>

      {selectedDate && selectedTime ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  calendar: {
    marginBottom: 20,
  },
  timeContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  thirdTitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  duration: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  timeSlotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  timeSlot: {
    width: "30%",
    padding: 10,
    margin: "1.5%",
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  selectedTimeSlot: {
    backgroundColor: "#007AFF",
  },
  timeText: {
    fontSize: 14,
    color: "#333",
  },
  selectedTimeText: {
    color: "#fff",
  },
  footer: {
    flex: 0.2,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#f8f8f8",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledTimeSlot: {
    backgroundColor: "#e0e0e0",
    opacity: 0.5,
  },
  disabledTimeText: {
    color: "#999",
  },
  bookedTimeSlot: {
    backgroundColor: "#FFE5E5",
    opacity: 0.8,
  },
  bookedTimeText: {
    color: "#FF4444",
  },
});
