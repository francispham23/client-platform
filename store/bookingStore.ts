import { create } from "zustand";
import { storage } from "./mmkv-storage";

export interface BookingInfo {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  timeSlots: string[];
  services: string[];
  totalPrice: number;
}
export interface SelectedServices {
  services: { [key: string]: boolean };
  duration: number;
}
export interface BookingStore {
  bookings: BookingInfo[];
  selectedServices: {
    services: { [key: string]: boolean };
    duration: number;
    price: number;
  };
  addBooking: (booking: BookingInfo) => void;
  loadBookings: () => void;
  resetSelectedServices: () => void;
  setSelectedServices: (
    name: string,
    isSelected: boolean,
    serviceDuration: number,
    servicePrice: number
  ) => void;
}

// Key for storing bookings in MMKV
const BOOKINGS_STORAGE_KEY = "bookings";

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  selectedServices: {
    services: {},
    duration: 0,
    price: 0,
  },

  addBooking: (booking: BookingInfo) => {
    set((state) => {
      const newBookings = [...state.bookings, booking];
      // Save to MMKV storage
      storage.set(BOOKINGS_STORAGE_KEY, JSON.stringify(newBookings));
      return { bookings: newBookings };
    });
  },

  loadBookings: () => {
    const storedBookings = storage.getString(BOOKINGS_STORAGE_KEY);
    if (storedBookings) {
      set({ bookings: JSON.parse(storedBookings) });
    }
  },

  resetSelectedServices: () => {
    set({ selectedServices: { services: {}, duration: 0, price: 0 } });
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
