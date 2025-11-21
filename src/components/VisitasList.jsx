// src/components/VisitasList.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { generarPDFVisita } from "./Generarpdf";
import { trackEvent } from "../analytics";




export default function VisitasList() {
  const [visitas, setVisitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const visitasSubscription = supabase
      .channel("public:visitas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitas" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(visitasSubscription);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: visitasData } = await supabase
        .from("visitas")
        .select("*")
        .order("fecha", { ascending: false });

      const { data: clientesData } = await supabase.from("clientes").select("*");

      const { data: tecnicosData } = await supabase
        .from("profiles")
        .select("*")
        .eq("rol_id", 3);

      const visitasConNombres = visitasData.map((v) => {
        const cliente = clientesData.find((c) => c.id === v.cliente_id);
        const tecnico = tecnicosData.find((t) => t.id === v.tecnico_id);

        return {
          ...v,
          clienteNombre: cliente?.nombre || "Desconocido",
          clienteDireccion: cliente?.direccion || "",
          clienteTelefono: cliente?.telefono || "",
          clienteCorreo: cliente?.correo || "",
          tecnicoNombre: tecnico?.nombre || "Desconocido",
        };
      });

      setClientes(clientesData);
      setTecnicos(tecnicosData);
      setVisitas(visitasConNombres);
    } catch (err) {
      console.error(" Error:", err);
      toast.error("Error al cargar visitas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Lista de Visitas</h2>

      {loading ? (
        <p className="text-gray-500 italic">Cargando visitas...</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Fecha</th>
              <th>Técnico</th>
              <th>Estado</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {visitas.length > 0 ? (
              visitas.map((v) => (
                <tr key={v.id} className="border-b">
                  <td>{v.clienteNombre}</td>
                  <td>{v.clienteDireccion}</td>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td>{v.tecnicoNombre}</td>
                  <td>{v.estado}</td>

                  {/* Botón PDF */}
                  <td>
                    {v.estado === "finalizada" && (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                        onClick={async () => {
                          trackEvent("generar_pdf", {
                          category: "Reportes",
                          cliente: v.clienteNombre,
                          event_label: "Generar PDF"
                        });
                        await generarPDFVisita(v);
                      }}
                    >
                      PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500 italic">
                  No hay visitas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
