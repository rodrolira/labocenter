/**
 * Utilidades de RUT chileno (Rol Único Tributario).
 * Normaliza a "cuerpo-DV" en minúscula y valida el dígito verificador (mód 11).
 */

/** Normaliza un RUT: quita puntos/guiones/espacios y deja DV en minúscula. */
export function normalizeRut(rut: string): string {
  const clean = rut.replace(/[.\s-]/g, "").toLowerCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body}-${dv}`;
}

/** Calcula el dígito verificador de un cuerpo numérico de RUT. */
export function computeDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return "0";
  if (remainder === 10) return "k";
  return String(remainder);
}

/** Valida formato y dígito verificador de un RUT. */
export function isValidRut(rut: string): boolean {
  const normalized = normalizeRut(rut);
  const match = /^(\d{7,8})-([0-9k])$/.exec(normalized);
  if (!match) return false;
  const [, body, dv] = match;
  return computeDv(body!) === dv;
}
