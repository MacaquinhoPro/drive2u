// src/pages/Login.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion"; // Asegúrate de tener framer-motion instalado

function Login() {
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reiniciar el estado de error

    setIsSubmitting(true); // Iniciar el indicador de carga

    try {
      // Iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, formData.correo, formData.contraseña);

      // Mostrar notificación de éxito
      toast.success("Inicio de sesión exitoso.");

      setIsSubmitting(false); // Detener el indicador de carga

      // Redirigir a la página principal o dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Correo o contraseña incorrectos.");
      toast.error("Error al iniciar sesión: Correo o contraseña incorrectos.");
      setIsSubmitting(false); // Detener el indicador de carga en caso de error
    }
  };

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/originals/43/9c/71/439c719d3609bc7e3a64eaf51992c903.jpg')",
      }}
    >
      <motion.form
        className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded shadow-md w-full max-w-md relative"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Correo */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            className="w-full border border-gray-300 p-2 rounded"
            onChange={handleChange}
            required
            value={formData.correo}
          />
        </div>
        {/* Contraseña */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Contraseña</label>
          <input
            type="password"
            name="contraseña"
            className="w-full border border-gray-300 p-2 rounded"
            onChange={handleChange}
            required
            value={formData.contraseña}
          />
        </div>

        {/* Botón de inicio de sesión */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white p-2 rounded font-semibold ${
            isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
        </motion.button>

        {/* Enlace para registrar una nueva cuenta */}
        <div className="mt-4 text-center">
          <p>
            ¿No tienes una cuenta?{" "}
            <a
              href="/registro"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Regístrate aquí
            </a>
          </p>
        </div>

        {/* Indicador de carga */}
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12"></div>
          </div>
        )}
      </motion.form>

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

export default Login;
