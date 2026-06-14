import { RequiredDocument } from '../../types';

/** Hoja 4 — Voluntariado — https://www.inclusion.gob.es/web/migraciones/w/autorizacion-para-participacion-programa-voluntario */
export const ESTANCIA_HOJA_4_DOCUMENTS: RequiredDocument[] = [
  { code: 'h4-ex00', name: 'Impreso EX-00 (solicitud)', description: 'Hoja 4 — Impreso oficial EX-00 cumplimentado y firmado.' },
  { code: 'h4-pasaporte', name: 'Pasaporte o título de viaje', description: 'Hoja 4 — Pasaporte en vigor, reconocido en España.' },
  { code: 'h4-convenio-voluntariado', name: 'Convenio de voluntariado firmado', description: 'Hoja 4 — Convenio con organización: actividades, condiciones, horario, duración, horas, recursos (viaje, manutención, alojamiento, formación).' },
  { code: 'h4-medios-economicos', name: 'Medios económicos', description: 'Hoja 4 — Medios suficientes para estancia, retorno y familiares si aplica.' },
  { code: 'h4-seguro-enfermedad', name: 'Seguro de enfermedad', description: 'Hoja 4 — Seguro autorizado en España.' },
  { code: 'h4-antecedentes-penales', name: 'Certificado de antecedentes penales', description: 'Hoja 4 — Si estancia >6 meses y mayor de edad penal.', isOptional: true },
  { code: 'h4-autorizacion-padres', name: 'Autorización de padres o tutores', description: 'Hoja 4 — Si es menor de edad.', isOptional: true },
  { code: 'h4-tasa', name: 'Justificante de tasa', description: 'Hoja 4 — Tasa de tramitación o visado según procedimiento.' },
  { code: 'h4-tasa-visado', name: 'Tasa de visado', description: 'Hoja 4 — Procedimiento desde fuera de España.', isOptional: true },
  { code: 'h4-traduccion-legalizacion', name: 'Traducción jurada y legalización', description: 'Hoja 4 — Documentos extranjeros traducidos y legalizados.', isOptional: true },
  { code: 'h4-tie', name: 'Tarjeta de identidad de extranjero (TIE)', description: 'Hoja 4 — Si estancia >6 meses, TIE en un mes desde entrada.', isOptional: true },
  { code: 'h4-fam-vinculo', name: 'Vínculo familiar (familiares)', description: 'Hoja 4 — Familiares: cónyuge, pareja o hijos menores/discapacitados del voluntario.', isOptional: true },
  { code: 'h4-fam-medios', name: 'Medios económicos (familiares)', description: 'Hoja 4 — Familiares: medios económicos suficientes.', isOptional: true },
  { code: 'h4-fam-seguro', name: 'Seguro de enfermedad (familiares)', description: 'Hoja 4 — Familiares: seguro médico.', isOptional: true },
  { code: 'h4-pro-pasaporte', name: 'Pasaporte (prórroga)', description: 'Hoja 4 — Prórroga: pasaporte en vigor. 2 meses antes o 3 después del vencimiento.', isOptional: true },
  { code: 'h4-pro-continuacion', name: 'Continuación del servicio de voluntariado', description: 'Hoja 4 — Prórroga: acreditar continuación en las mismas condiciones.', isOptional: true },
  { code: 'h4-pro-seguro', name: 'Seguro de enfermedad (prórroga)', description: 'Hoja 4 — Prórroga: seguro vigente.', isOptional: true },
  { code: 'h4-pro-tasa', name: 'Justificante de tasa (prórroga)', description: 'Hoja 4 — Prórroga: tasa correspondiente.', isOptional: true },
];

export const ESTANCIA_HOJA_4_TEMPLATE = {
  name: 'Estancia por estudios — Hoja 4 (voluntariado)',
  description:
    'Autorización de estancia de larga duración por participación en un programa de voluntariado. Fuente: inclusion.gob.es — Hoja 4.',
  reminderIntervalDays: 10,
  administrativeSilenceDays: 60,
  requiredDocuments: ESTANCIA_HOJA_4_DOCUMENTS,
};
