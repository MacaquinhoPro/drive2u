// src/pages/Home.js
import React from 'react';
import { motion } from 'framer-motion'; // Asegúrate de tener framer-motion instalado
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/originals/43/9c/71/439c719d3609bc7e3a64eaf51992c903.jpg')",
      }}
    >
      <motion.div
        className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded shadow-md w-full max-w-2xl text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Drive 2 U</h1>
        <p className="text-lg mb-8">
          La mejor manera de compartir viajes y conectar con compañeros de universidad.
        </p>
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/registro')}
            className="bg-blue-500 text-white px-6 py-2 rounded font-semibold"
          >
            Regístrate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/iniciar-sesion')}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded font-semibold"
          >
            Iniciar Sesión
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
