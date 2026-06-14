import { RequiredDocument } from '../../types';
import hojasData from './hojasExigible.generated.json';

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

/** 69 hojas oficiales (1–69, sin Hoja 56; incluye 4 bis, 28 bis/ter, 35 bis, 55 bis; excluye 59–61 y 65 informativas) */
export const OFFICIAL_HOJA_CATALOG_COUNT = hojasData.catalogCount ?? 69;

/** Plantillas con DOCUMENTACIÓN EXIGIBLE verificada (una plantilla por hoja) */
export const OFFICIAL_TEMPLATE_PRESETS: OfficialTemplatePreset[] =
  hojasData.templates as OfficialTemplatePreset[];

/** Plantillas listas para importar */
export const OFFICIAL_HOJA_COUNT = OFFICIAL_TEMPLATE_PRESETS.length;

export function findOfficialPreset(id: string): OfficialTemplatePreset | undefined {
  return OFFICIAL_TEMPLATE_PRESETS.find((p) => p.id === id);
}
