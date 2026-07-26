"use client";

import { useRef, useState } from "react";
import { Download, FileUp, HardDrive, Trash2 } from "lucide-react";
import { db } from "@/db/database";
import { downloadBackup, restoreBackup } from "@/features/exporting/backup";

export function SettingsView() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  async function restore(file?: File) {
    if (!file) return;
    try {
      await restoreBackup(file);
      setMessage("Copia restaurada correctamente");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo restaurar");
    }
  }

  async function clearData() {
    if (!window.confirm("¿Borrar todos los leads y configuraciones de este navegador?")) return;
    await Promise.all([db.leads.clear(), db.scoringConfigurations.clear(), db.workspaces.clear()]);
    setMessage("Datos locales borrados");
  }

  return (
    <div>
      <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[#116149]">Control local</p><h1 className="text-3xl font-bold tracking-[-.045em]">Configuración</h1><p className="mt-2 text-sm text-[#69736d]">Administra la portabilidad y el ciclo de vida de tus datos.</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-6"><HardDrive className="mb-4 text-[#116149]" /><h2 className="text-lg font-semibold">Copia de seguridad</h2><p className="mt-2 text-sm leading-6 text-[#69736d]">Exporta el espacio de trabajo completo en un archivo JSON. Incluye leads, scores y configuraciones.</p><button className="button-primary mt-5" onClick={downloadBackup}><Download size={16} /> Descargar copia</button></section>
        <section className="card p-6"><FileUp className="mb-4 text-[#116149]" /><h2 className="text-lg font-semibold">Restaurar copia</h2><p className="mt-2 text-sm leading-6 text-[#69736d]">Reemplaza el contenido local por una copia de LocalLead AI previamente exportada.</p><input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(event) => restore(event.target.files?.[0])} /><button className="button-secondary mt-5" onClick={() => fileRef.current?.click()}><FileUp size={16} /> Elegir archivo</button></section>
        <section className="card border-[#f0d5d0] p-6 lg:col-span-2"><Trash2 className="mb-4 text-[#b84e3e]" /><h2 className="text-lg font-semibold">Borrar datos locales</h2><p className="mt-2 text-sm leading-6 text-[#69736d]">Esta operación elimina la base IndexedDB de la aplicación. Haz antes una copia de seguridad.</p><button className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e4bdb6] px-4 text-sm font-semibold text-[#a94335]" onClick={clearData}><Trash2 size={15} /> Borrar todo</button></section>
      </div>
      {message && <p className="mt-4 rounded-xl bg-[#e9f3ec] p-3 text-sm font-semibold text-[#116149]">{message}</p>}
    </div>
  );
}
