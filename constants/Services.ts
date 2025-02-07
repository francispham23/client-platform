export interface ServiceItem {
  name: string;
  price: string | number;
  category?: string;
  duration: number; // Duration in minutes
}

export type Services = {
  category: string;
  items: ServiceItem[];
}[];

export const services: Services = [
  {
    category: "Nature Nails",
    items: [
      { name: "Shellac manicure", price: 30, duration: 45 },
      { name: "Mini shellac pedicure", price: 32, duration: 40 },
    ],
  },
  {
    category: "Nails Extension",
    items: [
      { name: "New set GEL-X Short/Medium", price: 50, duration: 90 },
      { name: "Re-fill GEL-X *Only once*", price: 45, duration: 60 },
      { name: "New set Acrylic Short/Medium", price: 45, duration: 75 },
      { name: "Re-fill Acrylic", price: 40, duration: 60 },
      { name: "Hard gel/Acrylic overlay", price: 37, duration: 60 },
      { name: "Long / Extra Long", price: "+5", duration: 15 },
    ],
  },
  {
    category: "Add On",
    items: [
      { name: "Charm/Crystal", price: "+5~15", duration: 15 },
      { name: "French tip/Ombre", price: "+10", duration: 15 },
      { name: "Chrome/Magnetic Cat-eye polish", price: "+10", duration: 15 },
      { name: "Nails Art", price: "+5~15", duration: 15 },
    ],
  },
];
