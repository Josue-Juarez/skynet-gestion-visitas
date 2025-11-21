import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { trackEvent } from "../analytics";
export default function CrearVisita() {

  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchClientes();
    fetchTecnicos();
  }, []);

  const fetchClientes = async () => {
    setLoadingData(true);
    //  Los clientes ya se filtran automáticamente por RLS
    // Solo se ven los clientes del supervisor logueado
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nombre", { ascending: true });
    
    if (error) {
      console.error("Error al cargar clientes:", error);
      toast.error("Error al cargar clientes");
    } else {
      setClientes(data || []);
    }
    setLoadingData(false);
  };

  const fetchTecnicos = async () => {
    //  Obtener solo técnicos activos (rol_id = 3)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nombre, correo")  
      .eq("rol_id", 3)
      .order("nombre", { ascending: true });
    
    if (error) {
      console.error("Error al cargar técnicos:", error);
      console.error("Detalles del error:", error.message);
      toast.error("Error al cargar técnicos");
    } else {
      console.log("✅ Técnicos cargados:", data);
      setTecnicos(data || []);
      
      if (!data || data.length === 0) {
        toast.error("No hay técnicos registrados en el sistema");
      }
    }
  };

  const handleCrearVisita = async (e) => {
    e.preventDefault();

    if (!clienteId || !tecnicoId || !fecha) {
      return toast.error("Completa todos los campos obligatorios");
    }

    setLoading(true);
    
    try {
      //  Obtener el usuario actual (supervisor)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("No se pudo obtener el usuario actual. Inicia sesión nuevamente.");
      }

      //  Insertar la visita con supervisor_id
      const { error } = await supabase.from("visitas").insert([
        {
          cliente_id: clienteId,
          tecnico_id: tecnicoId,
          supervisor_id: user.id,  // Asociar al supervisor
          fecha,
          descripcion: descripcion || null  // Permitir que sea opcional
        }
      ]);

      if (error) throw error;

      trackEvent("Visitas", "Crear visita", clientes.find(c => c.id === clienteId)?.nombre);

      toast.success("Visita creada correctamente");

      //  Limpiar campos
      setClienteId("");
      setTecnicoId("");
      setFecha("");
      setDescripcion("");
      
    } catch (err) {
      console.error("Error al crear visita:", err);
      toast.error(err.message || "Error al crear visita");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="bg-white p-6 rounded shadow max-w-lg mx-auto">
        <p className="text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Crear Visita</h2>
      
      <div className="space-y-4">
        {/* Selección de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente *
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona un Cliente</option>
            {clientes.length > 0 ? (
              clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} - {c.direccion}
                </option>
              ))
            ) : (
              <option disabled>No hay clientes registrados</option>
            )}
          </select>
          {clientes.length === 0 && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Primero debes crear clientes
            </p>
          )}
        </div>

        {/* Selección de Técnico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Técnico *
          </label>
          <select
            value={tecnicoId}
            onChange={(e) => setTecnicoId(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona un Técnico</option>
            {tecnicos.length > 0 ? (
              tecnicos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.correo ? `(${t.correo})` : ''}  {/* ← CAMBIO: correo en lugar de email */}
                </option>
              ))
            ) : (
              <option disabled>No hay técnicos disponibles</option>
            )}
          </select>
          {tecnicos.length === 0 && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ No hay técnicos registrados en el sistema
            </p>
          )}
        </div>

        {/* Fecha y Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe el motivo de la visita..."
            className="border border-gray-300 p-2 rounded w-full h-24 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botón de envío */}
        <button
          onClick={handleCrearVisita}
          disabled={loading || clientes.length === 0 || tecnicos.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full font-medium"
        >
          {loading ? "Creando..." : "Crear Visita"}
        </button>
      </div>
    </div>
  );
}