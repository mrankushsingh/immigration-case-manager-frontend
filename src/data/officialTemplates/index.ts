import { RequiredDocument } from '../../types';
import { getDocumentsForHoja } from './hojaDocuments';
import { HOJAS_CATALOG, OFFICIAL_HOJA_LIST_URL, OFFICIAL_HOJA_COUNT } from './hojasCatalog';

export interface OfficialTemplatePreset {
  id: string;
  label: string;
  sourceUrl: string;
  name: string;
  description: string;
  reminderIntervalDays: number;
  administrativeSilenceDays: number;
  requiredDocuments: RequiredDocument[];
}

const DEFAULT_INTERVALS = { reminderIntervalDays: 10, administrativeSilenceDays: 60 };

function buildPreset(entry: (typeof HOJAS_CATALOG)[number]): OfficialTemplatePreset {
  const name = `Hoja ${entry.number} — ${entry.title}`;
  return {
    id: `hoja-${entry.id}`,
    label: `Hoja ${entry.number}`,
    sourceUrl: entry.sourceUrl ?? OFFICIAL_HOJA_LIST_URL,
    name,
    description: `Hoja informativa oficial ${entry.number}. ${entry.title}. Fuente: inclusion.gob.es`,
    ...DEFAULT_INTERVALS,
    requiredDocuments: getDocumentsForHoja(entry.id, entry.title),
  };
}

/** Todas las hojas informativas oficiales numeradas 1–58 (incluye 4 bis, 28 bis/ter, 35 bis, 55 bis; no existe Hoja 56) */
export const OFFICIAL_TEMPLATE_PRESETS: OfficialTemplatePreset[] = HOJAS_CATALOG.map(buildPreset);

export { OFFICIAL_HOJA_COUNT, OFFICIAL_HOJA_LIST_URL };

export function findOfficialPreset(id: string): OfficialTemplatePreset | undefined {
  return OFFICIAL_TEMPLATE_PRESETS.find((p) => p.id === id);
}
