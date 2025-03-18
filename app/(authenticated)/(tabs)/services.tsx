import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { services } from "@/constants/Services";
import { useBookingStore } from "@/store/bookingStore";
import { useCalculateTotals } from "@/hooks/useCalculateTotals";

import ServiceItem from "@/components/Service/ServiceItem";
import ServiceSummary from "@/components/Service/ServiceSummary";

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
      <SafeAreaView style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Kate's Nails Studio</Text>
          <Text style={styles.note}>#Removal included on the set</Text>

          {services.map((section) => (
            <View key={section.category} style={styles.section}>
              <Text style={styles.categoryTitle}>{section.category}</Text>
              {section.items.map((item) => (
                <ServiceItem
                  key={item.name}
                  {...item}
                  isSelected={!!selectedServices.services[item.name]}
                  onToggle={handleServiceToggle}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        {totalPrice > 0 && (
          <ServiceSummary
            totalPrice={totalPrice}
            totalDuration={totalDuration}
            onBooking={() => router.push({ pathname: "/booking" })}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

export const styles = StyleSheet.create({
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
});
