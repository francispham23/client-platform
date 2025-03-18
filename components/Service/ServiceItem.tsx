import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { formatDuration } from "@/utils";

export interface ServiceItemType {
  name: string;
  duration: number;
  price: number;
}

interface ServiceItemProps extends ServiceItemType {
  isSelected: boolean;
  onToggle: (name: string, duration: number, price: number) => void;
}

export default function ServiceItem({
  name,
  duration,
  price,
  isSelected,
  onToggle,
}: ServiceItemProps) {
  return (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => onToggle(name, duration, price)}
      activeOpacity={0.7}
    >
      <View style={styles.serviceLeftContent}>
        <Text style={styles.serviceName}>{name}</Text>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
      </View>
      <View style={styles.serviceRightContent}>
        <Text style={styles.servicePrice}>${price}</Text>
        <Ionicons
          name={isSelected ? "checkbox" : "square-outline"}
          size={24}
          color={isSelected ? "#007AFF" : "#666"}
          style={styles.checkbox}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
