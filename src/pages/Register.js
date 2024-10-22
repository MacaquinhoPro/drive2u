// src/pages/Register.js
import React, { useState } from "react";
import { auth, db, storage } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Importar Framer Motion para animaciones
import { motion } from "framer-motion"; // Asegúrate de tener framer-motion instalado

function Register() {
  const [userType, setUserType] = useState("pasajero");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    idUniversidad: "",
    correo: "",
    contraseña: "",
    numeroContacto: "",
    // Campos adicionales para conductor
    placa: "",
    capacidad: "",
    marca: "",
    modelo: "",
    tipoVehiculo: "Económico",
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoVehiculo, setFotoVehiculo] = useState(null);
  const [fotoVehiculoPreview, setFotoVehiculoPreview] = useState(null);
  const [fotoSOAT, setFotoSOAT] = useState(null);
  const [fotoSOATPreview, setFotoSOATPreview] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el indicador de carga
  const [currentStep, setCurrentStep] = useState(1); // Estado para el paso actual
  const navigate = useNavigate(); // Para redirigir después del registro

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Funciones para manejar la selección de imágenes y mostrar vistas previas
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleFotoVehiculoChange = (e) => {
    const file = e.target.files[0];
    setFotoVehiculo(file);
    setFotoVehiculoPreview(URL.createObjectURL(file));
  };

  const handleFotoSOATChange = (e) => {
    const file = e.target.files[0];
    setFotoSOAT(file);
    setFotoSOATPreview(URL.createObjectURL(file));
  };

  // Datos para el selector de tipo de vehículo con imágenes
  const vehicleTypes = [
    {
      value: "Económico",
      label: "Económico",
      image:
        "https://placervial.com/wp-content/uploads/2019/12/Spark-Activ-01-1024x512.png",
    },
    {
      value: "Estándar",
      label: "Estándar",
      image:
        "https://www.mazdaelsalvador.com/images/mazda-3-sedan/360/sould_red/sould_red_04.webp",
    },
    {
      value: "De lujo",
      label: "De lujo",
      image:
        "https://platform.cstatic-images.com/in/v2/stock_photos/1e36cd17-aeac-40cb-b8fe-28b27e1c305f/03e6f9ca-969c-4fb1-a73a-f5e57053169a.png",
    },
  ];

  // Funciones para manejar la navegación entre pasos
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep === 1) {
      navigate(-1); // Regresa a la página anterior
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validación básica por paso
  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!userType) {
          setError("Por favor, selecciona un tipo de usuario.");
          return false;
        }
        break;
      case 2:
        if (
          !formData.nombre ||
          !formData.apellido ||
          !formData.idUniversidad ||
          !formData.correo ||
          !formData.contraseña ||
          !formData.numeroContacto ||
          !foto
        ) {
          setError("Por favor, completa todos los campos obligatorios.");
          return false;
        }
        break;
      case 3:
        if (userType === "conductor") {
          if (
            !formData.placa ||
            !formData.capacidad ||
            !formData.marca ||
            !formData.modelo ||
            !fotoVehiculo ||
            !fotoSOAT
          ) {
            setError("Por favor, completa todos los campos obligatorios.");
            return false;
          }
        }
        break;
      default:
        break;
    }
    setError("");
    return true;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reiniciar el estado de error

    // Validar longitud de la contraseña
    if (formData.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true); // Iniciar el indicador de carga

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.correo,
        formData.contraseña
      );
      const user = userCredential.user;

      // Subir fotos a Firebase Storage y obtener URLs
      let fotoURL = "";
      let fotoVehiculoURL = "";
      let fotoSOATURL = "";

      if (foto) {
        const fotoRef = ref(storage, `users/${user.uid}/fotoPerfil`);
        await uploadBytes(fotoRef, foto);
        fotoURL = await getDownloadURL(fotoRef);
      }

      if (userType === "conductor") {
        if (fotoVehiculo) {
          const vehiculoRef = ref(storage, `users/${user.uid}/fotoVehiculo`);
          await uploadBytes(vehiculoRef, fotoVehiculo);
          fotoVehiculoURL = await getDownloadURL(vehiculoRef);
        }

        if (fotoSOAT) {
          const soatRef = ref(storage, `users/${user.uid}/fotoSOAT`);
          await uploadBytes(soatRef, fotoSOAT);
          fotoSOATURL = await getDownloadURL(soatRef);
        }
      }

      // Guardar datos en Firestore
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        userType,
        fotoURL,
        fotoVehiculoURL: userType === "conductor" ? fotoVehiculoURL : "",
        fotoSOATURL: userType === "conductor" ? fotoSOATURL : "",
      });

      // Mostrar notificación de éxito
      toast.success("Registro exitoso. Ahora puedes iniciar sesión.");

      setIsSubmitting(false); // Detener el indicador de carga

      // Redirigir al inicio de sesión después de un breve retraso
      setTimeout(() => {
        navigate("/iniciar-sesion");
      }, 2000);
    } catch (error) {
      console.error("Error al registrar:", error);
      setError(`Error: ${error.message}`);
      toast.error(`Error al registrar: ${error.message}`);
      setIsSubmitting(false); // Detener el indicador de carga en caso de error
    }
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
        className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded shadow-md w-full max-w-lg relative"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4">Registro</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Paso 1: Seleccionar Tipo de Usuario */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Selector visual para Tipo de Usuario */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Tipo de Usuario
              </label>
              <div className="flex space-x-4">
                <label
                  className={`flex-1 cursor-pointer ${
                    userType === "pasajero"
                      ? "border-blue-500 border-2"
                      : "border-gray-300 border"
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="pasajero"
                    className="hidden"
                    checked={userType === "pasajero"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <div className="p-4">
                    <img
                      src="https://media.istockphoto.com/id/1172986896/photo/man-entering-a-car.jpg?s=612x612&w=0&k=20&c=ZsbPUFJeStt_ajmloJ_JWW4pgTqOZoNBhllmNjreGJs="
                      alt="Pasajero"
                      className="mx-auto mb-2 h-32 w-32 object-cover rounded-full"
                    />
                    <p className="text-center font-semibold">Pasajero</p>
                  </div>
                </label>
                <label
                  className={`flex-1 cursor-pointer ${
                    userType === "conductor"
                      ? "border-blue-500 border-2"
                      : "border-gray-300 border"
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value="conductor"
                    className="hidden"
                    checked={userType === "conductor"}
                    onChange={(e) => setUserType(e.target.value)}
                  />
                  <div className="p-4">
                    <img
                      src="https://img.freepik.com/fotos-premium/estilo-lujo-apuesto-joven-empresario-entrando-su-coche-mientras-esta-pie-al-aire-libre_425904-404.jpg"
                      alt="Conductor"
                      className="mx-auto mb-2 h-32 w-32 object-cover rounded-full"
                    />
                    <p className="text-center font-semibold">Conductor</p>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Paso 2: Información Personal */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Campos comunes */}
            {/* Nombre */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.nombre}
              />
            </div>
            {/* Apellido */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Apellido</label>
              <input
                type="text"
                name="apellido"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.apellido}
              />
            </div>
            {/* ID Universidad */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">ID Universidad</label>
              <input
                type="text"
                name="idUniversidad"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.idUniversidad}
              />
            </div>
            {/* Correo */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Correo Corporativo
              </label>
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
            {/* Número de contacto */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Número de Contacto
              </label>
              <input
                type="tel"
                name="numeroContacto"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.numeroContacto}
              />
            </div>
            {/* Foto con vista previa */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Foto</label>
              {fotoPreview && (
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  className="mb-2 h-32 w-32 object-cover rounded-full"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleFotoChange}
                required
              />
            </div>
          </motion.div>
        )}

        {/* Paso 3: Información del Vehículo (solo para conductores) */}
        {currentStep === 3 && userType === "conductor" && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Placa del vehículo */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Placa del Vehículo
              </label>
              <input
                type="text"
                name="placa"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.placa}
              />
            </div>
            {/* Foto del vehículo con vista previa */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Foto del Vehículo
              </label>
              {fotoVehiculoPreview && (
                <img
                  src={fotoVehiculoPreview}
                  alt="Vista previa"
                  className="mb-2 h-32 w-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleFotoVehiculoChange}
                required
              />
            </div>
            {/* Capacidad del vehículo */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Capacidad del Vehículo
              </label>
              <input
                type="number"
                name="capacidad"
                min="1"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.capacidad}
              />
            </div>
            {/* Foto del SOAT con vista previa */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Foto del SOAT</label>
              {fotoSOATPreview && (
                <img
                  src={fotoSOATPreview}
                  alt="Vista previa"
                  className="mb-2 h-32 w-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleFotoSOATChange}
                required
              />
            </div>
            {/* Marca */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Marca</label>
              <input
                type="text"
                name="marca"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.marca}
              />
            </div>
            {/* Modelo */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Modelo</label>
              <input
                type="text"
                name="modelo"
                className="w-full border border-gray-300 p-2 rounded"
                onChange={handleChange}
                required
                value={formData.modelo}
              />
            </div>
            {/* Selector visual para Tipo de Vehículo */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Tipo de Vehículo
              </label>
              <div className="flex space-x-4">
                {vehicleTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex-1 cursor-pointer ${
                      formData.tipoVehiculo === type.value
                        ? "border-blue-500 border-2"
                        : "border-gray-300 border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoVehiculo"
                      value={type.value}
                      className="hidden"
                      checked={formData.tipoVehiculo === type.value}
                      onChange={handleChange}
                    />
                    <div className="p-2">
                      <img
                        src={type.image}
                        alt={type.label}
                        className="mx-auto mb-2 h-20 object-cover"
                      />
                      <p className="text-center text-sm font-semibold">
                        {type.label}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={prevStep}
            className="bg-gray-300 text-gray-700 p-2 rounded font-semibold"
          >
            Atrás
          </motion.button>

          {currentStep < 3 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                if (validateStep()) nextStep();
              }}
              className="bg-blue-500 text-white p-2 rounded font-semibold ml-auto"
            >
              Siguiente
            </motion.button>
          )}
          {(currentStep === 3 ||
            (currentStep === 2 && userType === "pasajero")) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 text-white p-2 rounded font-semibold ml-auto ${
                isSubmitting ? "bg-gray-400" : "hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </motion.button>
          )}
        </div>

        {/* Descripción al final del formulario */}
        <div className="mt-4 text-center">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/iniciar-sesion"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Inicia sesión aquí
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

export default Register;
