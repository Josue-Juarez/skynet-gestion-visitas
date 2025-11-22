import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabaseClient";
import { API_URL } from "../config/api";
import { trackEvent } from "../analytics";

export default function FormularioReporte({ 
  visita, 
  onCancelar, 
  onExito 
}) {
  const [trabajoRealizado, setTrabajoRealizado] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleEnviarReporte = async (e) => {
  e.preventDefault();

  if (!trabajoRealizado.trim()) {
    return toast.error("Debes describir el trabajo realizado");
  }

  setEnviando(true);

  try {
    //  Guardar reporte en la base de datos
    const { error: reporteError } = await supabase
      .from("reportes_visitas")
      .insert([{
        visita_id: visita.id,
        trabajo_realizado: trabajoRealizado,
        observaciones: observaciones || null
      }]);

    if (reporteError) throw reporteError;

    // evento enviar reporte
    trackEvent("enviar_reporte", {
     cliente: visita.clienteNombre,
    });


    // 2. Cambiar estado de visita a "finalizada"
    const { error: visitaError } = await supabase
      .from("visitas")
      .update({ estado: "finalizada" })
      .eq("id", visita.id);

    // evento finalizar visita
    trackEvent("finalizar_visita", {
      cliente: visita.clienteNombre,
    });


    if (visitaError) throw visitaError;

    //  Obtener datos del técnico
    const { data: { user } } = await supabase.auth.getUser();
    const { data: tecnico } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .single();

    //  Enviar email al cliente mediante el backend
    const responseEmail = await fetch(`${API_URL}/api/reportes/enviar-reporte`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clienteNombre: visita.cliente?.nombre,
        clienteCorreo: visita.cliente?.correo,
        tecnicoNombre: tecnico?.nombre || 'Técnico',
        fechaVisita: visita.fecha,
        trabajoRealizado: trabajoRealizado,
        observaciones: observaciones,
        direccion: visita.cliente?.direccion
      })
    });

    const dataEmail = await responseEmail.json();

    if (!responseEmail.ok) {
      console.error('Error al enviar email:', dataEmail);
      toast.error('Reporte guardado pero el email no pudo enviarse');
    } else {
      toast.success(" Visita finalizada y reporte enviado al cliente");
    }
    
    // Llamar función de éxito del padre
    onExito();

  } catch (error) {
    console.error("Error al enviar reporte:", error);
    toast.error("Error al finalizar visita: " + error.message);
  } finally {
    setEnviando(false);
  }
};

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-gray-800">Reporte de Trabajo</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Qué trabajo realizaste? 
        </label>
        <textarea
          value={trabajoRealizado}
          onChange={(e) => setTrabajoRealizado(e.target.value)}
          placeholder="Describe el trabajo realizado"
          className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones adicionales (opcional)
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="..."
          className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleEnviarReporte}
          disabled={enviando}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {enviando ? "Enviando..." : " Enviar Reporte y Finalizar"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={enviando}
          className="bg-red-600 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Al enviar este reporte, se marcará la visita como finalizada 
          y se enviará un email automático al cliente ({visita.cliente?.correo}) con 
          los detalles del trabajo realizado.
        </p>
      </div>
    </div>
  );
}