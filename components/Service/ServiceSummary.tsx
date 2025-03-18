import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatDuration } from "@/utils";

export interface ServiceSummaryProps {
  totalPrice: number;
  totalDuration: number;
  onBooking: () => void;
}

export default function ServiceSummary({
  totalPrice,
  totalDuration,
  onBooking,
}: ServiceSummaryProps) {
  return (
    <View style={styles.summary}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Service Charge:</Text>
        <Text style={styles.priceValue}>${totalPrice}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Duration:</Text>
        <Text style={styles.summaryValue}>{formatDuration(totalDuration)}</Text>
      </View>
      <TouchableOpacity style={styles.transferButton} onPress={onBooking}>
        <Text style={styles.transferButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 16,
    color: "#333",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  transferButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
    alignItems: "center",
  },
  transferButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
