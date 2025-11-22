import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "../config/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  //  Obtener lista de usuarios desde el backend
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users`);
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error(" Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario (desde backend)
  const deleteUser = async (id) => {
    const confirmDelete = confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/delete-user/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success(" Usuario eliminado correctamente");
      fetchUsers(); // recarga lista
    } catch (err) {
      console.error(err);
      toast.error(" Error al eliminar usuario");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-500">Administra los usuarios del sistema</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 italic">Cargando usuarios...</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-3 px-2">Nombre</th>
              <th className="py-3 px-2">Correo</th>
              <th className="py-3 px-2">Rol</th>
              <th className="py-3 px-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 font-medium text-gray-800">{user.nombre}</td>
                  <td className="py-3 px-2 text-gray-600">{user.correo}</td>
                  <td className="py-3 px-2 text-gray-600">{user.rol}</td>
                  <td className="py-3 px-2 flex justify-center gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                      onClick={() => alert(`Editar usuario: ${user.nombre}`)}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500 italic">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserList;
