// src/pages/DriverDashboard.js
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import L from "leaflet";
import { signOut } from "firebase/auth";

// Configurar iconos de Leaflet (opcional)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Componente para seleccionar puntos en el mapa
function LocationSelector({ setStartCoords, setEndCoords }) {
  const [selectingStart, setSelectingStart] = useState(true);

  useMapEvents({
    click(e) {
      if (selectingStart) {
        setStartCoords([e.latlng.lat, e.latlng.lng]);
        setSelectingStart(false);
        toast.info("Punto de inicio seleccionado.");
        console.log("Punto de inicio seleccionado:", e.latlng.lat, e.latlng.lng);
      } else {
        setEndCoords([e.latlng.lat, e.latlng.lng]);
        toast.info("Punto de destino seleccionado.");
        console.log("Punto de destino seleccionado:", e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 p-2 rounded shadow-md z-20 pointer-events-none">
      <p className="pointer-events-auto">
        {selectingStart
          ? "Haz clic en el mapa para seleccionar el Punto de Inicio"
          : "Haz clic en el mapa para seleccionar el Punto de Destino"}
      </p>
    </div>
  );
}

function DriverDashboard() {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [trips, setTrips] = useState([]);
  const [newTrip, setNewTrip] = useState({
    startPoint: "",
    endPoint: "",
    date: "",
    time: "",
    startLat: null,
    startLng: null,
    endLat: null,
    endLng: null,
  });
  const [vehicleType, setVehicleType] = useState("");
  const [mapCenter, setMapCenter] = useState([4.7110, -74.0721]); // Bogotá, Colombia
  const [isLoadingVehicleType, setIsLoadingVehicleType] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Función para reverse geocodificar
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data && data.display_name) {
        return data.display_name;
      } else {
        throw new Error("Dirección no encontrada");
      }
    } catch (error) {
      console.error("Error al reverse geocodificar:", error);
      toast.error("Error al obtener la dirección del punto seleccionado.");
      return "";
    }
  };

  useEffect(() => {
    if (user) {
      // Obtener el tipo de vehículo desde el perfil del conductor
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setVehicleType(userData.tipoVehiculo || "");
            console.log("Tipo de Vehículo del Usuario:", userData.tipoVehiculo);
          } else {
            toast.error("No se encontró la información del usuario.");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          toast.error("Error al obtener la información del usuario.");
        } finally {
          setIsLoadingVehicleType(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line
  }, []);

  const fetchTrips = async () => {
    const tripsRef = collection(db, "trips");
    try {
      const querySnapshot = await getDocs(tripsRef);
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() });
      });
      setTrips(tripsData);
      console.log("Viajes obtenidos:", tripsData);
    } catch (error) {
      console.error("Error al obtener los viajes:", error);
      toast.error("Error al obtener los viajes.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrip({ ...newTrip, [name]: value });
    console.log(`Campo ${name} actualizado a:`, value);
  };

  const handleDateChange = (e) => {
    setNewTrip({ ...newTrip, date: e.target.value });
    console.log("Fecha actualizada a:", e.target.value);
  };

  const handleTimeChange = (e) => {
    setNewTrip({ ...newTrip, time: e.target.value });
    console.log("Hora actualizada a:", e.target.value);
  };

  const createTrip = async () => {
    // Agregar logs para depuración
    console.log("Datos del Nuevo Viaje:", newTrip);
    console.log("Tipo de Vehículo:", vehicleType);

    // Validar los campos
    if (
      !newTrip.startPoint.trim() ||
      !newTrip.endPoint.trim() ||
      !newTrip.date ||
      !newTrip.time ||
      !newTrip.startLat ||
      !newTrip.startLng ||
      !newTrip.endLat ||
      !newTrip.endLng
    ) {
      toast.error("Por favor, completa todos los campos y selecciona los puntos en el mapa.");
      console.log("Validación fallida: Faltan campos por completar.");
      return;
    }

    if (!vehicleType) {
      toast.error("No se pudo obtener el tipo de vehículo del perfil.");
      console.log("Validación fallida: vehicleType no está definido.");
      return;
    }

    try {
      const tripData = {
        ...newTrip,
        driverName: user.displayName || "Nombre del Conductor", // Asegúrate de tener displayName configurado
        vehicleType, // Se obtiene del perfil
      };

      console.log("Datos a guardar en Firestore:", tripData);

      await addDoc(collection(db, "trips"), tripData);
      fetchTrips();
      toast.success("Viaje creado exitosamente.");
      setNewTrip({
        startPoint: "",
        endPoint: "",
        date: "",
        time: "",
        startLat: null,
        startLng: null,
        endLat: null,
        endLng: null,
      });
      // Opcional: Resetear el centro del mapa si lo deseas
      setMapCenter([4.7110, -74.0721]); // Regresar al centro predeterminado
      console.log("Viaje creado y estado reiniciado.");
    } catch (error) {
      console.error("Error al crear el viaje:", error);
      toast.error("Hubo un error al crear el viaje. Por favor, intenta nuevamente.");
    }
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      } else {
        throw new Error("Dirección no encontrada");
      }
    } catch (error) {
      console.error("Error al geocodificar la dirección:", error);
      toast.error("Error al geocodificar la dirección.");
      return null;
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada exitosamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión.");
    }
  };

  // Manejar clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Manejar actualización de coordenadas y direcciones
  const handleSetStartCoords = async (coords) => {
    const [lat, lng] = coords;
    setNewTrip((prev) => ({ ...prev, startLat: lat, startLng: lng }));
    console.log("Coordenadas de Inicio Actualizadas:", lat, lng);
    // Reverse geocodificar para obtener la dirección
    const address = await reverseGeocode(lat, lng);
    if (address) {
      setNewTrip((prev) => ({ ...prev, startPoint: address }));
      console.log("Dirección de Inicio Actualizada:", address);
    }
  };

  const handleSetEndCoords = async (coords) => {
    const [lat, lng] = coords;
    setNewTrip((prev) => ({ ...prev, endLat: lat, endLng: lng }));
    console.log("Coordenadas de Destino Actualizadas:", lat, lng);
    // Reverse geocodificar para obtener la dirección
    const address = await reverseGeocode(lat, lng);
    if (address) {
      setNewTrip((prev) => ({ ...prev, endPoint: address }));
      console.log("Dirección de Destino Actualizada:", address);
    }
  };

  if (loadingAuth || isLoadingVehicleType) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  if (errorAuth) {
    return <div className="text-center mt-10">Error: {errorAuth.message}</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">Cargando...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar con Menú Desplegable */}
      <nav className="bg-gray-800 p-4 flex justify-end relative z-30">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none"
            id="menu-button"
            aria-expanded={isMenuOpen ? "true" : "false"}
            aria-haspopup="true"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Menú
            {/* Icono de flecha */}
            <svg
              className="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.353a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex="-1"
            >
              <div className="py-1" role="none">
                {/* Editar Información Personal */}
                <a
                  href="/editar-perfil"
                  className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                  id="menu-item-0"
                >
                  Editar mi información personal
                </a>
                {/* Cerrar Sesión */}
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  role="menuitem"
                  tabIndex="-1"
                  id="menu-item-1"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar para crear viajes */}
        <div className="w-1/4 p-4 bg-white bg-opacity-90 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Crear Viaje</h2>
          {/* Punto de inicio */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Punto de Inicio</label>
            <input
              type="text"
              name="startPoint"
              className="w-full border border-gray-300 p-2 rounded"
              onChange={handleInputChange}
              value={newTrip.startPoint}
              placeholder="Ej: Universidad de la Sabana"
            />
          </div>
          {/* Punto de destino */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Punto de Destino</label>
            <input
              type="text"
              name="endPoint"
              className="w-full border border-gray-300 p-2 rounded"
              onChange={handleInputChange}
              value={newTrip.endPoint}
              placeholder="Ej: Centro Comercial Santafe"
            />
          </div>
          {/* Fecha */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Fecha</label>
            <input
              type="date"
              name="date"
              className="w-full border border-gray-300 p-2 rounded"
              onChange={handleDateChange}
              value={newTrip.date}
            />
          </div>
          {/* Hora */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Hora</label>
            <input
              type="time"
              name="time"
              className="w-full border border-gray-300 p-2 rounded"
              onChange={handleTimeChange}
              value={newTrip.time}
            />
          </div>
          {/* Botón para crear viaje */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createTrip}
            className="bg-green-500 text-white p-2 rounded font-semibold w-full"
          >
            Crear Viaje
          </motion.button>
        </div>
        {/* Mapa */}
        <div className="w-3/4 relative">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100vh", zIndex: 10 }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Selector de ubicación */}
            <LocationSelector
              setStartCoords={handleSetStartCoords}
              setEndCoords={handleSetEndCoords}
            />
            {/* Marcadores de viajes existentes */}
            {trips.map((trip) => (
              <Marker key={trip.id} position={[trip.startLat, trip.startLng]}>
                <Popup>
                  <div>
                    <h3 className="font-bold">{trip.driverName}</h3>
                    <p>
                      <strong>Desde:</strong> {trip.startPoint} <br />
                      <strong>Hasta:</strong> {trip.endPoint} <br />
                      <strong>Fecha:</strong> {trip.date} <br />
                      <strong>Hora:</strong> {trip.time} <br />
                      <strong>Tipo de Vehículo:</strong> {trip.vehicleType}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {/* Marcadores para el nuevo viaje (si están seleccionados) */}
            {newTrip.startLat && newTrip.startLng && (
              <Marker position={[newTrip.startLat, newTrip.startLng]}>
                <Popup>Punto de Inicio</Popup>
              </Marker>
            )}
            {newTrip.endLat && newTrip.endLng && (
              <Marker position={[newTrip.endLat, newTrip.endLng]}>
                <Popup>Punto de Destino</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Estilos para el loader */}
      <style jsx>{`
        .loader {
          border-top-color: #3498db;
          animation: spinner 1.5s linear infinite;
        }

        @keyframes spinner {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default DriverDashboard;
