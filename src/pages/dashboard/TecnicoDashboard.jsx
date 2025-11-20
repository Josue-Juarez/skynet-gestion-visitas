// --- IMPORTS ---
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import FormularioReporte from "../../components/FormularioReporte";  // ← IMPORTAR

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
};

const defaultCenter = { lat: 14.634915, lng: -90.506882 };

export default function TecnicoDashboard() {
  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tecnicoInfo, setTecnicoInfo] = useState(null);
  const [visitaSeleccionada, setVisitaSeleccionada] = useState(null);
  const [mostrarFormReporte, setMostrarFormReporte] = useState(false);  

  // Obtener información del técnico
  const fetchTecnicoInfo = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Error al obtener usuario");
      navigate("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, nombre, correo, rol_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      toast.error("Error al cargar perfil");
      return;
    }

    if (profile.rol_id !== 3) {
      toast.error("Acceso denegado. No eres técnico.");
      navigate("/login");
      return;
    }

    setTecnicoInfo(profile);
    return profile.id;
  };

  const fetchVisitasHoy = async (tecnicoId) => {
    setLoading(true);

    try {
      const hoy = new Date();
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
      const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

      const { data: visitasData, error: visitasError } = await supabase
        .from("visitas")
        .select("id, fecha, estado, descripcion, cliente_id")
        .eq("tecnico_id", tecnicoId)
        .gte("fecha", inicio.toISOString())
        .lte("fecha", fin.toISOString())
        .order("fecha", { ascending: true });

      if (visitasError) throw visitasError;

      if (!visitasData || visitasData.length === 0) {
        setVisitas([]);
        setLoading(false);
        return;
      }

      const clienteIds = [...new Set(visitasData.map(v => v.cliente_id))];

      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nombre, direccion, telefono, correo, latitud, longitud")
        .in("id", clienteIds);

      if (clientesError) throw clientesError;

      const visitasCompletas = visitasData.map(visita => ({
        ...visita,
        cliente: clientesData.find(c => c.id === visita.cliente_id) || null
      }));

      setVisitas(visitasCompletas);
      
      if (visitasCompletas.length > 0) {
        setVisitaSeleccionada(visitasCompletas[0]);
      }

    } catch (error) {
      console.error("Error al cargar visitas:", error);
      toast.error("Error al cargar visitas del día");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const tecnicoId = await fetchTecnicoInfo();
      if (tecnicoId) fetchVisitasHoy(tecnicoId);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const abrirEnGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "en curso": "bg-blue-100 text-blue-800 border-blue-300",
      finalizada: "bg-green-100 text-green-800 border-green-300",
      cancelado: "bg-red-100 text-red-800 border-red-300",
    };
    return colores[estado] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: " Pendiente",
      "en curso": " En Proceso",
      finalizada: " Completada",
      cancelado: " Cancelada",
    };
    return textos[estado] || estado;
  };

  const handleIniciarVisita = async (id) => {
    try {
      await supabase.from("visitas").update({ estado: "en curso" }).eq("id", id);
      toast.success("Visita iniciada");
      fetchVisitasHoy(tecnicoInfo.id);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMostrarFormularioReporte = () => {
    setMostrarFormReporte(true);
  };

  // Callback cuando el reporte se envía exitosamente
  const handleReporteExitoso = () => {
    setMostrarFormReporte(false);
    fetchVisitasHoy(tecnicoInfo.id);
  };

  // Callback cuando se cancela el reporte
  const handleCancelarReporte = () => {
    setMostrarFormReporte(false);
  };

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Panel del Técnico</h1>
            {tecnicoInfo && (
              <p className="text-sm text-green-100">Hola, {tecnicoInfo.nombre}</p>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="bg-[#FF8A00] hover:bg-red-600 px-4 py-2 rounded text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Visitas de Hoy</h2>
        </div>

        {visitas.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow text-center">
            <p className="text-gray-500 text-lg"> No tienes visitas programadas para hoy</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LISTA DE VISITAS */}
            <div className="lg:col-span-1 space-y-4">
              {visitas.map((visita) => (
                <div
                  key={visita.id}
                  onClick={() => {
                    setVisitaSeleccionada(visita);
                    setMostrarFormReporte(false);
                  }}
                  className={`bg-white p-4 rounded-lg shadow cursor-pointer transition-all ${
                    visitaSeleccionada?.id === visita.id
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "hover:shadow-lg"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {visita.cliente?.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(visita.fecha).toLocaleTimeString("es-GT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(
                        visita.estado
                      )}`}
                    >
                      {getEstadoTexto(visita.estado)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 truncate">
                    {visita.cliente?.direccion}
                  </p>
                </div>
              ))}
            </div>

            {/* PANEL DERECHO */}
            {visitaSeleccionada && (
              <div className="lg:col-span-2 space-y-6">
                {/* INFO DEL CLIENTE */}
                <div className="bg-white p-6 rounded-xl shadow">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Detalles de la Visita
                  </h3>

                  <div className="space-y-2">
                    <p><strong>Cliente:</strong> {visitaSeleccionada.cliente?.nombre}</p>
                    <p><strong>Correo:</strong> {visitaSeleccionada.cliente?.correo}</p>
                    <p><strong>Dirección:</strong> {visitaSeleccionada.cliente?.direccion}</p>
                    <p><strong>Teléfono:</strong> {visitaSeleccionada.cliente?.telefono}</p>
                    <p><strong>Fecha programada:</strong> {new Date(visitaSeleccionada.fecha).toLocaleString("es-GT")}</p>
                    {visitaSeleccionada.descripcion && (
                      <p><strong>Descripción:</strong> {visitaSeleccionada.descripcion}</p>
                    )}
                  </div>
                </div>

                {/* MAPA */}
                {visitaSeleccionada.cliente?.latitud && (
                  <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Ubicación del Cliente</h3>

                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      zoom={15}
                      center={{
                        lat: visitaSeleccionada.cliente.latitud,
                        lng: visitaSeleccionada.cliente.longitud,
                      }}
                    >
                      <Marker
                        position={{
                          lat: visitaSeleccionada.cliente.latitud,
                          lng: visitaSeleccionada.cliente.longitud,
                        }}
                      />
                    </GoogleMap>

                    <button
                      onClick={() =>
                        abrirEnGoogleMaps(
                          visitaSeleccionada.cliente.latitud,
                          visitaSeleccionada.cliente.longitud
                        )
                      }
                      className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                       Abrir indicaciones en Google Maps
                    </button>
                  </div>
                )}

                {/* ACCIONES Y FORMULARIO */}
                <div className="bg-white p-6 rounded-xl shadow">
                  {visitaSeleccionada.estado === "pendiente" && (
                    <button
                      onClick={() => handleIniciarVisita(visitaSeleccionada.id)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                       Iniciar Visita
                    </button>
                  )}

                  {visitaSeleccionada.estado === "en curso" && !mostrarFormReporte && (
                    <button
                      onClick={handleMostrarFormularioReporte}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                       Finalizar Visita
                    </button>
                  )}

                  {/* COMPONENTE DE FORMULARIO SEPARADO */}
                  {visitaSeleccionada.estado === "en curso" && mostrarFormReporte && (
                    <FormularioReporte 
                      visita={visitaSeleccionada}
                      onCancelar={handleCancelarReporte}
                      onExito={handleReporteExitoso}
                    />
                  )}

                  {visitaSeleccionada.estado === "finalizada" && (
                    <div className="text-center py-4">
                      <p className="text-green-600 font-medium text-lg"> Visita completada</p>
                      <p className="text-sm text-gray-500 mt-1">El reporte fue enviado al cliente</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
