"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, FileSpreadsheet, ShieldCheck, UploadCloud } from "lucide-react";
import { db } from "@/db/database";
import { parseCsv, type ParsedCsv } from "@/features/importing/parse-csv";
import { rowToLead, suggestMapping, type ImportField } from "@/features/importing/map-columns";
import { withoutDuplicates } from "@/features/importing/duplicate-detector";

const fields: { key: ImportField; label: string; required?: boolean }[] = [
  { key: "name", label: "Nombre", required: true },
  { key: "email", label: "Email" },
  { key: "phone", label: "Teléfono" },
  { key: "company", label: "Empresa" },
  { key: "jobTitle", label: "Cargo" },
  { key: "industry", label: "Sector" },
  { key: "country", label: "País" },
  { key: "source", label: "Fuente" },
  { key: "companySize", label: "N.º empleados" },
  { key: "estimatedBudget", label: "Presupuesto" },
  { key: "notes", label: "Notas" },
];

export function CsvImporter() {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Partial<Record<ImportField, string>>>({});
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  async function chooseFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    const result = await parseCsv(file);
    setParsed(result);
    setMapping(suggestMapping(result.headers));
  }

  async function importRows() {
    if (!parsed || !mapping.name) return;
    const incoming = parsed.rows.map((row) => rowToLead(row, mapping, "default")).filter((lead) => lead !== null);
    const unique = withoutDuplicates(incoming, await db.leads.toArray());
    await db.leads.bulkAdd(unique);
    setMessage(`${unique.length} leads importados · ${incoming.length - unique.length} duplicados omitidos`);
    setTimeout(() => router.push("/leads"), 900);
  }

  return (
    <div>
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[#116149]">Entrada de datos</p>
        <h1 className="text-3xl font-bold tracking-[-.045em]">Importar leads</h1>
        <p className="mt-2 text-sm text-[#69736d]">Mapeamos encabezados automáticamente y nunca enviamos el archivo fuera del navegador.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="card p-5 sm:p-7">
          {!parsed ? (
            <label className="grid min-h-[360px] cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#cdd7d1] bg-[#fafbf9] p-8 text-center transition hover:border-[#116149] hover:bg-[#f5f9f5]">
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
              <div>
                <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-[#e3eee7] text-[#116149]"><UploadCloud size={28} /></span>
                <h2 className="text-lg font-semibold">Suelta tu CSV aquí</h2>
                <p className="mt-2 text-sm text-[#737e77]">o haz clic para seleccionarlo · UTF-8 recomendado</p>
                <span className="button-secondary mt-6">Seleccionar archivo</span>
              </div>
            </label>
          ) : (
            <div>
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-[#eef5f0] p-4">
                <FileSpreadsheet className="text-[#116149]" />
                <div><div className="font-semibold">{fileName}</div><div className="text-xs text-[#6b756f]">{parsed.rows.length} filas · {parsed.headers.length} columnas</div></div>
              </div>
              <h2 className="mb-1 text-lg font-semibold">Confirma el mapeo</h2>
              <p className="mb-5 text-sm text-[#737e77]">Relaciona las columnas del archivo con los campos de LocalLead.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.key} className="text-xs font-semibold text-[#5f6963]">
                    {field.label}{field.required && <span className="text-[#c64e3e]"> *</span>}
                    <select
                      className="field mt-1.5 text-sm font-normal"
                      value={mapping[field.key] ?? ""}
                      onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.value || undefined }))}
                    >
                      <option value="">No importar</option>
                      {parsed.headers.map((header) => <option key={header} value={header}>{header}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              {parsed.errors.length > 0 && <p className="mt-4 rounded-lg bg-[#fff4e5] p-3 text-xs text-[#845b16]">{parsed.errors.slice(0, 3).join(" · ")}</p>}
              <div className="mt-7 flex items-center justify-between gap-3">
                <button className="button-secondary" onClick={() => setParsed(null)}>Cambiar archivo</button>
                <button className="button-primary" disabled={!mapping.name} onClick={importRows}>Importar {parsed.rows.length} filas <ArrowRight size={16} /></button>
              </div>
              {message && <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#e8f5ec] p-3 text-sm font-semibold text-[#116149]"><CheckCircle2 size={17} /> {message}</div>}
            </div>
          )}
        </section>
        <aside className="space-y-4">
          <div className="card p-5"><ShieldCheck className="mb-4 text-[#116149]" /><h3 className="font-semibold">Procesamiento privado</h3><p className="mt-2 text-sm leading-6 text-[#707a74]">El CSV se interpreta y almacena en IndexedDB. No existe una subida a servidor.</p></div>
          <div className="card p-5"><h3 className="font-semibold">Duplicados</h3><p className="mt-2 text-sm leading-6 text-[#707a74]">Se comparan primero email, después teléfono y finalmente empresa + nombre. Los repetidos se omiten.</p></div>
        </aside>
      </div>
    </div>
  );
}
