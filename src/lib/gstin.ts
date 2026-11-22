const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Mod-36 checksum used by GSTN. Mirrors the backend check so staff get instant feedback;
 * the API re-validates every GSTIN regardless.
 */
export function gstinChecksumOk(g: string): boolean {
  if (!GSTIN_RE.test(g)) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const v = CHARS.indexOf(g[i]);
    const prod = v * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(prod / 36) + (prod % 36);
  }
  return CHARS[(36 - (sum % 36)) % 36] === g[14];
}

/** Rupees → integer paise. */
export const paise = (rupees: number) => Math.round(rupees * 100);
