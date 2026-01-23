import { 
  Wifi, Tv, Wind, Car, Coffee, Utensils, ShieldCheck, 
  Waves, Dumbbell, Flame, Baby, PawPrint, Laptop, 
  WashingMachine, Refrigerator, Microwave, Key, 
  PocketKnife, Flower2, Thermometer 
} from "lucide-react";

export interface Amenity {
  id: string;
  name: string;
}

export const getAmenityDetails = (name: string) => {
  const map: Record<string, { icon: any; desc: string }> = {
    Wifi: { icon: Wifi, desc: "High-speed internet throughout the property." },
    TV: { icon: Tv, desc: "Smart TV with access to popular streaming apps." },
    "Air conditioning": { icon: Wind, desc: "Central or unit cooling for your comfort." },
    Heating: { icon: Thermometer, desc: "Keep warm during the cooler months." },
    Kitchen: { icon: Utensils, desc: "Fully equipped space for meal preparation." },
    "Free parking": { icon: Car, desc: "On-site parking available at no extra cost." },
    "Self check-in": { icon: Key, desc: "Check yourself in using a secure keypad or lockbox." },
    Washer: { icon: WashingMachine, desc: "In-unit laundry facilities for long-term stays." },
    Dryer: { icon: WashingMachine, desc: "Standard drying machine available for guest use." },
    Iron: { icon: PocketKnife, desc: "Professional iron and board provided." },
    "Coffee maker": { icon: Coffee, desc: "Brew your favorite beans every morning." },
    Refrigerator: { icon: Refrigerator, desc: "Full-sized fridge to keep your groceries fresh." },
    Microwave: { icon: Microwave, desc: "For quick meal heating and snacks." },
    "Dedicated workspace": { icon: Laptop, desc: "A desk or table with comfortable seating for work." },
    Pool: { icon: Waves, desc: "Access to a private or shared swimming pool." },
    Gym: { icon: Dumbbell, desc: "On-site fitness equipment for your workouts." },
    Backyard: { icon: Flower2, desc: "Private outdoor space with greenery or seating." },
    "Pet friendly": { icon: PawPrint, desc: "Your furry friends are welcome to join you." },
    "Family friendly": { icon: Baby, desc: "Equipment and layout suitable for children." },
    "Fire extinguisher": { icon: Flame, desc: "Safety equipment located in an accessible area." },
  };

  return map[name] || {
    icon: ShieldCheck,
    desc: "Quality amenity verified and provided by the host.",
  };
};