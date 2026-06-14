import { RequiredDocument } from '../../types';

/** Hoja 1 — https://www.inclusion.gob.es/web/migraciones/w/estancia-por-estudios */
export const ESTANCIA_HOJA_1_DOCUMENTS: RequiredDocument[] = [
  // —— Hoja 1: Solicitud inicial ——
  {
    code: 'h1-ex00',
    name: 'Hoja 1 — Impreso EX-00 (solicitud)',
    description:
      'Hoja 1 — Desde España: impreso modelo oficial EX-00 cumplimentado y firmado. Desde fuera: solicitud de visado de estudiante en Misión Diplomática u Oficina Consular.',
  },
  {
    code: 'h1-pasaporte',
    name: 'Hoja 1 — Pasaporte o título de viaje',
    description:
      'Hoja 1 — Pasaporte o título de viaje en vigor, reconocido como válido en España, con vigencia mínima de un año. Copia y original.',
  },
  {
    code: 'h1-certificado-medico',
    name: 'Hoja 1 — Certificado médico',
    description:
      'Hoja 1 — Certificado médico conforme al Reglamento Sanitario Internacional de 2005. No exigible si solicita hallándose en España (RLOEx).',
    isOptional: true,
  },
  {
    code: 'h1-medios-economicos',
    name: 'Hoja 1 — Medios económicos',
    description:
      'Hoja 1 — Medios económicos para el período solicitado y retorno (100% IPREM mensual, salvo alojamiento prepagado).',
  },
  {
    code: 'h1-seguro-enfermedad',
    name: 'Hoja 1 — Seguro de enfermedad',
    description:
      'Hoja 1 — Seguro de enfermedad con Entidad aseguradora autorizada en España, prestaciones similares al Sistema Nacional de Salud.',
  },
  {
    code: 'h1-admision-matricula',
    name: 'Hoja 1 — Admisión y matrícula',
    description:
      'Hoja 1 — Admitido en centro de enseñanza superior o postobligatoria; derechos de inscripción o matrícula abonados.',
  },
  {
    code: 'h1-antecedentes-penales',
    name: 'Hoja 1 — Certificado de antecedentes penales',
    description:
      'Hoja 1 — Si estancia >6 meses y mayor de edad penal: certificado del país de origen o residencia de los últimos cinco años.',
    isOptional: true,
  },
  {
    code: 'h1-autorizacion-progenitores',
    name: 'Hoja 1 — Autorización de progenitores o tutor',
    description:
      'Hoja 1 — Si tiene 17 años y está a cargo de tercero sin patria potestad/tutela: autorización de progenitores o tutor exclusivo.',
    isOptional: true,
  },
  {
    code: 'h1-tasa-tramitacion',
    name: 'Hoja 1 — Justificante de tasa de tramitación',
    description: 'Hoja 1 — Justificante de la tasa por tramitación del procedimiento.',
  },
  {
    code: 'h1-tasa-visado',
    name: 'Hoja 1 — Tasa de expedición de visado',
    description:
      'Hoja 1 — Procedimiento desde fuera de España: tasa de visado abonada al solicitar en la Oficina Consular.',
    isOptional: true,
  },
  {
    code: 'h1-tie',
    name: 'Hoja 1 — Tarjeta de identidad de extranjero (TIE)',
    description:
      'Hoja 1 — Si estancia >6 meses: solicitar TIE en un mes desde entrada en España en Comisaría de Policía competente.',
    isOptional: true,
  },
  {
    code: 'h1-traduccion-legalizacion',
    name: 'Hoja 1 — Traducción jurada y legalización',
    description:
      'Hoja 1 — Documentos extranjeros traducidos por traductor jurado; legalización consular o apostilla de La Haya, salvo exención.',
    isOptional: true,
  },

  // —— Hoja 2: Familiares (sección Hoja 1 oficial) ——
  {
    code: 'h2-pasaporte-familiar',
    name: 'Hoja 2 — Pasaporte del familiar',
    description:
      'Hoja 2 — Familiares de estudiante de enseñanza superior: pasaporte en vigor (cónyuge, pareja, hijos menores, hijos mayores con discapacidad, persona de apoyo).',
    isOptional: true,
  },
  {
    code: 'h2-vinculo-familiar',
    name: 'Hoja 2 — Vínculo familiar o de parentesco',
    description:
      'Hoja 2 — Acreditación del vínculo con el titular de autorización de estancia de larga duración por estudios superiores.',
    isOptional: true,
  },
  {
    code: 'h2-medios-economicos-familia',
    name: 'Hoja 2 — Medios económicos de la unidad familiar',
    description:
      'Hoja 2 — Medios suficientes de la unidad familiar (75% IPREM primer familiar, 50% IPREM adicionales, salvo alojamiento prepagado).',
    isOptional: true,
  },
  {
    code: 'h2-seguro-enfermedad-familiar',
    name: 'Hoja 2 — Seguro de enfermedad del familiar',
    description: 'Hoja 2 — Seguro de enfermedad del familiar vinculado al estudiante.',
    isOptional: true,
  },
  {
    code: 'h2-antecedentes-penales-familiar',
    name: 'Hoja 2 — Antecedentes penales del familiar',
    description:
      'Hoja 2 — Familiar mayor de edad penal y estancia >6 meses: antecedentes penales en España y países de residencia (5 años).',
    isOptional: true,
  },
  {
    code: 'h2-discapacidad-apoyo',
    name: 'Hoja 2 — Documentación de discapacidad o apoyo',
    description:
      'Hoja 2 — Hijos mayores con necesidades de apoyo por discapacidad/enfermedad o persona de apoyo al titular con discapacidad.',
    isOptional: true,
  },
  {
    code: 'h2-tie-familiar',
    name: 'Hoja 2 — TIE del familiar',
    description:
      'Hoja 2 — Si estancia familiar >6 meses: tarjeta de identidad de extranjero en un mes desde entrada.',
    isOptional: true,
  },

  // —— Hoja 3: Prórroga (sección Hoja 1 oficial) ——
  {
    code: 'h3-pasaporte',
    name: 'Hoja 3 — Pasaporte o título de viaje (prórroga)',
    description:
      'Hoja 3 — Prórroga: pasaporte en vigor (mín. 1 año). Solicitar 2 meses antes o 3 meses después del vencimiento.',
    isOptional: true,
  },
  {
    code: 'h3-medios-economicos',
    name: 'Hoja 3 — Medios económicos (prórroga)',
    description:
      'Hoja 3 — Prórroga: medios económicos para el período y retorno (propios, familiares, becas, ayudas).',
    isOptional: true,
  },
  {
    code: 'h3-seguro-enfermedad',
    name: 'Hoja 3 — Seguro de enfermedad (prórroga)',
    description: 'Hoja 3 — Prórroga: seguro de enfermedad vigente.',
    isOptional: true,
  },
  {
    code: 'h3-matricula-continuacion',
    name: 'Hoja 3 — Matrícula y continuación de estudios',
    description:
      'Hoja 3 — Prórroga: admitido en centro, matrícula abonada y continuación de estudios acreditada. Hasta 2 prórrogas.',
    isOptional: true,
  },
  {
    code: 'h3-tasa-prorroga',
    name: 'Hoja 3 — Justificante de tasa (prórroga)',
    description:
      'Hoja 3 — Prórroga: justificante de tasa. Resolución en un mes (silencio desestimatorio).',
    isOptional: true,
  },
  {
    code: 'h3-tie-prorroga',
    name: 'Hoja 3 — TIE tras prórroga',
    description:
      'Hoja 3 — Solicitar TIE en un mes desde notificación de la prórroga.',
    isOptional: true,
  },
];
