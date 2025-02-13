import { useBookingStore } from "@/store/bookingStore";
import { Services } from "@/constants/Services";

export const useCalculateTotals = (services: Services) => {
  const { selectedServices } = useBookingStore();

  let totalPrice = 0;
  let totalDuration = 0;

  services.forEach((section) => {
    section.items.forEach((item) => {
      if (selectedServices.services[item.name]) {
        // Handle price & duration
        totalPrice += item.price;
        totalDuration += item.duration;
      }
    });
  });

  return { totalPrice, totalDuration };
};
