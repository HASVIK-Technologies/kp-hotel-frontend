/** Restaurant content: menu, opening hours and bookable table times. */

export type MealKey = "breakfast" | "lunch" | "dinner";
export const MENU: Record<MealKey, { name: string; desc: string; price: number; veg: boolean }[]> = {
  breakfast: [
    { name: "Aloo Paratha & Curd", desc: "Stuffed wheat flatbread, white butter, pickle", price: 140, veg: true },
    { name: "Poori Sabzi", desc: "Puffed bread with spiced potato curry", price: 120, veg: true },
    { name: "Masala Omelette", desc: "Three-egg omelette, toast, hash brown", price: 130, veg: false },
    { name: "Idli Sambar", desc: "Steamed rice cakes, sambar, coconut chutney", price: 110, veg: true },
  ],
  lunch: [
    { name: "Dal Makhani", desc: "Slow-cooked black lentils, cream, butter", price: 240, veg: true },
    { name: "Paneer Butter Masala", desc: "Cottage cheese in a rich tomato gravy", price: 320, veg: true },
    { name: "KP Special Veg Thali", desc: "Seasonal sabzi, dal, rice, roti, sweet", price: 280, veg: true },
    { name: "Chicken Biryani", desc: "Dum-cooked basmati, raita, salan", price: 380, veg: false },
  ],
  dinner: [
    { name: "Butter Chicken", desc: "Tandoor-roasted chicken, makhani sauce", price: 420, veg: false },
    { name: "Tandoori Platter", desc: "Assorted kebabs, mint chutney, onion salad", price: 520, veg: false },
    { name: "Hakka Noodles", desc: "Wok-tossed noodles, vegetables, soy", price: 260, veg: true },
    { name: "Gulab Jamun & Rabdi", desc: "Warm dumplings, saffron rabdi", price: 140, veg: true },
  ],
};
export const DINING_HOURS = [
  { label: "Breakfast", time: "7:00 – 10:30" },
  { label: "Lunch", time: "12:00 – 15:30" },
  { label: "Dinner", time: "19:00 – 23:00" },
];
export const TABLE_TIMES = ["07:30", "08:30", "09:30", "12:30", "13:30", "14:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
