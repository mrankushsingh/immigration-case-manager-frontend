import { RequiredDocument } from '../../types';

const DEFAULT = { reminderIntervalDays: 10, administrativeSilenceDays: 60 };

/** Hoja 1 oficial — estudios, familiares y prórroga (una sola hoja) */
export const ESTANCIA_HOJA_1_DOCUMENTS: RequiredDocument[] = [
  // Solicitud inicial
  { code: 'h1-ex00', name: 'Impreso EX-00 (solicitud)', description: 'Hoja 1 — Solicitud: EX-00 desde España o visado de estudiante desde consulado.' },
  { code: 'h1-pasaporte', name: 'Pasaporte o título de viaje', description: 'Hoja 1 — Solicitud: pasaporte en vigor, mínimo 1 año de validez.' },
  { code: 'h1-certificado-medico', name: 'Certificado médico', description: 'Hoja 1 — Solicitud: RSI 2005. No exigible si solicita desde España (RLOEx).', isOptional: true },
  { code: 'h1-medios-economicos', name: 'Medios económicos', description: 'Hoja 1 — Solicitud: 100% IPREM mensual (salvo alojamiento prepagado) y retorno.' },
  { code: 'h1-seguro-enfermedad', name: 'Seguro de enfermedad', description: 'Hoja 1 — Solicitud: seguro autorizado en España, prestaciones similares al SNS.' },
  { code: 'h1-admision-matricula', name: 'Admisión y matrícula', description: 'Hoja 1 — Solicitud: admitido en centro superior o postobligatoria; matrícula abonada.' },
  { code: 'h1-antecedentes-penales', name: 'Certificado de antecedentes penales', description: 'Hoja 1 — Solicitud: si estancia >6 meses y mayor de edad penal.', isOptional: true },
  { code: 'h1-autorizacion-progenitores', name: 'Autorización de progenitores o tutor', description: 'Hoja 1 — Solicitud: si tiene 17 años a cargo de tercero sin patria potestad.', isOptional: true },
  { code: 'h1-tasa-tramitacion', name: 'Justificante de tasa de tramitación', description: 'Hoja 1 — Solicitud: tasa del procedimiento.' },
  { code: 'h1-tasa-visado', name: 'Tasa de expedición de visado', description: 'Hoja 1 — Solicitud desde fuera de España.', isOptional: true },
  { code: 'h1-tie', name: 'Tarjeta de identidad de extranjero (TIE)', description: 'Hoja 1 — Solicitud: si estancia >6 meses, en un mes desde entrada.', isOptional: true },
  { code: 'h1-traduccion-legalizacion', name: 'Traducción jurada y legalización', description: 'Hoja 1 — Solicitud: traducción jurada y legalización/apostilla.', isOptional: true },
  // Familiares (sección Hoja 1)
  { code: 'h1-fam-pasaporte', name: 'Pasaporte del familiar', description: 'Hoja 1 — Familiares: pasaporte del cónyuge, pareja, hijos o persona de apoyo.', isOptional: true },
  { code: 'h1-fam-vinculo', name: 'Vínculo familiar o de parentesco', description: 'Hoja 1 — Familiares: acreditación del vínculo con el estudiante.', isOptional: true },
  { code: 'h1-fam-medios', name: 'Medios económicos de la unidad familiar', description: 'Hoja 1 — Familiares: 75% IPREM primer familiar, 50% adicionales.', isOptional: true },
  { code: 'h1-fam-seguro', name: 'Seguro de enfermedad del familiar', description: 'Hoja 1 — Familiares: seguro del familiar.', isOptional: true },
  { code: 'h1-fam-antecedentes', name: 'Antecedentes penales del familiar', description: 'Hoja 1 — Familiares: mayor edad penal y estancia >6 meses.', isOptional: true },
  { code: 'h1-fam-discapacidad', name: 'Documentación de discapacidad o apoyo', description: 'Hoja 1 — Familiares: hijos mayores con apoyo o persona de apoyo.', isOptional: true },
  { code: 'h1-fam-tie', name: 'TIE del familiar', description: 'Hoja 1 — Familiares: TIE si estancia >6 meses.', isOptional: true },
  // Prórroga (sección Hoja 1)
  { code: 'h1-pro-pasaporte', name: 'Pasaporte (prórroga)', description: 'Hoja 1 — Prórroga: pasaporte en vigor (mín. 1 año). 2 meses antes o 3 después del vencimiento.', isOptional: true },
  { code: 'h1-pro-medios', name: 'Medios económicos (prórroga)', description: 'Hoja 1 — Prórroga: medios para el período y retorno.', isOptional: true },
  { code: 'h1-pro-seguro', name: 'Seguro de enfermedad (prórroga)', description: 'Hoja 1 — Prórroga: seguro vigente.', isOptional: true },
  { code: 'h1-pro-matricula', name: 'Matrícula y continuación de estudios', description: 'Hoja 1 — Prórroga: matrícula y continuación acreditada. Hasta 2 prórrogas.', isOptional: true },
  { code: 'h1-pro-tasa', name: 'Justificante de tasa (prórroga)', description: 'Hoja 1 — Prórroga: tasa. Resolución en 1 mes.', isOptional: true },
  { code: 'h1-pro-tie', name: 'TIE tras prórroga', description: 'Hoja 1 — Prórroga: TIE en un mes desde notificación.', isOptional: true },
];

export const ESTANCIA_HOJA_1_TEMPLATE = {
  name: 'Hoja 1 — Autorización de estancia de larga duración para estudios superiores o educación secundaria postobligatoria. Familiares. Prórroga',
  description:
    'Autorización de estancia para estudios superiores o educación secundaria postobligatoria, incluye familiares y prórroga. Fuente: inclusion.gob.es — Hoja 1.',
  ...DEFAULT,
  requiredDocuments: ESTANCIA_HOJA_1_DOCUMENTS,
};
