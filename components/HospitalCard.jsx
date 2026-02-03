import React from "react";
import "./HospitalCard.css"; // Make sure you have this CSS file

const HospitalCard = ({ hospital, onClick }) => {
    return (
        <div className="hospital-card" onClick={onClick}>
            <h3 className="hospital-name">{hospital.name}</h3>

            {hospital.vicinity && (
                <p className="hospital-address">
                    📍 {hospital.vicinity}
                </p>
            )}

            {hospital.rating && (
                <p className="hospital-rating">
                    ⭐ {hospital.rating} / 5
                </p>
            )}

            {hospital.user_ratings_total && (
                <p className="hospital-reviews">
                    {hospital.user_ratings_total} reviews
                </p>
            )}

            {hospital.opening_hours && (
                <p className="hospital-open">
                    {hospital.opening_hours.open_now ? "🟢 Open Now" : "🔴 Closed Now"}
                </p>
            )}
        </div>
    );
};

export default HospitalCard;
