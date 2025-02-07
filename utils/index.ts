// Add a helper function to format duration
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else {
    return `${hours}h ${remainingMinutes}min`;
  }
};

// Generate time slots
export const generateTimeSlots = () => {
  const slots = [];
  // Business hours from 9 AM to 7 PM
  for (let hour = 12; hour < 21; hour++) {
    slots.push({ hour, minute: 0 });
    slots.push({ hour, minute: 30 });
  }
  return slots;
};
