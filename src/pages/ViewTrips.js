import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

function ViewTrips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "trips"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tripsData = [];
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() });
      });
      setTrips(tripsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Viajes Disponibles</h2>
      <div className="grid grid-cols-1 gap-4">
        {trips.map((trip) => (
          <div key={trip.id} className="p-4 bg-white rounded shadow">
            <h3 className="text-xl font-semibold">
              {trip.puntoInicio} ➡️ {trip.puntoFinal}
            </h3>
            <p>Cupos disponibles: {trip.puestosDisponibles}</p>
            <p>Hora de salida: {trip.horaSalida}</p>
            <p>Tarifa: ${trip.tarifa}</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
              Reservar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewTrips;
