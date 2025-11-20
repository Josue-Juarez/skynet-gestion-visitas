import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";

export default function ClientesList() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error(error);
      toast.error("Error al obtener clientes");
    } else {
      setClientes(data || []);
    }
    setLoading(false);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Error al eliminar cliente");
    } else {
      toast.success("Cliente eliminado correctamente");
      fetchClientes();
    }
  };

  // Abrir Google Maps con direcciones desde ubicación actual
  const comoLlegar = (lat, lng, nombreCliente) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
    toast.success(`Abriendo ruta hacia ${nombreCliente}`);
  };

  // Ver ubicación en Google Maps (solo ver, sin ruta)
  const verEnMapa = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=17`;
    window.open(url, "_blank");
  };

  // Copiar coordenadas al portapapeles
  const copiarCoordenadas = (lat, lng, nombre) => {
    const coords = `${lat},${lng}`;
    navigator.clipboard.writeText(coords);
    toast.success(`Coordenadas de ${nombre} copiadas`);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  if (!isLoaded) return <p>Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="bg-white p-6 rounded-xl shadow max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Lista de Clientes</h2>
          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            Total: {clientes.length}
          </span>
        </div>

        {loading ? (
          <p className="text-gray-500 italic text-center py-8">Cargando clientes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Correo</th>  {/* ← AGREGADO */}
                  <th className="py-3 px-4 font-semibold text-gray-700">Teléfono</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Dirección</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Ubicación</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length > 0 ? (
                  clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-800">{cliente.nombre}</td>
                      
                      {/* ← COLUMNA NUEVA */}
                      <td className="py-3 px-4">
                        <a 
                        >
                          {cliente.correo || 'Sin correo'}
                        </a>
                      </td>

                      <td className="py-3 px-4 text-gray-700">{cliente.telefono}</td>
                      
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                        {cliente.direccion}
                      </td>

                      <td className="py-3 px-4">
                        {cliente.latitud && cliente.longitud ? (
                          <div className="flex flex-col gap-2">
                            {/* Coordenadas con botón copiar */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-mono">
                                {cliente.latitud.toFixed(6)}, {cliente.longitud.toFixed(6)}
                              </span>
                              <button
                                onClick={() => copiarCoordenadas(cliente.latitud, cliente.longitud, cliente.nombre)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Copiar coordenadas"
                              >
                                📋
                              </button>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => comoLlegar(cliente.latitud, cliente.longitud, cliente.nombre)}
                                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition-colors font-medium"
                              >
                                🧭 Cómo llegar
                              </button>
                              <button
                                onClick={() => verEnMapa(cliente.latitud, cliente.longitud)}
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700 transition-colors font-medium"
                              >
                                📍 Ver mapa
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Sin coordenadas</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleEliminar(cliente.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 italic">  {/* ← cambié de 5 a 6 columnas */}
                      No hay clientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}