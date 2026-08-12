export interface FilenameConfig {
  prefix: string;
  separator: string;
}

const DEFAULT_CONFIG: FilenameConfig = {
  prefix: "mrashed21",
  separator: "-",
};

export function generateFilename(
  sourceFilename: string,
  date: Date = new Date(),
  config: FilenameConfig = DEFAULT_CONFIG,
): string {
  const ext = extractCleanExtension(sourceFilename);
  const datePart = formatDate(date);
  const timePart = formatTime(date);
  const sep = config.separator;

  return `${config.prefix}${sep}${datePart}${sep}${timePart}${ext}`;
}

export function generateBatchFilenames(
  sourceFilenames: string[],
  date: Date = new Date(),
  config: FilenameConfig = DEFAULT_CONFIG,
): string[] {
  const seen = new Map<string, number>();

  return sourceFilenames.map((source) => {
    const base = generateFilename(source, date, config);
    const ext = extractCleanExtension(source);

    const bareBase = base.slice(0, base.length - ext.length);

    const count = seen.get(bareBase) ?? 0;
    seen.set(bareBase, count + 1);

    if (count === 0) {
      return base;
    }

    return `${bareBase}(${count + 1})${ext}`;
  });
}

export function extractCleanExtension(filename: string): string {
  const cleanName = filename.split("?")[0].split("#")[0];

  const dot = cleanName.lastIndexOf(".");
  if (dot < 0 || dot === cleanName.length - 1) return ".jpg"; // no extension

  const raw = cleanName.slice(dot).toLowerCase();

  const aliases: Record<string, string> = {
    ".jpeg": ".jpg",
    ".jfif": ".jpg",
    ".tiff": ".tif",
  };

  return aliases[raw] ?? raw;
}

export function sanitizeFilename(filename: string): string {
  let name = filename.normalize("NFC");

  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  name = name.replace(/\s+/g, "_");

  name = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "");

  name = name.replace(/[_-]{2,}/g, "_");

  name = name.replace(/^[._\s]+|[._\s]+$/g, "");

  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
  if (reserved.test(name)) {
    name = `_${name}`;
  }

  return name || "processed";
}

export function validateCustomFilename(name: string): string | null {
  if (!name.trim()) return "Filename cannot be empty.";
  if (name.length > 255) return "Filename is too long (max 255 characters).";
  if (/[<>:"/\\|?*\x00-\x1F]/.test(name)) {
    return "Filename contains invalid characters.";
  }
  return null;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}${m}${d}`;
}

function formatTime(date: Date): string {
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${h}${mi}${s}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
