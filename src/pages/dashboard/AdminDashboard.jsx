import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient"; // 
import UserList from "../../components/UserList";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  //  Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Cierra sesión en Supabase

    // Opcional: limpiar storage
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/*  Barra superior */}
      <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Panel del Administrador</h1>

        <nav className="flex gap-4 items-center">

          <Link to="/admin/dashboard" className="hover:underline">
            Inicio
          </Link>

          <Link to="/admin/create-user" className="hover:underline">
            Crear Usuario
          </Link>

          {/*  BOTÓN CERRAR SESIÓN */}
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-white"
          >
            Cerrar sesión
          </button>
        </nav>
      </header>

      {/*  Contenedor principal */}
      <main className="p-8">
        {location.pathname === "/admin/dashboard" ? (
          <UserList />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
