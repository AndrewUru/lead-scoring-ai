import Papa from "papaparse";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export function parseCsv(file: File): Promise<ParsedCsv> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),
      complete: ({ data, meta, errors }) =>
        resolve({
          headers: meta.fields ?? [],
          rows: data,
          errors: errors.map((error) => `Fila ${error.row ?? "?"}: ${error.message}`),
        }),
    });
  });
}
