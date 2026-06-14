import { RequiredDocument } from '../../types';

/** Hoja 2 — Actividades formativas — https://www.inclusion.gob.es/web/migraciones/listado-completo */
export const ESTANCIA_HOJA_2_DOCUMENTS: RequiredDocument[] = [
  { code: 'h2-ex00', name: 'Impreso EX-00 (solicitud)', description: 'Hoja 2 — Impreso oficial EX-00 cumplimentado y firmado.' },
  { code: 'h2-pasaporte', name: 'Pasaporte o título de viaje', description: 'Hoja 2 — Pasaporte en vigor, reconocido en España, vigencia mínima 1 año.' },
  { code: 'h2-certificado-medico', name: 'Certificado médico', description: 'Hoja 2 — RSI 2005 si estancia >6 meses. No exigible si solicita desde España.', isOptional: true },
  { code: 'h2-medios-economicos', name: 'Medios económicos', description: 'Hoja 2 — Medios para el período solicitado, retorno y familiares si aplica (100% IPREM).' },
  { code: 'h2-seguro-enfermedad', name: 'Seguro de enfermedad', description: 'Hoja 2 — Seguro autorizado en España con prestaciones similares al SNS.' },
  { code: 'h2-admision-formativa', name: 'Admisión en actividad formativa', description: 'Hoja 2 — Admitido en centro autorizado; certificado de profesionalidad FP grado C niv. 2/3, idiomas u otra formación no universitaria.' },
  { code: 'h2-pago-derechos', name: 'Justificante de pago de derechos', description: 'Hoja 2 — Derechos de inscripción o matrícula abonados.' },
  { code: 'h2-antecedentes-penales', name: 'Certificado de antecedentes penales', description: 'Hoja 2 — Si estancia >6 meses y mayor de edad penal.', isOptional: true },
  { code: 'h2-autorizacion-padres', name: 'Autorización de padres o tutores', description: 'Hoja 2 — Si es menor de edad.', isOptional: true },
  { code: 'h2-tasa', name: 'Justificante de tasa', description: 'Hoja 2 — Tasa de tramitación (790-052 ep. 1.1.1).' },
  { code: 'h2-tasa-visado', name: 'Tasa de visado', description: 'Hoja 2 — Procedimiento desde fuera de España.', isOptional: true },
  { code: 'h2-tie', name: 'Tarjeta de identidad de extranjero (TIE)', description: 'Hoja 2 — Si estancia >6 meses, en un mes desde entrada.', isOptional: true },
  { code: 'h2-traduccion-legalizacion', name: 'Traducción jurada y legalización', description: 'Hoja 2 — Documentos extranjeros traducidos y legalizados/apostillados.', isOptional: true },
  { code: 'h2-pro-pasaporte', name: 'Pasaporte (prórroga)', description: 'Hoja 2 — Prórroga: pasaporte en vigor. 2 meses antes o 3 después del vencimiento.', isOptional: true },
  { code: 'h2-pro-continuacion', name: 'Continuación de la actividad formativa', description: 'Hoja 2 — Prórroga: acreditar continuación con aprovechamiento. Máx. 1 prórroga.', isOptional: true },
  { code: 'h2-pro-medios', name: 'Medios económicos (prórroga)', description: 'Hoja 2 — Prórroga: medios económicos vigentes.', isOptional: true },
  { code: 'h2-pro-seguro', name: 'Seguro de enfermedad (prórroga)', description: 'Hoja 2 — Prórroga: seguro vigente.', isOptional: true },
  { code: 'h2-pro-tasa', name: 'Justificante de tasa (prórroga)', description: 'Hoja 2 — Prórroga: tasa correspondiente.', isOptional: true },
];

export const ESTANCIA_HOJA_2_TEMPLATE = {
  name: 'Estancia por estudios — Hoja 2 (actividades formativas)',
  description:
    'Autorización de estancia de larga duración para actividades formativas (certificados de profesionalidad, idiomas, formación no universitaria). Fuente: inclusion.gob.es — Hoja 2.',
  reminderIntervalDays: 10,
  administrativeSilenceDays: 60,
  requiredDocuments: ESTANCIA_HOJA_2_DOCUMENTS,
};
