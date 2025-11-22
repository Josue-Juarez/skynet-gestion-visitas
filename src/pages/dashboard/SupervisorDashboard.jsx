import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

//  Componente interno: Tablero de visitas de hoy
function VisitasDeHoy() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enProceso: 0,
    completadas: 0,
    canceladas: 0
  });

  const fetchHoy = async () => {
    setLoading(true);
    
    try {
      const hoy = new Date();
      const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
      const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

      // Consulta con joins a clientes y profiles
      const { data, error } = await supabase
        .from("visitas")
        .select(`
          id,
          fecha,
          estado,
          descripcion,
          cliente_id,
          tecnico_id,
          clientes (
            nombre,
            direccion,
            latitud,
            longitud
          ),
          profiles!visitas_tecnico_id_fkey (
            nombre,
            correo
          )
        `)
        .gte("fecha", inicioDelDia.toISOString())
        .lte("fecha", finDelDia.toISOString())
        .order("fecha", { ascending: true });

      if (error) throw error;

      setVisitas(data || []);

      // Calcular estadísticas
      const stats = {
        total: data?.length || 0,
        pendientes: data?.filter(v => v.estado === "pendiente").length || 0,
        enProceso: data?.filter(v => v.estado === "en curso").length || 0,
        completadas: data?.filter(v => v.estado === "finalizada").length || 0,
        canceladas: data?.filter(v => v.estado === "cancelado").length || 0
      };
      setStats(stats);

    } catch (error) {
      console.error("Error al cargar visitas:", error);
      toast.error("Error al cargar visitas de hoy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoy();
    
    // Recargar cada 5 minutos para mantener actualizado
    const interval = setInterval(fetchHoy, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // color de los estados
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "en curso": "bg-blue-100 text-blue-800 border-blue-300",
      finalizada: "bg-green-100 text-green-800 border-green-300",
      cancelado: "bg-red-100 text-red-800 border-red-300"
    };
    return colores[estado] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: " Pendiente",
      "en curso": " En Proceso",
      finalizada: " Completada",
      cancelado: " Cancelada"
    };
    return textos[estado] || estado;
  };

  const abrirRuta = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  //cargando visitas 
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-gray-600">Cargando visitas de hoy...</p>
      </div>
    );
  }
  // Panel visitas programadas para hoy 
  return (
    <div className="space-y-6">
      {/* Título y fecha */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Visitas Programadas para Hoy</h2>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString("es-GT", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
          <button 
            onClick={fetchHoy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
             Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-gray-400">
          <p className="text-gray-600 text-sm font-medium">Total Visitas</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-xl shadow border-l-4 border-yellow-400">
          <p className="text-yellow-700 text-sm font-medium">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-800">{stats.pendientes}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl shadow border-l-4 border-blue-400">
          <p className="text-blue-700 text-sm font-medium">En Proceso</p>
          <p className="text-3xl font-bold text-blue-800">{stats.enProceso}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl shadow border-l-4 border-green-400">
          <p className="text-green-700 text-sm font-medium">Completadas</p>
          <p className="text-3xl font-bold text-green-800">{stats.completadas}</p>
        </div>
      </div>

      {/* Tabla de visitas */}
      <div className="bg-white p-6 rounded-xl shadow">
        {visitas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg"> No hay visitas programadas para hoy</p>
            <Link 
              to="/supervisor/dashboard/asignar-visita"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Nueva Visita
            </Link>
          </div>

          //Panel de  las visitas 
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Hora</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Dirección</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Técnico</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              {/* fecha programada de la visita */}
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {new Date(v.fecha).toLocaleTimeString("es-GT", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{v.clientes?.nombre}</div>
                      {v.descripcion && (
                        <div className="text-xs text-gray-500 mt-1">{v.descripcion}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                      {v.clientes?.direccion}
                    </td>
                    {/* nombre y correo asiganada a visita*/}
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{v.profiles?.nombre}</div>
                      <div className="text-xs text-gray-500">{v.profiles?.correo}</div>
                    </td>
                    {/* actualiza el estado de la visita */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(v.estado)}`}>
                        {getEstadoTexto(v.estado)}
                      </span>
                    </td>
                    {/* boton de como llegar */}
                    <td className="py-3 px-4">
                      {v.clientes?.latitud && v.clientes?.longitud && (
                        <button
                          onClick={() => abrirRuta(v.clientes.latitud, v.clientes.longitud)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                           Cómo llegar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// DASHBOARD PRINCIPAL
export default function SupervisorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Panel del Supervisor</h1>

          <nav className="flex gap-4 items-center">
            <Link to="/supervisor/dashboard" className="hover:underline hover:text-blue-200 transition-colors">
              Inicio
            </Link>
            <Link to="/supervisor/dashboard/visitas" className="hover:underline hover:text-blue-200 transition-colors">
              Visitas
            </Link>
            <Link to="/supervisor/dashboard/asignar-visita" className="hover:underline hover:text-blue-200 transition-colors">
              Crear Visita
            </Link>
            <Link to="/supervisor/dashboard/clientes" className="hover:underline hover:text-blue-200 transition-colors">
              Crear Cliente
            </Link>
            <Link to="/supervisor/dashboard/Lista-Clientes" className="hover:underline hover:text-blue-200 transition-colors">
              Ver Clientes
            </Link>

            <button
              onClick={handleLogout}
              className="ml-4 bg-[#FF8A00] hover:bg-red-600 px-4 py-2 rounded text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {location.pathname === "/supervisor/dashboard" ? (
          <VisitasDeHoy />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}