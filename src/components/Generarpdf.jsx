import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { supabase } from "../lib/supabaseClient";

pdfMake.vfs = pdfFonts.vfs;

export async function generarPDFVisita(visita) {
  try {
    const { data: reporte, error } = await supabase
      .from("reportes_visitas")
      .select("*")
      .eq("visita_id", visita.id)
      .limit(1)
      .single();

    if (error) {
      console.error("Error al obtener reporte de visita:", error);
    }

    const fechaFormatted = new Date(visita.fecha).toLocaleString("es-GT");

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: {
        text: 'SkyNet S.A.',
        style: 'header',
        alignment: 'center',
        margin: [0, 20, 0, 0]
      },
      footer: (currentPage, pageCount) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'right',
        margin: [0, 0, 40, 0],
        fontSize: 9
      }),
      content: [
        { text: 'Reporte de Visita Técnica', style: 'title', alignment: 'center', margin: [0, 0, 0, 20] },

        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Cliente:', style: 'label' },
                { text: visita.clienteNombre },
                { text: 'Dirección:', style: 'label', margin: [0, 5, 0, 0] },
                { text: visita.clienteDireccion },
                visita.clienteTelefono && [
                  { text: 'Teléfono:', style: 'label', margin: [0, 5, 0, 0] },
                  { text: visita.clienteTelefono }
                ],
                visita.clienteCorreo && [
                  { text: 'Correo:', style: 'label', margin: [0, 5, 0, 0] },
                  { text: visita.clienteCorreo }
                ]
              ].flat()
            },
            {
              width: '50%',
              stack: [
                { text: 'Técnico Asignado:', style: 'label' },
                { text: visita.tecnicoNombre },
                { text: 'Fecha y hora de la visita programada:', style: 'label', margin: [0, 5, 0, 0] },
                { text: fechaFormatted }
              ]
            }
          ],
          columnGap: 20
        },

        { text: 'Trabajo Realizado', style: 'sectionHeader', margin: [0, 20, 0, 5] },
        { text: reporte?.trabajo_realizado || 'No registrado', margin: [0, 0, 0, 10] },

        ...(reporte?.observaciones
          ? [
              { text: 'Observaciones', style: 'sectionHeader', margin: [0, 10, 0, 5] },
              { text: reporte.observaciones }
            ]
          : [])
      ],
      styles: {
        header: { fontSize: 12, bold: true, color: '#555' },
        title: { fontSize: 18, bold: true, color: '#0B3D91' },
        label: { fontSize: 11, bold: true, color: '#0B3D91' },
        sectionHeader: { fontSize: 14, bold: true, color: '#0B3D91', decoration: 'underline' }
      },
      defaultStyle: { fontSize: 11 }
    };

    pdfMake.createPdf(docDefinition).download(`Reporte-${visita.clienteNombre}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
  }
}
