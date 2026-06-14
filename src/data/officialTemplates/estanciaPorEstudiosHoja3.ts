import { RequiredDocument } from '../../types';

/** Hoja 3 — Movilidad de alumnos — https://www.inclusion.gob.es/web/migraciones/w/autorizacion-de-estancia-por-movilidad-de-alumnos */
export const ESTANCIA_HOJA_3_DOCUMENTS: RequiredDocument[] = [
  { code: 'h3-visado', name: 'Impreso de solicitud de visado nacional', description: 'Hoja 3 — Modelo oficial de visado nacional cumplimentado y firmado.' },
  { code: 'h3-pasaporte', name: 'Pasaporte completo en vigor', description: 'Hoja 3 — Pasaporte o título de viaje válido en España, vigencia mínima 1 año.' },
  { code: 'h3-autorizacion-padres', name: 'Autorización de padres o tutores', description: 'Hoja 3 — Menores: autorización con centro, organización y periodo de estancia.', isOptional: true },
  { code: 'h3-seguro-medico', name: 'Seguro médico', description: 'Hoja 3 — Seguro médico autorizado en España.' },
  { code: 'h3-admision-movilidad', name: 'Admisión en programa de movilidad de alumnos', description: 'Hoja 3 — Admitido como participante en movilidad para enseñanza secundaria obligatoria o postobligatoria.' },
  { code: 'h3-admision-centro', name: 'Admisión en centro de enseñanza', description: 'Hoja 3 — Admitido en centro inscrito en el Registro estatal de centros docentes no universitarios.' },
  { code: 'h3-responsabilidad-organizacion', name: 'Responsabilidad de la organización del programa', description: 'Hoja 3 — La organización o centro se responsabiliza del alumno (coste estudios, estancia y retorno).' },
  { code: 'h3-designacion-menor', name: 'Designación de persona responsable del menor', description: 'Hoja 3 — Menor: persona mayor de edad en España que se haga cargo (no progenitor/tutor).', isOptional: true },
  { code: 'h3-vinculo-menor', name: 'Vínculo familiar o tutela del menor', description: 'Hoja 3 — Certificado de nacimiento o documento de tutela.', isOptional: true },
  { code: 'h3-responsabilidad-centro', name: 'Responsabilidad del centro de enseñanza', description: 'Hoja 3 — El centro gestor se responsabiliza de costes de estudios, estancia y retorno.' },
  { code: 'h3-alojamiento', name: 'Documentación de alojamiento', description: 'Hoja 3 — Alojamiento con familia seleccionada, internado o residencia del programa.' },
  { code: 'h3-antecedentes', name: 'Certificado de antecedentes penales', description: 'Hoja 3 — Mayor edad penal y estancia >6 meses.', isOptional: true },
  { code: 'h3-tasa-visado', name: 'Tasa de expedición de visado', description: 'Hoja 3 — Tasa abonada al solicitar el visado.' },
  { code: 'h3-traduccion-legalizacion', name: 'Traducción jurada y legalización', description: 'Hoja 3 — Documentos extranjeros traducidos y legalizados/apostillados.', isOptional: true },
  { code: 'h3-tie', name: 'Tarjeta de identidad de extranjero (TIE)', description: 'Hoja 3 — Si estancia >6 meses, TIE en un mes desde entrada.', isOptional: true },
];

export const ESTANCIA_HOJA_3_TEMPLATE = {
  name: 'Estancia por estudios — Hoja 3 (movilidad de alumnos)',
  description:
    'Autorización de estancia de larga duración para participar en un programa de movilidad de alumnos (ESO/postobligatoria). Fuente: inclusion.gob.es — Hoja 3.',
  reminderIntervalDays: 10,
  administrativeSilenceDays: 60,
  requiredDocuments: ESTANCIA_HOJA_3_DOCUMENTS,
};
