import { useBookingStore } from "@/store/bookingStore";
import { Services } from "@/constants/Services";

export const useCalculateTotals = (services: Services) => {
  const { selectedServices } = useBookingStore();

  let totalPrice = 0;
  let totalDuration = 0;

  services.forEach((section) => {
    section.items.forEach((item) => {
      if (selectedServices.services[item.name]) {
        // Handle price
        if (typeof item.price === "number") {
          totalPrice += item.price;
        } else if (item.price.startsWith("+")) {
          const priceRange = item.price.substring(1).split("~");
          totalPrice += Number(priceRange[0]);
        }

        // Handle duration
        totalDuration += item.duration;
      }
    });
  });

  return { totalPrice, totalDuration };
};
