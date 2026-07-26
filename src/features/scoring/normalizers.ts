export function normalizeText(value?: string): string {
  return (
    value
      ?.trim()
      .toLocaleLowerCase("es-ES")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") ?? ""
  );
}

export function normalizeEmail(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

export function normalizePhone(value?: string): string {
  return value?.replace(/[^\d+]/g, "") ?? "";
}
