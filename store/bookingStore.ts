import { create } from "zustand";

interface SelectedServices {
  services: { [key: string]: boolean };
  duration: number;
  price: number;
}

interface BookingStore {
  selectedServices: SelectedServices;
  resetSelectedServices: () => void;
  setSelectedServices: (
    name: string,
    isSelected: boolean,
    serviceDuration: number,
    servicePrice: number
  ) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedServices: {
    services: {},
    duration: 0,
    price: 0,
  },

  resetSelectedServices: () => {
    set({
      selectedServices: {
        services: {},
        duration: 0,
        price: 0,
      },
    });
  },

  setSelectedServices: (name, isSelected, serviceDuration, servicePrice) =>
    set((state) => ({
      selectedServices: {
        services: {
          ...state.selectedServices.services,
          [name]: isSelected,
        },
        duration: isSelected
          ? state.selectedServices.duration + serviceDuration
          : state.selectedServices.duration - serviceDuration,
        price: isSelected
          ? state.selectedServices.price + servicePrice
          : state.selectedServices.price - servicePrice,
      },
    })),
}));
