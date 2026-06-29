/**
 * Configuración central de datos de negocio (resuelve BP-2: datos
 * hardcodeados y repetidos en el sitio actual). Fuente única de verdad
 * para nombre, contacto y sucursales, reutilizada en toda la UI y el SEO.
 */
export const SITE = {
  name: "Labocenter",
  description:
    "Laboratorio clínico y centro de diagnóstico por imágenes. Exámenes oportunos, confiables y de calidad.",
  phone: "+56226112700",
  whatsapp: "56997716818",
  email: "call-center@labocenter.cl",
  branches: [
    {
      slug: "providencia",
      name: "Providencia",
      address: "José Manuel Infante 146, Providencia, Santiago",
    },
    {
      slug: "rancagua",
      name: "Rancagua",
      address: "Astorga 145, Rancagua",
    },
  ],
} as const;

/**
 * Construye un enlace de WhatsApp correcto (resuelve BP-1: el sitio actual
 * generaba enlaces malformados con corchetes que rompían el clic).
 */
export function whatsappLink(message = "¡Hola Labocenter! Quisiera realizar una consulta."): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}
