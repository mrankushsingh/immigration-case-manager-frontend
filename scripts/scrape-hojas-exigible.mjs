/**
 * Scrapes inclusion.gob.es listado-completo and extracts DOCUMENTACIÓN EXIGIBLE.
 * Run: node scripts/scrape-hojas-exigible.mjs
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = 'https://www.inclusion.gob.es';
const LIST_HTML = join(__dirname, 'listado.html');
const OUT = join(__dirname, '../src/data/officialTemplates/hojasExigible.generated.json');
const CACHE_DIR = join(__dirname, 'hoja-cache');

function fetchHtml(url, retries = 3) {
  const escapedUrl = url.replace(/"/g, '\\"');
  let lastErr;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const html = execSync(
        `curl.exe -sL --retry 2 --retry-delay 2 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "${escapedUrl}"`,
        { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 }
      );
      if (html && html.length > 1000) return html;
    } catch (err) {
      lastErr = err;
    }

    try {
      const escaped = url.replace(/'/g, "''");
      const cmd = `$r = Invoke-WebRequest -Uri '${escaped}' -UserAgent 'Mozilla/5.0' -UseBasicParsing -TimeoutSec 90; [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8; $r.Content`;
      const html = execSync(`powershell -NoProfile -Command "${cmd.replace(/"/g, '\\"')}"`, {
        encoding: 'utf8',
        maxBuffer: 25 * 1024 * 1024,
      });
      if (html && html.length > 1000) return html;
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error('empty or failed download');
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\r/g, '')
    .replace(/\s+,/g, ',')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

function parseHojaNumber(label) {
  const m = label.match(/Hoja\s+(\d+(?:\s+bis|\s+ter)?)/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : 'unknown';
}

function parseTitle(label) {
  return label.replace(/^Hoja\s+\d+(?:\s+bis|\s+ter)?\.?\s*-?\s*/i, '').trim();
}

function hojaDocCodePrefix(number) {
  return `HOJA-${number.toUpperCase().replace(/\s+/g, '-')}`;
}

function extractAdministrativeSilenceDays(html) {
  const procIdx = html.search(/>\s*PROCEDIMIENTO\s*</i);
  const chunk = procIdx >= 0 ? html.slice(procIdx) : html;
  const plazoMatch = chunk.match(
    /Plazo de resoluci[oó]n[\s\S]{0,500}?(quince d[ií]as|un mes|dos meses|tres meses|cuatro meses|seis meses)/i
  );
  if (!plazoMatch) return 60;

  const span = plazoMatch[1].toLowerCase();
  if (span.includes('quince')) return 15;
  if (span.includes('un mes')) return 30;
  if (span.includes('dos meses')) return 60;
  if (span.includes('tres meses')) return 90;
  if (span.includes('cuatro meses')) return 120;
  if (span.includes('seis meses')) return 180;
  return 60;
}

const SECTION_STOP_RE =
  /<p[^>]*>\s*<strong>\s*(Procedimiento|PROCEDIMIENTO|PRÓRROGA|Prórroga de la|Nota importante:|A AUTORIZACIÓN|AUTORIZACIÓN DE|Actividades exceptuadas|TIPO DE AUTORIZACIÓN|Tipo de autorizaci|Normativa básica|NORMATIVA|Requisitos|REQUISITOS|FAMILIARES)/i;

const EXIGIBLE_HEADER_RE =
  /(?:<p[^>]*>\s*<strong[^>]*>\s*(?:Documentaci[oó]n exigible|DOCUMENTACIÓN A APORTAR):?[\s\S]*?<\/strong>[\s\S]*?<\/p>|<h[23][^>]*>\s*Documentaci[oó]n exigible:?\s*<\/h[23]>|<p[^>]*>[\s\S]*?A la solicitud se acompañará[\s\S]*?siguiente documentaci[oó]n[\s\S]*?<\/p>)/gi;

const PROCEDURE_LI_SKIP_RE =
  /^(Sujeto legitimado|Lugar de presentaci|Plazo de resoluci|Tasa correspondiente|En el plazo de un mes|La documentaci[oó]n a aportar en la solicitud de la tarjeta|Los nacionales andorranos deber[aá]n presentar|La solicitud ir[aá] acompañada|El c[oó]nyuge, pareja|El trabajador o trabajadora|Procedimiento y documentaci|La autorizaci[oó]n de\s+\*\*residencia|La autorizaci[oó]n de residencia tendr[aá])/i;

function extractListItems(sectionHtml) {
  const items = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRe.exec(sectionHtml)) !== null) {
    const text = stripHtml(m[1]);
    if (text.length < 10) continue;
    if (/^Nota:?$/i.test(text)) continue;
    if (/^con car[aá]cter general se deber/i.test(text)) continue;
    if (/^Lista de traductores/i.test(text)) continue;
    if (/^Informaci[oó]n sobre traducci/i.test(text)) continue;
    if (/^Por otro lado, todo documento/i.test(text)) continue;
    if (/^Hoja informativa sobre sujetos legitimados/i.test(text)) continue;
    if (PROCEDURE_LI_SKIP_RE.test(text)) continue;

    const isOptional =
      /^(En el supuesto|Si la duraci|Si el |Si se |Si la persona|Cuando la|En caso de que|Si la autorizaci)/i.test(
        text
      ) ||
      (/\b(menores de edad|mayor de edad penal|en su caso)\b/i.test(text) &&
        !/^Impreso de solicitud/i.test(text));

    items.push({ name: text, description: text, isOptional });
  }

  const seen = new Set();
  return items.filter((item) => {
    const k = item.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const LI_BOUNDARY = '(?:(?!<\\/li>)[\\s\\S])';

function findDocSectionMarkers(html) {
  const markers = [];

  const add = (index, end, kind) => markers.push({ index, end, kind });

  let match;
  while ((match = EXIGIBLE_HEADER_RE.exec(html)) !== null) {
    add(match.index, match.index + match[0].length, 'header');
  }

  const iraRe =
    /La solicitud ir[aá] acompañada de la siguiente[\s\S]*?documentaci[oó]n:?[\s\S]*?<\/li>/gi;
  while ((match = iraRe.exec(html)) !== null) {
    const nearBack = html.slice(Math.max(0, match.index - 900), match.index);
    const formLi = nearBack.match(
      new RegExp(`<li[^>]*>${LI_BOUNDARY}*?Impreso de solicitud${LI_BOUNDARY}*?<\\/li>`, 'i')
    );
    const start = formLi
      ? match.index - (nearBack.length - nearBack.lastIndexOf(formLi[0]))
      : match.index + match[0].length;
    add(start, match.index + match[0].length, 'acompanada');
  }

  const sigRe = /siguiente\s*<strong>\s*documentaci[oó]n[\s\S]*?:[\s\S]*?<\/li>/gi;
  while ((match = sigRe.exec(html)) !== null) {
    add(match.index, match.index + match[0].length, 'siguiente');
  }

  markers.sort((a, b) => a.index - b.index);

  const deduped = [];
  for (const mk of markers) {
    const prev = deduped[deduped.length - 1];
    if (prev && mk.index < prev.end && mk.kind !== 'siguiente') continue;
    if (prev && mk.kind === 'siguiente' && prev.kind === 'siguiente' && mk.index <= prev.end + 20)
      continue;
    deduped.push(mk);
  }
  return deduped;
}

function getSectionEnd(chunk, kind, nextMarkerRel) {
  let end = chunk.length;

  const stops = [SECTION_STOP_RE, /<p[^>]*>\s*<strong>\s*PROCEDIMIENTO/i, /<p[^>]*>\s*<strong>\s*Nota importante:/i];
  for (const stopRe of stops) {
    const sm = chunk.match(stopRe);
    if (sm?.index !== undefined && sm.index > 50) end = Math.min(end, sm.index);
  }

  if (kind === 'acompanada') {
    const acStop = chunk.match(
      new RegExp(`<li[^>]*>${LI_BOUNDARY}*?<strong>\\s*Sujeto legitimado`, 'i')
    );
    if (acStop?.index > 0) end = Math.min(end, acStop.index);
  }

  if (kind === 'siguiente') {
    const sigStop = chunk.match(
      new RegExp(
        `<li[^>]*>${LI_BOUNDARY}*?(?:<strong>\\s*Plazo de resoluci|<strong>\\s*En el plazo de un mes|La documentaci[oó]n a aportar en la solicitud)`,
        'i'
      )
    );
    if (sigStop?.index > 0) end = Math.min(end, sigStop.index);
  }

  if (nextMarkerRel !== undefined && nextMarkerRel > 0) end = Math.min(end, nextMarkerRel);
  return end;
}

function extractExigibleFromHtml(html) {
  const sections = [];
  const headers = findDocSectionMarkers(html);
  if (!headers.length) return sections;

  for (let i = 0; i < headers.length; i++) {
    const sliceStart = headers[i].kind === 'acompanada' ? headers[i].index : headers[i].end;
    const chunk = html.slice(sliceStart);
    const nextRel =
      i + 1 < headers.length ? headers[i + 1].index - sliceStart : undefined;
    const end = getSectionEnd(chunk, headers[i].kind, nextRel);
    const sectionHtml = chunk.slice(0, end);
    const items = extractListItems(sectionHtml);
    if (items.length) sections.push({ items });
  }
  return sections;
}

function hasNoStandaloneDocSection(html) {
  return /PECULIARIDADES DEL PROCEDIMIENTO/i.test(html) && !findDocSectionMarkers(html).length;
}

function getHojaLinks(html) {
  const links = [];
  const re = /href="(https:\/\/www\.inclusion\.gob\.es\/web\/migraciones\/w\/[^"]+)"[^>]*>(Hoja[^<]+)</gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const url = match[1];
    const label = match[2].replace(/\s+/g, ' ').trim();
    if (!links.some((l) => l.url === url)) {
      links.push({ url, label, number: parseHojaNumber(label), title: parseTitle(label) });
    }
  }
  return links;
}

const EXCLUDED_HOJAS = new Set(['59', '60', '61', '65']);
/** Catálogo oficial: 69 hojas (listado completo menos 59, 60, 61, 65 informativas; no existe Hoja 56) */
const OFFICIAL_HOJA_CATALOG_COUNT = 69;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  const listHtml = readFileSync(LIST_HTML, 'utf8');
  console.log(`Using cached ${LIST_HTML}`);

  const links = getHojaLinks(listHtml).filter((l) => !EXCLUDED_HOJAS.has(l.number));
  console.log(`Found ${links.length} hoja links (${OFFICIAL_HOJA_CATALOG_COUNT} in catalog)`);

  const results = [];
  const errors = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    process.stdout.write(`[${i + 1}/${links.length}] Hoja ${link.number}... `);
    try {
      const cacheFile = join(CACHE_DIR, `${slugify(link.number + '-' + link.title.slice(0, 30))}.html`);
      let html;
      const cachedLen = existsSync(cacheFile) ? readFileSync(cacheFile, 'utf8').length : 0;
      if (cachedLen > 1000) {
        html = readFileSync(cacheFile, 'utf8');
      } else {
        html = fetchHtml(link.url);
        writeFileSync(cacheFile, html, 'utf8');
        await sleep(800);
      }

      const sections = extractExigibleFromHtml(html);
      const totalDocs = sections.reduce((n, s) => n + s.items.length, 0);
      console.log(`${sections.length} section(s), ${totalDocs} doc(s)`);

      if (!sections.length) {
        const reason = hasNoStandaloneDocSection(html)
          ? 'no standalone documentación section (references other hojas)'
          : cachedLen <= 1000
            ? 'download failed or empty cache'
            : 'no documentación exigible section found';
        errors.push({ ...link, reason });
        continue;
      }

      const id = `hoja-${slugify(link.number)}`;
      const docCodePrefix = hojaDocCodePrefix(link.number);
      const administrativeSilenceDays = extractAdministrativeSilenceDays(html);
      const requiredDocuments = [];
      let docIdx = 0;
      sections.forEach((section, sectionIdx) => {
        section.items.forEach((item) => {
          docIdx += 1;
          const sectionPrefix = sections.length > 1 ? `[Sección ${sectionIdx + 1}] ` : '';
          const officialText = `${sectionPrefix}${item.name}`.trim();
          requiredDocuments.push({
            code: `${docCodePrefix}-${docIdx}`,
            name: `Hoja ${link.number} - ${docIdx}. ${officialText}`,
            description: item.description,
            ...(item.isOptional ? { isOptional: true } : {}),
          });
        });
      });

      results.push({
        id,
        number: link.number,
        label: `Hoja ${link.number}`,
        title: link.title,
        sourceUrl: link.url,
        name: `Hoja ${link.number} - ${link.title}`,
        description: `DOCUMENTACIÓN EXIGIBLE. Fuente: inclusion.gob.es — Hoja ${link.number}.`,
        reminderIntervalDays: 10,
        administrativeSilenceDays,
        requiredDocuments,
      });
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errors.push({ ...link, reason: err.message });
    }
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    sourceListUrl: `${BASE}/web/migraciones/listado-completo`,
    catalogCount: OFFICIAL_HOJA_CATALOG_COUNT,
    templateCount: results.length,
    templates: results,
    errors,
  };

  writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nWrote ${results.length} templates to ${OUT}`);
  console.log(`Errors: ${errors.length}`);
  errors.forEach((e) => console.log(`  - Hoja ${e.number}: ${e.reason}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
