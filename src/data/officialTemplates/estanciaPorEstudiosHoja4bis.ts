import { RequiredDocument } from '../../types';

/** Hoja 4 bis — https://www.inclusion.gob.es/web/migraciones/w/hoja-4-bis-acceso-al-empleo-de-las-personas-titulares-de-una-autorizacion-de-estancia-de-larga-duracion-por-estudios-movilidad-de-alumnos-servicios-de-voluntariado-o-actividades-formativas */
export const ESTANCIA_HOJA_4BIS_DOCUMENTS: RequiredDocument[] = [
  // Trabajo por cuenta ajena (cuando no es automático)
  {
    code: 'h4b-cajena-ex00',
    name: 'Hoja 4 bis — EX-00 (trabajo cuenta ajena)',
    description:
      'Hoja 4 bis — Impreso EX-00 cumplimentado y firmado por el empleador. Estudios superiores: trabajo automático si compatible; resto de supuestos requiere solicitud.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-nif-representacion',
    name: 'Hoja 4 bis — NIF y representación legal del empleador',
    description:
      'Hoja 4 bis — Cuenta ajena: NIF del empleador; si persona jurídica, documento de representación legal. Persona física puede verificar identidad por SVDI.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-contrato',
    name: 'Hoja 4 bis — Contrato de trabajo (cuenta ajena)',
    description:
      'Hoja 4 bis — Copia del contrato de trabajo en modelo oficial. Máximo 30 h/semana; compatible con estudios.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-medios-empresa',
    name: 'Hoja 4 bis — Medios económicos del empleador',
    description:
      'Hoja 4 bis — Medios económicos, materiales o personales del empleador para el proyecto y obligaciones del contrato.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-pasaporte',
    name: 'Hoja 4 bis — Pasaporte del trabajador (cuenta ajena)',
    description: 'Hoja 4 bis — Copia del pasaporte completo o documento de viaje en vigor del estudiante trabajador.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-capacitacion',
    name: 'Hoja 4 bis — Capacitación y cualificación (cuenta ajena)',
    description:
      'Hoja 4 bis — Capacitación y cualificación profesional exigida; titulación homologada y colegiación si procede.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-compatibilidad',
    name: 'Hoja 4 bis — Compatibilidad estudios y trabajo (cuenta ajena)',
    description:
      'Hoja 4 bis — Documentación acreditativa de compatibilidad de los estudios con la actividad laboral.',
    isOptional: true,
  },
  {
    code: 'h4b-cajena-tasa',
    name: 'Hoja 4 bis — Tasa trabajo cuenta ajena (790-062 ep. 3.2)',
    description:
      'Hoja 4 bis — Modelo 790 código 062, epígrafe 3.2, si duración ≥6 meses. Plazo resolución: 3 meses.',
    isOptional: true,
  },

  // Trabajo por cuenta propia
  {
    code: 'h4b-cpropia-ex00',
    name: 'Hoja 4 bis — EX-00 (trabajo cuenta propia)',
    description:
      'Hoja 4 bis — Impreso EX-00 cumplimentado y firmado por el estudiante interesado.',
    isOptional: true,
  },
  {
    code: 'h4b-cpropia-pasaporte',
    name: 'Hoja 4 bis — Pasaporte (cuenta propia)',
    description: 'Hoja 4 bis — Pasaporte completo o documento de viaje en vigor.',
    isOptional: true,
  },
  {
    code: 'h4b-cpropia-capacitacion',
    name: 'Hoja 4 bis — Capacitación y cualificación (cuenta propia)',
    description:
      'Hoja 4 bis — Capacitación, cualificación profesional, homologación y colegiación si procede.',
    isOptional: true,
  },
  {
    code: 'h4b-cpropia-compatibilidad',
    name: 'Hoja 4 bis — Compatibilidad estudios y actividad (cuenta propia)',
    description:
      'Hoja 4 bis — Compatibilidad de los estudios con la actividad por cuenta propia (máx. 30 h/semana).',
    isOptional: true,
  },
  {
    code: 'h4b-cpropia-licencias',
    name: 'Hoja 4 bis — Licencias o declaración responsable (cuenta propia)',
    description:
      'Hoja 4 bis — Comercio minorista ≤750 m²: declaración responsable o comunicación previa (Ley 39/2015). Resto: licencias/autorizaciones de apertura o ejercicio profesional.',
    isOptional: true,
  },
  {
    code: 'h4b-cpropia-inversion',
    name: 'Hoja 4 bis — Inversión y viabilidad del proyecto (cuenta propia)',
    description:
      'Hoja 4 bis — Suficiencia de inversión e incidencia en empleo (autoempleo). Informe ATA, UPTA, CIAE, OPA o UATAE admisible.',
    isOptional: true,
  },
  {
    code: 'h4b-cpropia-tasa',
    name: 'Hoja 4 bis — Tasa trabajo cuenta propia (790-062 ep. 3.3)',
    description:
      'Hoja 4 bis — Modelo 790 código 062, epígrafe 3.3, si duración ≥6 meses. Plazo resolución: 3 meses.',
    isOptional: true,
  },
];
