import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";

export default function CreateUser() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("supervisor");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const generarPassword = () => {
    const randomPass = Math.random().toString(36).slice(-10);
    setPassword(randomPass);
    toast.success(" Contraseña generada correctamente");
  };

  const copiarPassword = () => {
    if (!password) return toast.error("Primero genera una contraseña");
    navigator.clipboard.writeText(password);
    toast.success(" Contraseña copiada");
  };

  //  MAPEO de roles a ID según la tabla
  const mapRolToId = {
    supervisor: 2,
    tecnico: 3,
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!correo || !nombre || !rol || !password) {
      toast.error(" Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    try {
      //  Obtener token del usuario actual (si la función requiere autenticación)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      //  Llamar a la Edge Function crear-usuario
      const res = await fetch(
        "https://ycmldismmvfzgbciuzvx.supabase.co/functions/v1/crear-usuario",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            email: correo,
            password,
            nombre,
            rol_id: mapRolToId[rol],
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(" Usuario creado correctamente");

      // Limpiar campos
      setNombre("");
      setCorreo("");
      setRol("supervisor");
      setPassword("");

    } catch (err) {
      console.error(err);
      toast.error(` Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          Crear Nuevo Usuario
        </h2>

        <form onSubmit={handleCreateUser} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Correo electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Rol del usuario
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg"
            >
              <option value="supervisor">Supervisor</option>
              <option value="tecnico">Técnico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Contraseña generada
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                readOnly
                className="flex-1 border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-700"
              />
              <button
                type="button"
                onClick={generarPassword}
                className="bg-green-600 text-white px-3 rounded-lg"
              >
                Generar
              </button>
              <button
                type="button"
                onClick={copiarPassword}
                className="bg-blue-600 text-white px-3 rounded-lg"
              >
                Copiar
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white text-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {loading ? "Creando usuario..." : "Crear Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
}
