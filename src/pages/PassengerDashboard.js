// src/pages/PassengerDashboard.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Importaciones de Ant Design y Moment.js
import { DatePicker, TimePicker } from 'antd';
import moment from 'moment';

// Importación de Framer Motion
import { motion } from 'framer-motion';

// Importar CSS personalizado para Leaflet si es necesario
import L from 'leaflet';

// Configurar iconos de Leaflet (opcional)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function PassengerDashboard() {
  const [trips, setTrips] = useState([]);
  const [filters, setFilters] = useState({
    startPoint: '',
    endPoint: '',
    date: null,
    time: null,
    vehicleType: '',
  });

 const [mapCenter, setMapCenter] = useState([4.7110, -74.0721]); // Bogotá, Colombia


  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line
  }, []);

  const fetchTrips = async () => {
    const tripsRef = collection(db, 'trips');
    let q = query(tripsRef);

    // Aplicar filtros si existen
    if (filters.vehicleType) {
      q = query(q, where('vehicleType', '==', filters.vehicleType));
    }
    if (filters.startPoint) {
      q = query(q, where('startPoint', '==', filters.startPoint));
    }
    if (filters.endPoint) {
      q = query(q, where('endPoint', '==', filters.endPoint));
    }
    if (filters.date) {
      q = query(q, where('date', '==', filters.date));
    }
    if (filters.time) {
      q = query(q, where('time', '==', filters.time));
    }

    try {
      const querySnapshot = await getDocs(q);
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() });
      });
      setTrips(tripsData);
    } catch (error) {
      console.error('Error al obtener los viajes:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateChange = (date, dateString) => {
    setFilters({ ...filters, date: dateString });
  };

  const handleTimeChange = (time, timeString) => {
    setFilters({ ...filters, time: timeString });
  };

  const applyFilters = () => {
    fetchTrips();
  };

  return (
    <div className="flex">
      {/* Sidebar de filtros */}
      <div className="w-1/4 p-4 bg-white bg-opacity-90">
        <h2 className="text-xl font-bold mb-4">Filtros</h2>
        {/* Punto de inicio */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Punto de Inicio</label>
          <input
            type="text"
            name="startPoint"
            className="w-full border border-gray-300 p-2 rounded"
            onChange={handleFilterChange}
            value={filters.startPoint}
            placeholder="Ej: Plaza Mayor"
          />
        </div>
        {/* Punto de destino */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Punto de Destino</label>
          <input
            type="text"
            name="endPoint"
            className="w-full border border-gray-300 p-2 rounded"
            onChange={handleFilterChange}
            value={filters.endPoint}
            placeholder="Ej: Estadio Santiago Bernabéu"
          />
        </div>
        {/* Fecha */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Fecha</label>
          <DatePicker
            className="w-full"
            onChange={handleDateChange}
            value={filters.date ? moment(filters.date) : null}
            format="YYYY-MM-DD"
          />
        </div>
        {/* Hora */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Hora</label>
          <TimePicker
            className="w-full"
            onChange={handleTimeChange}
            value={filters.time ? moment(filters.time, 'HH:mm') : null}
            format="HH:mm"
          />
        </div>
        {/* Tipo de vehículo */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Tipo de Vehículo</label>
          <select
            name="vehicleType"
            className="w-full border border-gray-300 p-2 rounded"
            onChange={handleFilterChange}
            value={filters.vehicleType}
          >
            <option value="">Todos</option>
            <option value="Económico">Económico</option>
            <option value="Estándar">Estándar</option>
            <option value="De lujo">De lujo</option>
          </select>
        </div>
        {/* Botón para aplicar filtros */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={applyFilters}
          className="bg-blue-500 text-white p-2 rounded font-semibold w-full"
        >
          Aplicar Filtros
        </motion.button>
      </div>
      {/* Mapa */}
      <div className="w-3/4">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100vh' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Marcadores de viajes */}
          {trips.map((trip) => (
            <Marker
              key={trip.id}
              position={[trip.startLat, trip.startLng]}
            >
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
                  {/* Opcional: Botón para solicitar viaje */}
                  <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
                    Solicitar Viaje
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default PassengerDashboard;
