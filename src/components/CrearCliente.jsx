import { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 14.634915, lng: -90.506882 }; // Centro de Guatemala

export default function CrearCliente() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [loading, setLoading] = useState(false);

  if (loadError) return <p>Error al cargar Google Maps</p>;
  if (!isLoaded) return <p>Cargando mapa...</p>;

  const handleMapClick = (e) => {
    setLatitud(e.latLng.lat());
    setLongitud(e.latLng.lng());
    toast.success("Ubicación seleccionada");
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    
    //  Validar que todos los campos obligatorios estén completos
    if (!nombre || !correo || !direccion || !telefono || !latitud || !longitud) {
      return toast.error("Completa todos los campos obligatorios y selecciona la ubicación");
    }
    
    setLoading(true);
    
    try {
      // 🔹 Obtener el usuario actual (supervisor logueado)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("No se pudo obtener el usuario actual. Inicia sesión nuevamente.");
      }

      // 🔹 Insertar cliente con el supervisor_id
      const { error } = await supabase.from("clientes").insert([
        { 
          nombre, 
          correo,  //  Campo obligatorio
          direccion, 
          telefono, 
          latitud, 
          longitud,
          supervisor_id: user.id
        },
      ]);
      
      if (error) throw error;

      toast.success("Cliente creado correctamente");
      
      // Limpiar formulario
      setNombre("");
      setCorreo("");
      setDireccion("");
      setTelefono("");
      setLatitud(null);
      setLongitud(null);
    } catch (err) {
      console.error("Error al crear cliente:", err);
      toast.error(err.message || "Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Crear Cliente</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del cliente *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required  //  Campo obligatorio
          />
          <p className="text-xs text-gray-500 mt-1">
            Se usará para enviar reportes de visitas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección completa"
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="1234-5678"
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Instrucción para el usuario */}
        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación en el mapa *
          </label>
          <p className="text-sm text-gray-600 mb-2">
             Haz clic en el mapa para seleccionar la ubicación del cliente
          </p>

          {/* Mapa */}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15}
            center={latitud && longitud ? { lat: latitud, lng: longitud } : defaultCenter}
            onClick={handleMapClick}
          >
            {latitud && longitud && <Marker position={{ lat: latitud, lng: longitud }} />}
          </GoogleMap>

          {/* Mostrar coordenadas seleccionadas */}
          {latitud && longitud && (
            <div className="bg-blue-50 p-3 rounded mt-2">
              <p className="text-sm text-gray-700">
                <strong>Coordenadas seleccionadas:</strong> {latitud.toFixed(6)}, {longitud.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleCrearCliente}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full font-medium"
        >
          {loading ? "Creando..." : "Crear Cliente"}
        </button>
      </div>
    </div>
  );
}