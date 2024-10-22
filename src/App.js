// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PassengerDashboard from "./pages/PassengerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import CreateTrip from "./pages/CreateTrip";
import ViewTrips from "./pages/ViewTrips";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Importaciones de Firebase
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute />} />
        <Route path="/crear-viaje" element={<CreateTrip />} />
        <Route path="/ver-viajes" element={<ViewTrips />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

function ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [vehicleType, setVehicleType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en la autenticación
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Obtener el tipo de usuario y tipo de vehículo desde Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().userType);
          setVehicleType(userDoc.data().vehicleType || null);
        } else {
          setUserType(null);
          setVehicleType(null);
        }
      } else {
        setUser(null);
        setUserType(null);
        setVehicleType(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (userType === "pasajero") {
    return <PassengerDashboard />;
  } else if (userType === "conductor") {
    return <DriverDashboard vehicleType={vehicleType} />;
  } else {
    return <div className="text-center mt-10">Tipo de usuario desconocido.</div>;
  }
}

export default App;
