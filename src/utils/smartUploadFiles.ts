export const SMART_UPLOAD_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,application/pdf,image/*';

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'doc',
  'docx',
  'xls',
  'xlsx',
]);

const ALLOWED_MIME_PREFIXES = ['application/pdf', 'image/'];
const ALLOWED_MIME_EXACT = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export function isSmartUploadFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ALLOWED_EXTENSIONS.has(ext)) return true;
  const type = file.type.toLowerCase();
  if (ALLOWED_MIME_EXACT.has(type)) return true;
  return ALLOWED_MIME_PREFIXES.some((p) => type.startsWith(p));
}

export function filterSmartUploadFiles(files: File[]): File[] {
  return files.filter(isSmartUploadFile);
}

/** Collect files from a drop (supports folders when the browser provides entries). */
export async function collectFilesFromDataTransfer(
  dataTransfer: DataTransfer
): Promise<File[]> {
  const direct = Array.from(dataTransfer.files || []);
  if (direct.length > 0) return direct;

  const items = dataTransfer.items;
  if (!items?.length) return [];

  const files: File[] = [];

  const readEntry = async (entry: FileSystemEntry): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      });
      files.push(file);
      return;
    }
    if (!entry.isDirectory) return;

    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const readBatch = (): Promise<FileSystemEntry[]> =>
      new Promise((resolve, reject) => reader.readEntries(resolve, reject));

    let entries = await readBatch();
    while (entries.length > 0) {
      await Promise.all(entries.map(readEntry));
      entries = await readBatch();
    }
  };

  await Promise.all(
    Array.from(items)
      .filter((item) => item.kind === 'file')
      .map(async (item) => {
        const entry = item.webkitGetAsEntry?.() ?? null;
        if (entry) await readEntry(entry);
      })
  );

  return files;
}

export function preventDragDefaults(e: { preventDefault(): void; stopPropagation(): void }): void {
  e.preventDefault();
  e.stopPropagation();
}
