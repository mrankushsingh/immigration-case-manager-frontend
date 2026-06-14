import { RequiredDocument } from '../../types';
import { ESTANCIA_HOJA_1_DOCUMENTS } from './estanciaPorEstudiosHoja1';
import { ESTANCIA_HOJA_2_DOCUMENTS } from './estanciaPorEstudiosHoja2';
import { ESTANCIA_HOJA_3_DOCUMENTS } from './estanciaPorEstudiosHoja3';
import { ESTANCIA_HOJA_4_DOCUMENTS } from './estanciaPorEstudiosHoja4';
import { ESTANCIA_HOJA_4BIS_DOCUMENTS } from './estanciaPorEstudiosHoja4bis';
import { ESTANCIA_HOJA_58_DOCUMENTS } from './estanciaPorEstudiosHoja58';

/** Detailed document lists keyed by catalog id (e.g. "1", "4bis", "58") */
const DETAILED_DOCUMENTS: Record<string, RequiredDocument[]> = {
  '1': ESTANCIA_HOJA_1_DOCUMENTS,
  '2': ESTANCIA_HOJA_2_DOCUMENTS,
  '3': ESTANCIA_HOJA_3_DOCUMENTS,
  '4': ESTANCIA_HOJA_4_DOCUMENTS,
  '4bis': ESTANCIA_HOJA_4BIS_DOCUMENTS,
  '58': ESTANCIA_HOJA_58_DOCUMENTS,
};

function slugPrefix(id: string): string {
  return `h${id.replace(/[^a-z0-9]/gi, '')}`;
}

/** Standard documentación exigible pattern from inclusion.gob.es hojas informativas */
export function defaultHojaDocuments(id: string, title: string): RequiredDocument[] {
  const p = slugPrefix(id);
  const label = `Hoja ${id}`;
  return [
    {
      code: `${p}-solicitud`,
      name: 'Impreso de solicitud (modelo oficial)',
      description: `${label} — Formulario EX oficial cumplimentado y firmado según el procedimiento.`,
    },
    {
      code: `${p}-pasaporte`,
      name: 'Pasaporte, título de viaje o documento de identidad',
      description: `${label} — Copia y exhibición del original. Pasaporte en vigor cuando aplique.`,
    },
    {
      code: `${p}-requisitos`,
      name: 'Documentación acreditativa de requisitos',
      description: `${label} — Documentos que acrediten el cumplimiento de los requisitos de: ${title}`,
    },
    {
      code: `${p}-tasa`,
      name: 'Justificante de tasa',
      description: `${label} — Justificante del abono de la tasa correspondiente (modelo 790 según epígrafe).`,
    },
    {
      code: `${p}-antecedentes`,
      name: 'Certificado de antecedentes penales',
      description: `${label} — Si el procedimiento lo exige (estancia/residencia >6 meses y mayor de edad penal).`,
      isOptional: true,
    },
    {
      code: `${p}-seguro`,
      name: 'Seguro médico o de enfermedad',
      description: `${label} — Cuando el procedimiento exija seguro autorizado en España.`,
      isOptional: true,
    },
    {
      code: `${p}-medios`,
      name: 'Medios económicos',
      description: `${label} — Acreditación de medios económicos suficientes cuando sea requisito.`,
      isOptional: true,
    },
    {
      code: `${p}-tie`,
      name: 'Tarjeta de identidad de extranjero (TIE)',
      description: `${label} — Solicitar TIE en un mes desde entrada o concesión si estancia >6 meses.`,
      isOptional: true,
    },
    {
      code: `${p}-traduccion`,
      name: 'Traducción jurada y legalización',
      description: `${label} — Documentos extranjeros traducidos por traductor jurado y legalizados/apostillados.`,
      isOptional: true,
    },
  ];
}

export function getDocumentsForHoja(id: string, title: string): RequiredDocument[] {
  return DETAILED_DOCUMENTS[id] ?? defaultHojaDocuments(id, title);
}
