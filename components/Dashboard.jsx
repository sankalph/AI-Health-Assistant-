import React, { useEffect, useState, useCallback } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Dashboard.css";
import "./Chatbot.css";
import HospitalCard from "./HospitalCard.jsx";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import ChatBot from "./ChatBot";
import NearbyMap from "./NearbyMap";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [vitals, setVitals] = useState([]);
  const [form, setForm] = useState({ bp: "", heartRate: "", sugar: "" });
  const [insight, setInsight] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [userName, setUserName] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const navigate = useNavigate();

  // user quick info
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserName(user.displayName || (user.email ? user.email.split("@")[0] : "User"));
  }, []);

  // fetch vitals
  const fetchVitals = useCallback(async () => {
    try {
      setLoadingVitals(true);
      const q = await getDocs(collection(db, "vitals"));
      const vitalsData = q.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setVitals(vitalsData);
    } catch (err) {
      console.error("fetchVitals", err);
      toast.error("Unable to load vitals");
    } finally {
      setLoadingVitals(false);
    }
  }, []);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  // add vitals
  const handleAddVitals = async (e) => {
    e.preventDefault();
    if (!form.bp || !form.heartRate || !form.sugar) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      const today = new Date().toLocaleDateString("en-IN");
      await addDoc(collection(db, "vitals"), {
        ...form,
        date: today,
        createdAt: serverTimestamp()
      });
      setForm({ bp: "", heartRate: "", sugar: "" });
      toast.success("Vitals saved");
      await fetchVitals();

      getHealthInsights({ ...form, date: today });
    } catch (err) {
      console.error("save vitals", err);
      toast.error("Failed to save vitals");
    }
  };

  // AI insights
  const getHealthInsights = async (vitalsPayload) => {
    try {
      setLoadingInsight(true);
      const res = await axios.post("/api/health-insights", { vitals: vitalsPayload });
      setInsight(res.data.insight || "No insight available");
    } catch (err) {
      console.error("insights", err);
      toast.error("Unable to fetch AI insights");
      setInsight("Unable to load health insights right now.");
    } finally {
      setLoadingInsight(false);
    }
  };

  // password change
  const handlePasswordChange = () => {
    if (newPassword.length < 6) {
      toast.warn("Password must be at least 6 characters");
      return;
    }
    toast.success("Password changed");
    setNewPassword("");
    setShowPasswordInput(false);
  };

  // enable location
  const enableLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        toast.success("Location enabled");
      },
      (error) => {
        console.error("geoloc", error);
        toast.error("Please enable location permission");
      }
    );
  };

  // fetch nearby hospitals
  const fetchNearbyHospitals = async (location) => {
    if (!location) {
      toast.warn("Enable location first");
      return;
    }
    try {
      setLoadingHospitals(true);
      const res = await axios.get("http://localhost:5000/api/hospitals", {
        params: { lat: location.lat, lng: location.lng, radius: 5000 }
      });
      setNearbyHospitals(res.data.results || []);
      if ((res.data.results || []).length === 0) toast.info("No hospitals found nearby");
    } catch (err) {
      console.error("fetchNearbyHospitals", err);
      toast.error("Failed to fetch nearby hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  };

  // logout
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="dashboard">
      <motion.div className="sidebar" initial={{ x: -80 }} animate={{ x: 0 }}>
        <h3 className="welcome">👋 Welcome, {userName || "User"}!</h3>

        <button className={`tab-btn ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>🏠 Home</button>
        <button className={`tab-btn ${activeTab === "add" ? "active" : ""}`} onClick={() => setActiveTab("add")}>➕ Add Vitals</button>
        <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>📜 Health History</button>
        <button className={`tab-btn ${activeTab === "info" ? "active" : ""}`} onClick={() => setActiveTab("info")}>🧠 Medical Facts</button>
        <button className={`tab-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>⚙️ Settings</button>

        <button
          className={`tab-btn ${activeTab === "hospitals" ? "active" : ""}`}
          onClick={() => {
            if (!userLocation) {
              toast.warn("Enable location first");
              return;
            }
            setActiveTab("hospitals");
            fetchNearbyHospitals(userLocation);
          }}
        >
          🏥 Nearby Hospitals
        </button>

        <button className="tab-btn logout" onClick={handleLogout}>🚪 Logout</button>
      </motion.div>

      <motion.div className="main-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        
        {/* HOME */}
        {activeTab === "home" && (
          <div>
            <h2>Welcome to AI Health Assistant 🩺</h2>
            <p>Track and analyze your vitals intelligently!</p>

            {loadingInsight ? <Loader /> : insight && (
              <motion.div className="insight-box" whileHover={{ scale: 1.03 }}>
                <h3>🧠 AI Health Insight</h3>
                <p>{insight}</p>
              </motion.div>
            )}

            <div className="chatbot-wrapper">
              <button className="hover-btn" onClick={() => setShowChatbot(!showChatbot)}>
                {showChatbot ? "Close AI Health Bot 🤖" : "Open AI Health Bot 🧠"}
              </button>

              {showChatbot && <ChatBot onClose={() => setShowChatbot(false)} />}
            </div>
          </div>
        )}

        {/* ADD */}
        {activeTab === "add" && (
          <div>
            <h2>Add Daily Vitals</h2>
            <form onSubmit={handleAddVitals}>
              <input type="number" placeholder="Blood Pressure (mmHg)" value={form.bp} onChange={(e) => setForm({ ...form, bp: e.target.value })} />
              <input type="number" placeholder="Heart Rate (bpm)" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} />
              <input type="number" placeholder="Sugar Level (mg/dL)" value={form.sugar} onChange={(e) => setForm({ ...form, sugar: e.target.value })} />
              <motion.button type="submit" whileHover={{ scale: 1.05 }} className="save-btn">💾 Save</motion.button>
            </form>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div>
            <h2>Health History</h2>
            {loadingVitals ? <Loader /> : (
              <div className="vital-history">
                {vitals.length > 0 ? vitals.map((v) => (
                  <motion.div key={v.id} className="vital-card" whileHover={{ scale: 1.03 }}>
                    <p><strong>Date:</strong> {v.date || "N/A"}</p>
                    <p>BP: {v.bp}</p>
                    <p>Heart Rate: {v.heartRate}</p>
                    <p>Sugar: {v.sugar}</p>
                  </motion.div>
                )) : <p>No vitals recorded yet.</p>}
              </div>
            )}
          </div>
        )}

        {/* INFO */}
        {activeTab === "info" && (
          <div>
            <h2>🩸 Medical Facts</h2>
            <div className="facts-container">
              {[
                "💧 Staying hydrated helps maintain blood pressure balance.",
                "🚶 Regular walks improve heart health and sugar control.",
                "😴 Good sleep reduces hypertension and stress.",
                "🥗 A balanced diet helps stabilize glucose levels.",
              ].map((fact, i) => (
                <motion.div key={i} className="fact-card" whileHover={{ scale: 1.05 }}>
                  <p>{fact}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div>
            <h2>Settings ⚙️</h2>
            <label>
              <input type="checkbox" checked={notificationsEnabled} onChange={() => {
                setNotificationsEnabled((p) => !p);
                toast.info(!notificationsEnabled ? "Notifications Enabled" : "Notifications Disabled");
              }} /> Enable Notifications
            </label>

            <div className="password-section">
              {!showPasswordInput ? (
                <motion.button whileHover={{ scale: 1.05 }} className="password-btn" onClick={() => setShowPasswordInput(true)}>🔐 Change Password</motion.button>
              ) : (
                <motion.div className="password-input-box">
                  <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <motion.button whileHover={{ scale: 1.05 }} onClick={handlePasswordChange} className="save-btn">💾 Save Password</motion.button>
                </motion.div>
              )}
            </div>

            <div className="location-section mt-4">
              <button className="hover-btn" onClick={enableLocation}>📍 Enable Location</button>
            </div>
          </div>
        )}

        {/* HOSPITAL LIST TAB */}
        {activeTab === "hospitals" && (
          <div>
            <h2>🏥 Nearby Hospitals</h2>

            <div style={{ marginTop: 12, display: "flex", gap: "10px" }}>
              <button className="hover-btn" onClick={() => fetchNearbyHospitals(userLocation)}>
                Refresh
              </button>

              <button className="hover-btn" onClick={() => setActiveTab("map")}>
                Open Map View 🗺️
              </button>
            </div>

            {loadingHospitals ? <Loader /> : null}

            {nearbyHospitals.length > 0 ? (
              <div className="hospital-list">
                {nearbyHospitals.map((h, idx) => (
                  <HospitalCard key={idx} hospital={h} />
                ))}
              </div>
            ) : !loadingHospitals ? (
              <p>No hospitals found. Make sure location is enabled.</p>
            ) : null}
          </div>
        )}

        {/* MAP VIEW */}
        {activeTab === "map" && (
          <div>
            <h2>🗺️ Nearby Hospitals - Map View</h2>

            <button className="hover-btn" onClick={() => setActiveTab("hospitals")}>
              Back to List
            </button>

            <div style={{ height: "500px", marginTop: 20 }}>
              <NearbyMap />
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
export default Dashboard;