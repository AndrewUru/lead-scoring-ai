"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Info, Save } from "lucide-react";
import { db } from "@/db/database";
import { defaultProfile } from "@/features/scoring/defaults";
import type { IdealCustomerProfile } from "@/types/scoring";

type ListField = "industries" | "countries" | "jobTitles" | "excludedKeywords";

export function ScoringSettings() {
  const [profile, setProfile] = useState<IdealCustomerProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void db.scoringConfigurations.where("workspaceId").equals("default").first().then((config) => {
      if (config) setProfile(config.profile);
    });
  }, []);

  function setList(key: ListField, value: string) {
    setProfile((current) => ({ ...current, [key]: value.split(",").map((item) => item.trim()).filter(Boolean) }));
  }

  async function save() {
    const previous = await db.scoringConfigurations.get("default-profile");
    await db.scoringConfigurations.put({
      id: "default-profile",
      workspaceId: "default",
      name: "Venta principal",
      version: (previous?.version ?? 0) + 1,
      profile,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[#116149]">Motor comercial</p>
        <h1 className="text-3xl font-bold tracking-[-.045em]">Configuración del scoring</h1>
        <p className="mt-2 text-sm text-[#69736d]">Define a quién quieres vender. Cada cambio crea una nueva versión auditable.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <section className="card p-6">
          <h2 className="mb-5 text-lg font-semibold">Perfil de cliente ideal</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {([
              ["industries", "Sectores objetivo", "software, marketing, ecommerce"],
              ["countries", "Países objetivo", "España, Portugal"],
              ["jobTitles", "Cargos decisores", "CEO, CTO, director comercial"],
              ["excludedKeywords", "Términos excluidos", "sin presupuesto, estudiante"],
            ] as const).map(([key, label, placeholder]) => (
              <label key={key} className="text-sm font-semibold">{label}<input className="field mt-2 font-normal" placeholder={placeholder} value={profile[key].join(", ")} onChange={(event) => setList(key, event.target.value)} /></label>
            ))}
            <label className="text-sm font-semibold">Tamaño mínimo<input type="number" className="field mt-2 font-normal" value={profile.minimumCompanySize ?? ""} onChange={(event) => setProfile((p) => ({ ...p, minimumCompanySize: Number(event.target.value) || undefined }))} /></label>
            <label className="text-sm font-semibold">Tamaño máximo<input type="number" className="field mt-2 font-normal" value={profile.maximumCompanySize ?? ""} onChange={(event) => setProfile((p) => ({ ...p, maximumCompanySize: Number(event.target.value) || undefined }))} /></label>
            <label className="text-sm font-semibold sm:col-span-2">Presupuesto mínimo (€)<input type="number" className="field mt-2 font-normal" value={profile.minimumBudget ?? ""} onChange={(event) => setProfile((p) => ({ ...p, minimumBudget: Number(event.target.value) || undefined }))} /></label>
            <label className="text-sm font-semibold sm:col-span-2">Descripción semántica del cliente ideal<textarea rows={4} className="field mt-2 resize-y font-normal leading-6" value={profile.idealCustomerDescription} onChange={(event) => setProfile((p) => ({ ...p, idealCustomerDescription: event.target.value }))} /></label>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="button-primary" onClick={save}><Save size={16} /> Guardar configuración</button>
            {saved && <span className="flex items-center gap-1 text-sm font-semibold text-[#116149]"><CheckCircle2 size={16} /> Guardada</span>}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="card p-5"><h3 className="mb-4 font-semibold">Pesos del modelo</h3>{[
            ["Encaje", 35], ["Intención", 25], ["Engagement", 20], ["Calidad de datos", 10], ["Semántica local", 10],
          ].map(([name, value]) => <div key={name} className="mb-3"><div className="mb-1.5 flex justify-between text-xs"><span>{name}</span><b>{value} pt</b></div><div className="h-1.5 rounded-full bg-[#edf0ee]"><div className="h-full rounded-full bg-[#116149]" style={{ width: `${Number(value) * 2.5}%` }} /></div></div>)}</div>
          <div className="card flex gap-3 p-5 text-sm leading-6 text-[#66716a]"><Info className="mt-0.5 shrink-0 text-[#116149]" size={18} /><p>El modelo semántico es complementario: nunca decide por sí solo y aporta como máximo 10 puntos.</p></div>
        </aside>
      </div>
    </div>
  );
}
