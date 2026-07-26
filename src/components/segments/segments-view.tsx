"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Filter } from "lucide-react";
import { db } from "@/db/database";
import { ScoreBadge } from "@/components/score-badge";
import { EmptyState } from "@/components/empty-state";

export function SegmentsView() {
  const leads = useLiveQuery(() => db.leads.toArray(), []);
  const [minimum, setMinimum] = useState(60);
  const [country, setCountry] = useState("");
  const [platform, setPlatform] = useState("");
  const countries = [...new Set((leads ?? []).map((lead) => lead.country).filter(Boolean))] as string[];
  const platforms = [...new Set((leads ?? []).map((lead) => lead.socialPlatform).filter(Boolean))] as string[];
  const filtered = (leads ?? []).filter((lead) =>
    (lead.score?.total ?? 0) >= minimum &&
    (!country || lead.country === country) &&
    (!platform || lead.socialPlatform === platform),
  );
  return (
    <div>
      <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[#116149]">Audiencias dinámicas</p><h1 className="text-3xl font-bold tracking-[-.045em]">Segmentos</h1><p className="mt-2 text-sm text-[#69736d]">Combina criterios y obtén listas comerciales listas para actuar.</p></div>
      <section className="card mb-5 flex flex-wrap items-end gap-4 p-5">
        <span className="grid size-10 place-items-center rounded-xl bg-[#e6eee8] text-[#116149]"><Filter size={18} /></span>
        <label className="min-w-52 text-xs font-semibold">Score mínimo: {minimum}<input className="mt-3 block w-full accent-[#116149]" type="range" min="0" max="100" step="5" value={minimum} onChange={(event) => setMinimum(Number(event.target.value))} /></label>
        <label className="min-w-52 text-xs font-semibold">País<select className="field mt-2 text-sm font-normal" value={country} onChange={(event) => setCountry(event.target.value)}><option value="">Todos</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="min-w-52 text-xs font-semibold">Red social<select className="field mt-2 text-sm font-normal capitalize" value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="">Todas</option>{platforms.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <strong className="ml-auto text-sm">{filtered.length} leads</strong>
      </section>
      <section className="card overflow-hidden">
        {filtered.length ? <div className="divide-y divide-[#edf0ee]">{filtered.map((lead) => <div key={lead.id} className="flex items-center gap-4 px-5 py-4"><div className="min-w-0 flex-1"><div className="font-semibold">{lead.name}</div><div className="truncate text-xs capitalize text-[#7d8781]">{lead.socialPlatform ? `${lead.socialPlatform} · ${lead.socialHandle ?? "sin usuario"}` : lead.company ?? "Sin empresa"} · {lead.country ?? "Sin país"}</div></div>{lead.score && <ScoreBadge status={lead.score.status} />}<b className="metric-number text-xl">{lead.score?.total}</b></div>)}</div> : <EmptyState title="El segmento está vacío" description="Ajusta los filtros o puntúa tus leads para encontrar coincidencias." />}
      </section>
    </div>
  );
}
