import { useState, useMemo, useEffect, Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { generateTimeSlots } from "@/utils";
import { useSupabase } from "@/hooks/useSupabase";
import { useBookingStore } from "@/store/bookingStore";
import Colors from "@/constants/Colors";

// Helper function to format time
const formatTime = (hour: number, minute: number) => {
  const formattedHour = hour % 12 || 12;
  const formattedMinute = minute.toString().padStart(2, "0");
  return `${formattedHour}:${formattedMinute} ${hour >= 12 ? "PM" : "AM"}`;
};

export default function BookingScreen() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const { data: existingBookings = [] } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Update isSlotBooked to use Supabase data
  const isSlotBooked = (date: string, time: string) => {
    return existingBookings.some((booking) => {
      if (booking.date === date) {
        return booking.time_slots.includes(time);
      }
      return false;
    });
  };

  // Remove bookings from useBookingStore destructuring
  const {
    selectedServices: { duration, price, services },
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

  const { mutate: addBooking } = useMutation({
    mutationFn: async (booking: {
      user_id: string;
      date: string;
      start_time: string;
      duration: number;
      total_price: number;
      time_slots: string[];
      services: string[];
    }) => {
      const { error } = await supabase.from("bookings").insert([booking]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      useBookingStore.getState().resetSelectedServices();
      setModalVisible(true);
      router.push("/home");
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
    },
  });

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !user) return;

    addBooking({
      user_id: user.id,
      date: selectedDate,
      start_time: selectedTime,
      duration: durationMinutes,
      total_price: price,
      time_slots: selectedSlots,
      services: services
        ? Object.keys(services).filter(
            (key) => services[key as keyof typeof services]
          )
        : [],
    });
  };

  // Add function to check if date is weekend
  const isWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 5 || day === 6; // 5 is Saturday, 6 is Sunday
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Create disabled dates object for weekends
  const disabledDates: {
    [key: string]: { disabled: boolean; disableTouchEvent: boolean };
  } = {};
  let currentDate = new Date(today);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  while (currentDate <= oneYearFromNow) {
    const dateString = currentDate.toISOString().split("T")[0];
    if (isWeekend(dateString)) {
      disabledDates[dateString] = { disabled: true, disableTouchEvent: true };
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

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
              ...disabledDates,
            }}
            theme={{
              todayTextColor: "#007AFF",
              selectedDayBackgroundColor: "#007AFF",
            }}
          />

          {/* Select Time Spot */}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Thank you for booking with me! I will sms you shortly for
              confirming the appointment!
            </Text>
            <TouchableOpacity
              style={{
                width: 240,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.lightGray,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  color: Colors.primary,
                  fontWeight: "500",
                  fontSize: 16,
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
