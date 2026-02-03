import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "450px",
};

export default function NearbyHospitals() {
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        alert("Please enable your location!");
      }
    );
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Nearby Hospitals</h2>

      {!currentLocation ? (
        <p>Fetching your location...</p>
      ) : (
        <LoadScript googleMapsApiKey= "AIzaSyDdsgPldxwz12K3q5KxdJ3tXYLJ4y98Qys" libraries={["places"]}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={14}
          >
            <Marker position={currentLocation} />
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
}
