import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

function CreateTrip() {
  const [tripData, setTripData] = useState({
    puntoInicio: "",
    puntoFinal: "",
    ruta: "",
    horaSalida: "",
    puestosDisponibles: "",
    tarifa: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "trips"), tripData);
      // Mostrar mensaje de éxito o redirigir
    } catch (error) {
      console.error("Error al crear viaje:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Crear Viaje</h2>
      <form onSubmit={handleSubmit}>
        {/* Campos del formulario */}
        <input
          type="text"
          placeholder="Punto de Inicio"
          className="w-full border border-gray-300 p-2 rounded mb-4"
          onChange={(e) =>
            setTripData({ ...tripData, puntoInicio: e.target.value })
          }
        />
        {/* Agrega los demás campos de forma similar */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Publicar Viaje
        </button>
      </form>
    </div>
  );
}

export default CreateTrip;
