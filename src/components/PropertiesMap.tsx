import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { type Property } from "../types/property";
import { PropertyCard } from "@/pages/ExplorePage";

// Custom Map Pin showing the price
const createPriceIcon = (price: number) => {
  return L.divIcon({
    className: "custom-pin",
    html: `<div style="background-color: white; color: black; font-weight: bold; padding: 4px 8px; text-align: center; border-radius: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid #e5e7eb; font-size: 14px; white-space: nowrap;">$${price}</div>`,
    iconSize: [70, 28], // Changed from [auto, auto] to actual pixel dimensions
    iconAnchor: [35, 14], // Half of the width and height to perfectly center it
  });
};

export function PropertiesMap({
  properties,
  userId,
}: {
  properties: Property[];
  userId?: string;
}) {
  // Default center (can be somewhere generic, or the first property's location)
  const defaultCenter: [number, number] = properties.length > 0 && properties[0].lat && properties[0].lng
    ? [properties[0].lat, properties[0].lng]
    : [40.7128, -74.0060]; // Default to NY if no properties exist

  return (
    <div className="w-full h-[600px] md:h-[calc(100vh-250px)] rounded-2xl overflow-hidden shadow-md z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((property) => {
          // Skip properties without coordinates
          if (!property.lat || !property.lng) return null;

          return (
            <Marker
              key={property.id}
              position={[property.lat, property.lng]}
              icon={createPriceIcon(property.price_per_night)}
            >
              <Popup className="custom-popup" closeButton={false}>
                 {/* Wrap the property card so it fits nicely inside the map popup */}
                <div className="w-50">
                  <PropertyCard property={property} userId={userId} />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}