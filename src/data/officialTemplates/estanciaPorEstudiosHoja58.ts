import { RequiredDocument } from '../../types';

/** Hoja 58 — https://www.inclusion.gob.es/web/migraciones/w/58.-modificaciones-desde-autorizaciones-de-estancia-por-estudios-superiores-ensenanza-secundaria-actividades-formativas-o-formacion-sanitaria-especializada */
export const ESTANCIA_HOJA_58_DOCUMENTS: RequiredDocument[] = [
  // Modificación a residencia y trabajo por cuenta ajena
  {
    code: 'h58-cajena-ex26',
    name: 'Hoja 58 — EX-26 (modificación a cuenta ajena)',
    description:
      'Hoja 58 — Modificación a residencia y trabajo por cuenta ajena: impreso EX-26 firmado por titular o empleador.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-pasaporte',
    name: 'Hoja 58 — Pasaporte o cédula (cuenta ajena)',
    description: 'Hoja 58 — Copia completa del pasaporte, título de viaje o cédula de inscripción en vigor.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-titulacion',
    name: 'Hoja 58 — Certificación de estudios superados (cuenta ajena)',
    description:
      'Hoja 58 — Certificación acreditativa de haber superado los estudios o formación realizada.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-no-becado',
    name: 'Hoja 58 — Certificación de no becado (cuenta ajena)',
    description:
      'Hoja 58 — Certificación de no haber sido becado/subvencionado en cooperación al desarrollo o acción humanitaria, o declaración responsable.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-capacitacion',
    name: 'Hoja 58 — Capacitación y cualificación (cuenta ajena)',
    description:
      'Hoja 58 — Capacitación y cualificación profesional legalmente exigida; homologación si procede.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-antecedentes',
    name: 'Hoja 58 — Antecedentes penales (cuenta ajena)',
    description:
      'Hoja 58 — Certificado de antecedentes penales de países de residencia en los cinco años anteriores a la entrada en España.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-empresa',
    name: 'Hoja 58 — Documentación de la empresa (cuenta ajena)',
    description:
      'Hoja 58 — Persona jurídica: NIF, escritura de constitución inscrita, representación legal, NIF/NIE del firmante. Solvencia: IRPF, IVA, IS o VILE (3 años) y memoria descriptiva de la ocupación.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-contrato',
    name: 'Hoja 58 — Contrato de trabajo firmado (cuenta ajena)',
    description:
      'Hoja 58 — Contrato firmado por empleador y trabajador con actividad continuada; condiciones conforme a normativa laboral.',
    isOptional: true,
  },
  {
    code: 'h58-cajena-tasa',
    name: 'Hoja 58 — Tasas modificación cuenta ajena (790-052 y 790-062)',
    description:
      'Hoja 58 — Modelo 790 código 052 ep. 2.5 y 790 código 062 ep. 3.2.1. Resolución: 3 meses. Alta en Seguridad Social condiciona eficacia.',
    isOptional: true,
  },

  // Modificación a residencia y trabajo por cuenta propia
  {
    code: 'h58-cpropia-ex26',
    name: 'Hoja 58 — EX-26 (modificación a cuenta propia)',
    description: 'Hoja 58 — Modificación a residencia y trabajo por cuenta propia: EX-26 firmado por el interesado.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-pasaporte',
    name: 'Hoja 58 — Pasaporte o cédula (cuenta propia)',
    description: 'Hoja 58 — Pasaporte completo, título de viaje o cédula de inscripción en vigor.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-titulacion',
    name: 'Hoja 58 — Certificación de estudios superados (cuenta propia)',
    description: 'Hoja 58 — Certificación de haber superado estudios o formación.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-no-becado',
    name: 'Hoja 58 — Certificación de no becado (cuenta propia)',
    description: 'Hoja 58 — Certificación de no becado/subvencionado o declaración responsable.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-antecedentes',
    name: 'Hoja 58 — Antecedentes penales (cuenta propia)',
    description: 'Hoja 58 — Antecedentes penales de países de residencia (5 años anteriores a entrada).',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-licencias',
    name: 'Hoja 58 — Licencias o declaración responsable (cuenta propia)',
    description:
      'Hoja 58 — Comercio ≤750 m²: declaración responsable/comunicación previa. Resto: autorizaciones/licencias de apertura o ejercicio profesional.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-capacitacion',
    name: 'Hoja 58 — Capacitación, homologación y colegiación (cuenta propia)',
    description:
      'Hoja 58 — Capacitación, cualificación, homologación/reconocimiento y colegiación en profesiones reguladas.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-inversion',
    name: 'Hoja 58 — Inversión y viabilidad del proyecto (cuenta propia)',
    description:
      'Hoja 58 — Suficiencia de inversión e incidencia en empleo. Informe ATA, UPTA, CIAE, OPA o UATAE admisible.',
    isOptional: true,
  },
  {
    code: 'h58-cpropia-tasa',
    name: 'Hoja 58 — Tasas modificación cuenta propia (790-052 y 790-062)',
    description: 'Hoja 58 — Modelo 790-052 ep. 2.5 y 790-062 ep. 3.2.1. Resolución: 3 meses.',
    isOptional: true,
  },

  // Modificación a residencia con excepción de trabajo
  {
    code: 'h58-excepcion-ex26',
    name: 'Hoja 58 — EX-26 (residencia con excepción de trabajo)',
    description:
      'Hoja 58 — Modificación a residencia temporal con excepción a autorización de trabajo: EX-26 firmado.',
    isOptional: true,
  },
  {
    code: 'h58-excepcion-pasaporte',
    name: 'Hoja 58 — Pasaporte o cédula (excepción de trabajo)',
    description: 'Hoja 58 — Copia completa del pasaporte, título de viaje o cédula de inscripción.',
    isOptional: true,
  },
  {
    code: 'h58-excepcion-titulacion',
    name: 'Hoja 58 — Certificación de estudios superados (excepción de trabajo)',
    description: 'Hoja 58 — Certificación de haber superado estudios o formación.',
    isOptional: true,
  },
  {
    code: 'h58-excepcion-supuesto',
    name: 'Hoja 58 — Documentación del supuesto de excepción de trabajo',
    description:
      'Hoja 58 — Invitación/contrato (técnicos, docentes, corresponsales, misiones científicas, religiosos, etc.) según supuesto aplicable.',
    isOptional: true,
  },
  {
    code: 'h58-excepcion-tasa',
    name: 'Hoja 58 — Tasa modificación excepción de trabajo (790-052 ep. 2.5)',
    description: 'Hoja 58 — Modelo 790 código 052 epígrafe 2.5. Resolución: 2 meses.',
    isOptional: true,
  },

  // Modificación a reagrupación familiar (familiares en estancia)
  {
    code: 'h58-reagrupacion-ex26',
    name: 'Hoja 58 — EX-26 (reagrupación familiar de familiar de estudiante)',
    description:
      'Hoja 58 — Residencia temporal por reagrupación a favor de familiares en estancia como familiar de estudiante: EX-26.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-pasaporte',
    name: 'Hoja 58 — Pasaporte (reagrupación familiar)',
    description: 'Hoja 58 — Copia completa del pasaporte en vigor o título de viaje.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-titulacion',
    name: 'Hoja 58 — Certificación de estudios superados (reagrupación)',
    description: 'Hoja 58 — Certificación de haber superado estudios o formación del titular.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-vinculo',
    name: 'Hoja 58 — Vínculos familiares (reagrupación)',
    description:
      'Hoja 58 — Cónyuge, pareja estable, hijos menores o mayores con discapacidad conviviendo con el titular.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-seguro',
    name: 'Hoja 58 — Seguro médico (reagrupación familiar)',
    description: 'Hoja 58 — Seguro médico del familiar o acreditación de cobertura.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-medios',
    name: 'Hoja 58 — Medios económicos (reagrupación familiar)',
    description: 'Hoja 58 — Medios económicos del familiar o del residente titular.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-vivienda',
    name: 'Hoja 58 — Vivienda adecuada (reagrupación familiar)',
    description: 'Hoja 58 — Documentación de disponibilidad de vivienda adecuada.',
    isOptional: true,
  },
  {
    code: 'h58-reagrupacion-tasa',
    name: 'Hoja 58 — Tasa reagrupación familiar (790-052 ep. 2.5)',
    description:
      'Hoja 58 — Modelo 790-052 ep. 2.5. Solicitar 2 meses antes o 3 meses después de extinción de estancia o titulación.',
    isOptional: true,
  },

  // Modificación a búsqueda de empleo / emprender (Ley 14/2013)
  {
    code: 'h58-busqueda-ex26',
    name: 'Hoja 58 — EX-26 (búsqueda de empleo o emprender)',
    description:
      'Hoja 58 — Residencia para búsqueda de empleo o emprender proyecto (grado Nivel 6 MEC, máx. 24 meses): EX-26.',
    isOptional: true,
  },
  {
    code: 'h58-busqueda-antecedentes',
    name: 'Hoja 58 — Antecedentes penales (búsqueda de empleo)',
    description:
      'Hoja 58 — Si estancia por estudios fue <6 meses: certificado de antecedentes penales del país de origen o residencia (5 años).',
    isOptional: true,
  },
  {
    code: 'h58-busqueda-tasa',
    name: 'Hoja 58 — Tasa búsqueda de empleo (790-052 ep. 2.5)',
    description:
      'Hoja 58 — Modelo 790-052 ep. 2.5. Resolución: 20 días (silencio estimatorio). No autoriza a trabajar durante la vigencia.',
    isOptional: true,
  },

  // TIE común tras modificaciones Hoja 58
  {
    code: 'h58-tie',
    name: 'Hoja 58 — TIE tras modificación',
    description:
      'Hoja 58 — Solicitar TIE en un mes desde alta en Seguridad Social o entrada en vigor de la autorización, según procedimiento.',
    isOptional: true,
  },
];

export const ESTANCIA_HOJA_58_TEMPLATE = {
  name: 'Estancia por estudios — Hoja 58 (modificaciones)',
  description:
    'Modificaciones desde estancia por estudios: residencia y trabajo (cuenta ajena/propia), excepción de trabajo, reagrupación familiar y búsqueda de empleo. Fuente: inclusion.gob.es — Hoja 58.',
  reminderIntervalDays: 10,
  administrativeSilenceDays: 60,
  requiredDocuments: ESTANCIA_HOJA_58_DOCUMENTS,
};
