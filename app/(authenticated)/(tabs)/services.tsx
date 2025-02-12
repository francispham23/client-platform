import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";

import { formatDuration } from "@/utils";
import { services } from "@/constants/Services";
import { useBookingStore } from "@/store/bookingStore";
import { useCalculateTotals } from "@/hooks/useCalculateTotals";

export default function ServicesScreen() {
  const router = useRouter();
  const { selectedServices, setSelectedServices } = useBookingStore();
  const { totalPrice, totalDuration } = useCalculateTotals(services);

  const handleServiceToggle = (
    name: string,
    duration: number,
    price: number
  ) => {
    const isCurrentlySelected = selectedServices.services[name] || false;
    setSelectedServices(name, !isCurrentlySelected, duration, price);
  };

  const handleNavigateToBooking = () => {
    router.push({ pathname: "/booking" });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Services",
          headerStyle: {
            backgroundColor: "#f8f8f8",
          },
        }}
      />
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Kate's Nails Studio</Text>
          <Text style={styles.note}>#Removal included on the set</Text>

          {services.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.categoryTitle}>{section.category}</Text>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.serviceItem}
                  onPress={() =>
                    handleServiceToggle(item.name, item.duration, item.price)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.serviceLeftContent}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <Text style={styles.duration}>
                      {formatDuration(item.duration)}
                    </Text>
                  </View>
                  <View style={styles.serviceRightContent}>
                    <Text style={styles.servicePrice}>{item.price}</Text>
                    <Ionicons
                      name={
                        selectedServices.services[item.name]
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={
                        selectedServices.services[item.name]
                          ? "#007AFF"
                          : "#666"
                      }
                      style={styles.checkbox}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        {totalPrice > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Service Charge:</Text>
              <Text style={styles.priceValue}>${totalPrice}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Duration:</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(totalDuration)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.transferButton}
              onPress={handleNavigateToBooking}
            >
              <Text style={styles.transferButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 70,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 10,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  serviceLeftContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
  },
  duration: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  serviceRightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 15,
  },
  checkbox: {
    marginLeft: 5,
  },
  note: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  mainContainer: {
    flex: 1,
  },
  summary: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  transferButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  transferButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
