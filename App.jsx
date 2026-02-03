import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import NearbyHospitals from "./components/NearbyHospitals";



export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u); // Immediately set user
      setLoading(false); // Stop loading
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app" /> : <Login />} />
        <Route
          path="/app"
          element={user ? <Dashboard user={user} onSignOut={() => signOut(auth)} /> : <Navigate to="/" />}
        />
        <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
        <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
      </Routes>
    </Router>
  );
}
