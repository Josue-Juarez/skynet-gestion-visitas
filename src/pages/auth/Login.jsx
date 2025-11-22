import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return setMensaje(` ${error.message}`);

    const user = data.user;

    const { data: perfil, error: perfilError } = await supabase
      .from("profiles")
      .select("rol_id")
      .eq("id", user.id)
      .single();

    if (perfilError || !perfil) {
      return setMensaje(" No se pudo obtener el rol del usuario");
    }

    switch (perfil.rol_id) {
      case 1:
        navigate("/admin/dashboard");
        break;
      case 2:
        navigate("/supervisor/dashboard");
        break;
      case 3:
        navigate("/tecnico/dashboard");
        break;
      default:
        setMensaje(" Rol no reconocido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1B2A] relative px-4">

      {/* Degradado suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-600/20 pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100">

        {/* Logo o título */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          SkyNet 
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">

          <div>
            <label className="text-gray-700 font-medium text-sm">Correo electrónico</label>
            <input
              type="email"
              className="w-full mt-1 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="usuario@empresa.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-gray-700 font-medium text-sm">Contraseña</label>
            <input
              type="password"
              className="w-full mt-1 p-3 rounded-xl bg-gray-50 border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="••••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Iniciar sesión
          </button>
        </form>

        {mensaje && (
          <p className="text-center mt-4 text-red-600 font-medium">
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
