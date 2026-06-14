import { ESTANCIA_POR_ESTUDIOS_TEMPLATE } from './estanciaPorEstudios';

export interface OfficialTemplatePreset {
  id: string;
  label: string;
  sourceUrl: string;
  name: string;
  description: string;
  reminderIntervalDays: number;
  administrativeSilenceDays: number;
  requiredDocuments: typeof ESTANCIA_POR_ESTUDIOS_TEMPLATE.requiredDocuments;
}

export const OFFICIAL_TEMPLATE_PRESETS: OfficialTemplatePreset[] = [
  {
    id: 'estancia-por-estudios',
    label: 'Estancia por estudios — Hojas 1, 4 bis y 58',
    sourceUrl: 'https://www.inclusion.gob.es/web/migraciones/w/estancia-por-estudios',
    ...ESTANCIA_POR_ESTUDIOS_TEMPLATE,
  },
];

export function findOfficialPreset(id: string): OfficialTemplatePreset | undefined {
  return OFFICIAL_TEMPLATE_PRESETS.find((p) => p.id === id);
}
