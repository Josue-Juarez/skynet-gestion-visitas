import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import CreateUser from "./pages/dashboard/CreateUser";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SupervisorDashboard from "./pages/dashboard/SupervisorDashboard";
import VisitasList from "./components/VisitasList";
import CrearVisita from "./components/CrearVisita";
import CrearCliente from "./components/CrearCliente";
import ClientesList from "./components/ClientesList";
import TecnicoDashboard from "./pages/dashboard/TecnicoDashboard";
import { initAnalytics } from "./analytics";

initAnalytics();



function App() {
  return (
    <Routes>
      {/*  Redirigir raíz al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/*  Login público */}
      <Route path="/login" element={<Login />} />

      {/*  Sección protegida del administrador con subrutas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Bienvenido al Panel del Administrador
              </h2>
              <p>Desde aquí puedes gestionar usuarios y supervisar las visitas.</p>
            </div>
          }
        />
        <Route path="create-user" element={<CreateUser />} />
      </Route>

          
     <Route path="/supervisor/dashboard" element={<SupervisorDashboard />}>
      <Route path="visitas" element={<VisitasList />} />
      <Route path="asignar-visita" element={<CrearVisita />} />
      <Route path="clientes" element={<CrearCliente />} />
      <Route path="Lista-Clientes" element={<ClientesList />} />
      

    </Route>

     <Route path="/Tecnico/dashboard" element={<TecnicoDashboard/>}></Route> 


      
    </Routes>

      


  );
}

export default App;
