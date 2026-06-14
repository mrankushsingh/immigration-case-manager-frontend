import { RequiredDocument } from '../../types';
import { ESTANCIA_HOJA_1_DOCUMENTS } from './estanciaPorEstudiosHoja1';
import { ESTANCIA_HOJA_4BIS_DOCUMENTS } from './estanciaPorEstudiosHoja4bis';
import { ESTANCIA_HOJA_58_DOCUMENTS } from './estanciaPorEstudiosHoja58';

/**
 * Estancia por estudios — todas las hojas oficiales:
 * - Hoja 1 (incl. secciones Hoja 2 familiares y Hoja 3 prórroga)
 * - Hoja 4 bis (acceso al empleo)
 * - Hoja 58 (modificaciones tras estudios)
 */
export const ESTANCIA_POR_ESTUDIOS_ALL_HOJAS_DOCUMENTS: RequiredDocument[] = [
  ...ESTANCIA_HOJA_1_DOCUMENTS,
  ...ESTANCIA_HOJA_4BIS_DOCUMENTS,
  ...ESTANCIA_HOJA_58_DOCUMENTS,
];

export const ESTANCIA_POR_ESTUDIOS_TEMPLATE = {
  name: 'Estancia por estudios (Hojas 1, 4 bis y 58)',
  description:
    'Plantilla completa según inclusion.gob.es: Hoja 1 (solicitud, familiares, prórroga), Hoja 4 bis (trabajo compatible con estudios) y Hoja 58 (modificaciones a residencia/trabajo, reagrupación, búsqueda de empleo).',
  reminderIntervalDays: 10,
  administrativeSilenceDays: 60,
  requiredDocuments: ESTANCIA_POR_ESTUDIOS_ALL_HOJAS_DOCUMENTS,
};

/** @deprecated Use ESTANCIA_POR_ESTUDIOS_TEMPLATE — kept for backwards compatibility */
export { ESTANCIA_HOJA_1_DOCUMENTS };
