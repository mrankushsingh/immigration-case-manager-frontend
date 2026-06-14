/**
 * Catálogo oficial de hojas informativas 1–58 (Ministerio de Inclusión, Seguridad Social y Migraciones).
 * Fuente: https://www.inclusion.gob.es/web/migraciones/listado-completo
 */
export interface HojaCatalogEntry {
  id: string;
  number: string;
  title: string;
  sourceUrl?: string;
}

export const HOJAS_CATALOG: HojaCatalogEntry[] = [
  {
    id: '1',
    number: '1',
    title:
      'Autorización de estancia de larga duración para estudios superiores o educación secundaria postobligatoria. Familiares. Prórroga',
    sourceUrl: 'https://www.inclusion.gob.es/web/migraciones/w/estancia-por-estudios',
  },
  {
    id: '2',
    number: '2',
    title: 'Autorización de estancia de larga duración para la realización de actividades formativas',
  },
  {
    id: '3',
    number: '3',
    title: 'Autorización de estancia de larga duración para participar en un programa de movilidad de alumnos',
    sourceUrl: 'https://www.inclusion.gob.es/web/migraciones/w/autorizacion-de-estancia-por-movilidad-de-alumnos',
  },
  {
    id: '4',
    number: '4',
    title: 'Autorización de estancia de larga duración por participación en un programa de voluntariado',
    sourceUrl: 'https://www.inclusion.gob.es/web/migraciones/w/autorizacion-para-participacion-programa-voluntario',
  },
  {
    id: '4bis',
    number: '4 bis',
    title:
      'Acceso al empleo de titulares de estancia de larga duración por estudios, movilidad, voluntariado o actividades formativas',
    sourceUrl:
      'https://www.inclusion.gob.es/web/migraciones/w/hoja-4-bis-acceso-al-empleo-de-las-personas-titulares-de-una-autorizacion-de-estancia-de-larga-duracion-por-estudios-movilidad-de-alumnos-servicios-de-voluntariado-o-actividades-formativas',
  },
  {
    id: '5',
    number: '5',
    title: 'Movilidad de estudiantes dentro de la Unión Europea',
    sourceUrl: 'https://www.inclusion.gob.es/web/migraciones/w/5.-movilidad-de-estudiantes-dentro-de-la-union-europea',
  },
  { id: '6', number: '6', title: 'Autorización inicial de residencia temporal no lucrativa' },
  { id: '7', number: '7', title: 'Renovación de la autorización de residencia temporal no lucrativa' },
  { id: '8', number: '8', title: 'Autorización de residencia temporal por reagrupación familiar' },
  {
    id: '9',
    number: '9',
    title:
      'Reagrupación familiar: movilidad de familiares de residentes de larga duración-UE en otro Estado miembro de la UE',
  },
  { id: '10', number: '10', title: 'Renovación de la autorización de residencia temporal por reagrupación familiar' },
  { id: '11', number: '11', title: 'Autorización de residencia independiente de familiares reagrupados' },
  { id: '12', number: '12', title: 'Autorización inicial de residencia temporal y trabajo por cuenta ajena' },
  { id: '13', number: '13', title: 'Renovación de la autorización de residencia temporal y trabajo por cuenta ajena' },
  { id: '14', number: '14', title: 'Autorización inicial de residencia temporal y trabajo por cuenta propia' },
  { id: '15', number: '15', title: 'Renovación de la autorización de residencia temporal y trabajo por cuenta propia' },
  { id: '16', number: '16', title: 'Autorización de residencia temporal con excepción a la autorización de trabajo' },
  {
    id: '17',
    number: '17',
    title: 'Autorización de residencia temporal de la persona extranjera que ha retornado voluntariamente a su país',
  },
  { id: '18', number: '18', title: 'Autorización de residencia temporal de familiares de personas con nacionalidad española' },
  {
    id: '19',
    number: '19',
    title: 'Residencia independiente de personas con vínculos familiares con una persona de nacionalidad española',
  },
  {
    id: '20',
    number: '20',
    title: 'Autorización de residencia para búsqueda de empleo o inicio de proyecto empresarial',
  },
  { id: '21', number: '21', title: 'Autorización de residencia para prácticas' },
  { id: '22', number: '22', title: 'Nacionales andorranos y sus familiares' },
  { id: '23', number: '23', title: 'Autorización de residencia temporal y trabajo para actividades de temporada' },
  { id: '24', number: '24', title: 'Gestión colectiva de contrataciones en origen' },
  {
    id: '25',
    number: '25',
    title: 'Autorización de residencia y trabajo para la migración estable (GECCO 2025)',
  },
  {
    id: '26',
    number: '26',
    title: 'Residencia temporal y trabajo para actividades de temporada en migración circular (GECCO 2025)',
  },
  {
    id: '27',
    number: '27',
    title: 'Autorización de residencia temporal por circunstancias excepcionales. Arraigo de segunda oportunidad',
  },
  { id: '28', number: '28', title: 'Autorización de residencia temporal por circunstancias excepcionales. Arraigo social' },
  {
    id: '28bis',
    number: '28 bis',
    title:
      'Arraigo para solicitantes de protección internacional (DA 20.ª RD 1155/2024)',
  },
  {
    id: '28ter',
    number: '28 ter',
    title: 'Arraigo extraordinario (DA 21.ª RD 1155/2024)',
  },
  {
    id: '29',
    number: '29',
    title: 'Autorización de residencia temporal por circunstancias excepcionales. Arraigo sociolaboral',
  },
  {
    id: '30',
    number: '30',
    title: 'Autorización residencia temporal por circunstancias excepcionales. Arraigo socioformativo',
  },
  {
    id: '31',
    number: '31',
    title: 'Autorización de residencia temporal por circunstancias excepcionales. Arraigo familiar',
  },
  {
    id: '32',
    number: '32',
    title: 'Autorización residencia temporal por circunstancias excepcionales por razones humanitarias',
  },
  {
    id: '33',
    number: '33',
    title:
      'Residencia temporal por circunstancias excepcionales por colaboración con autoridades policiales, fiscales, judiciales o seguridad nacional',
  },
  {
    id: '34',
    number: '34',
    title:
      'Residencia temporal por circunstancias excepcionales por interés público o colaboración con la administración laboral',
  },
  {
    id: '35',
    number: '35',
    title: 'Residencia temporal y trabajo de mujeres extranjeras víctimas de violencia de género',
  },
  {
    id: '35bis',
    number: '35 bis',
    title: 'Residencia temporal y trabajo de mujeres extranjeras víctimas de violencia sexual',
  },
  {
    id: '36',
    number: '36',
    title:
      'Residencia temporal y trabajo por circunstancias excepcionales por colaborar con administraciones no policiales contra redes',
  },
  {
    id: '37',
    number: '37',
    title: 'Residencia temporal y trabajo por colaborar con autoridades policiales, fiscales o judiciales contra redes',
  },
  {
    id: '38',
    number: '38',
    title: 'Residencia temporal y trabajo por circunstancias excepcionales de víctimas de trata de seres humanos',
  },
  { id: '39', number: '39', title: 'Autorización de trabajo por cuenta propia para trabajadores transfronterizos' },
  { id: '40', number: '40', title: 'Autorización de trabajo por cuenta ajena para trabajadores transfronterizos' },
  {
    id: '41',
    number: '41',
    title: 'Autorización de residencia temporal del menor extranjero acompañado nacido en España',
  },
  {
    id: '42',
    number: '42',
    title: 'Residencia de la persona que acompaña a menor de edad o persona con discapacidad no nacida en España',
  },
  {
    id: '43',
    number: '43',
    title: 'Desplazamiento temporal de menores extranjeros con fines de tratamiento médico',
  },
  { id: '44', number: '44', title: 'Desplazamiento temporal de menores extranjeros con fines vacacionales' },
  { id: '45', number: '45', title: 'Desplazamiento temporal de menores extranjeros con fines de escolarización' },
  { id: '46', number: '46', title: 'Autorización de residencia temporal de menores no acompañados' },
  {
    id: '47',
    number: '47',
    title: 'Renovación de residencia temporal de menores no acompañados al alcanzar la mayoría de edad',
  },
  {
    id: '48',
    number: '48',
    title: 'Residencia temporal por circunstancias excepcionales del menor extranjero que alcanza la mayoría de edad',
  },
  { id: '49', number: '49', title: 'Autorización de residencia de larga duración nacional' },
  { id: '50', number: '50', title: 'Autorización de residencia de larga duración-UE' },
  {
    id: '51',
    number: '51',
    title: 'Residencia de larga duración en España del residente de larga duración-UE en otro Estado miembro de la UE',
  },
  {
    id: '52',
    number: '52',
    title:
      'Residencia de larga duración de familiares del titular de residencia de larga duración-UE concedida en otro EEMM',
  },
  { id: '53', number: '53', title: 'Recuperación de la titularidad de la autorización de residencia de larga duración nacional' },
  { id: '54', number: '54', title: 'Recuperación de la titularidad de la autorización de residencia de larga duración-UE' },
  {
    id: '55',
    number: '55',
    title:
      'Modificación desde autorizaciones de residencia temporal que habiliten a trabajar (incluidas circunstancias excepcionales y arraigos)',
  },
  {
    id: '55bis',
    number: '55 bis',
    title:
      'Modificación desde autorizaciones de residencia que no habilitaban a trabajar (incluidas circunstancias excepcionales y arraigos)',
  },
  {
    id: '57',
    number: '57',
    title:
      'Modificación desde tarjeta de residencia de familiar de ciudadano de la Unión o de familiar de persona con nacionalidad española',
  },
  {
    id: '58',
    number: '58',
    title:
      'Modificaciones desde autorizaciones de estancia por estudios superiores, enseñanza secundaria, actividades formativas o formación sanitaria especializada',
    sourceUrl:
      'https://www.inclusion.gob.es/web/migraciones/w/58.-modificaciones-desde-autorizaciones-de-estancia-por-estudios-superiores-ensenanza-secundaria-actividades-formativas-o-formacion-sanitaria-especializada',
  },
];

export const OFFICIAL_HOJA_LIST_URL = 'https://www.inclusion.gob.es/web/migraciones/listado-completo';

export const OFFICIAL_HOJA_COUNT = HOJAS_CATALOG.length;
