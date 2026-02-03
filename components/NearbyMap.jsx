import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons (important)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Hospital Icon
const hospitalIcon = L.icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
});

// Your Location Icon (Blue Dot)
const userIcon = L.icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const NearbyMap = () => {
  const [map, setMap] = useState(null);

  // Hardcoded Hospital List (ADD YOUR OWN IF YOU WANT)
  const hospitals = [
    { name: "Apollo Hospital", lat: 16.5063, lon: 80.6480 },
    { name: "Aayush Hospitals", lat: 16.5092, lon: 80.6411 },
    { name: "Care Hospital", lat: 16.5033, lon: 80.6532 },
    { name: "AIIMS Mangalagiri", lat: 16.4303, lon: 80.5501 },
    { name: "Ramesh Hospitals", lat: 16.5151, lon: 80.6323 },
    { name: "NRI Hospital", lat: 16.4459, lon: 80.5421 },
    { name: "Manipal Hospital", lat: 16.4975, lon: 80.6668 },
  ];

  // Haversine distance (Km)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // Prevent double map creation
    if (L.DomUtil.get("fullmap")) {
      L.DomUtil.get("fullmap")._leaflet_id = null;
    }

    const leafletMap = L.map("fullmap").setView([20.5937, 78.9629], 5); // default India

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(leafletMap);

    setMap(leafletMap);

    // Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        leafletMap.setView([lat, lon], 14);

        // Mark user location
        L.marker([lat, lon], { icon: userIcon })
          .addTo(leafletMap)
          .bindPopup("📍 You are here");

        // Calculate nearest 5 hospitals
        const nearest = hospitals
          .map((h) => ({
            ...h,
            distance: getDistance(lat, lon, h.lat, h.lon),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(5); // nearest 5

        // Show hospitals on map
        nearest.forEach((h) => {
          L.marker([h.lat, h.lon], { icon: hospitalIcon })
            .addTo(leafletMap)
            .bindPopup(`<b>${h.name}</b><br>${h.distance.toFixed(2)} km away`);
        });
      },
      () => {
        alert("Unable to fetch your location. Allow location permission.");
      }
    );
  }, []);

  return (
    <div
      id="fullmap"
      style={{
        height: "100vh",
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    ></div>
  );
};

export default NearbyMap;
