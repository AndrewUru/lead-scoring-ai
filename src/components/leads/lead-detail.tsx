"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Check, X } from "lucide-react";
import { db } from "@/db/database";
import { ScoreBadge } from "@/components/score-badge";

const breakdownLabels = { fit: "Encaje ideal", intent: "Intención", engagement: "Engagement", dataQuality: "Calidad de datos", semantic: "Semántica local" };
const maxValues = { fit: 35, intent: 25, engagement: 20, dataQuality: 10, semantic: 10 };

export function LeadDetail({ leadId }: { leadId: string }) {
  const lead = useLiveQuery(() => db.leads.get(leadId), [leadId]);
  if (lead === undefined) return <div className="card p-8 text-sm text-[#69736d]">Cargando lead…</div>;
  if (!lead) return <div className="card p-8">No se ha encontrado este lead.</div>;
  return (
    <div>
      <Link href="/leads" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#65706a]"><ArrowLeft size={16} /> Volver a leads</Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-[-.045em]">{lead.name}</h1><p className="mt-2 text-sm text-[#69736d]">{lead.jobTitle ?? "Cargo desconocido"} · {lead.company ?? "Empresa desconocida"}</p></div>
        {lead.score && <div className="flex items-center gap-3"><ScoreBadge status={lead.score.status} /><span className="metric-number text-4xl font-semibold">{lead.score.total}</span><span className="text-sm text-[#8a938e]">/100</span></div>}
      </div>
      {!lead.score ? <div className="card p-8 text-center">Este lead aún no tiene scoring. Usa “Puntuar todos” en la lista de leads.</div> : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <section className="card p-6">
            <h2 className="mb-5 font-semibold">Desglose de puntuación</h2>
            <div className="space-y-5">
              {(Object.keys(lead.score.breakdown) as Array<keyof typeof lead.score.breakdown>).map((key) => (
                <div key={key}>
                  <div className="mb-2 flex justify-between text-sm"><span>{breakdownLabels[key]}</span><b className="metric-number">{lead.score?.breakdown[key]} / {maxValues[key]}</b></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf0ee]"><div className="h-full rounded-full bg-[#116149]" style={{ width: `${((lead.score?.breakdown[key] ?? 0) / maxValues[key]) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-xl bg-[#edf5ef] p-4"><div className="text-xs font-bold uppercase tracking-wider text-[#116149]">Siguiente acción</div><p className="mt-2 font-semibold">{lead.score.recommendedAction}</p></div>
          </section>
          <aside className="space-y-5">
            <section className="card p-5"><h2 className="mb-4 font-semibold">Señales positivas</h2><div className="space-y-3">{lead.score.positiveSignals.map((signal) => <div key={signal} className="flex gap-3 text-sm"><Check className="mt-0.5 shrink-0 text-[#16825f]" size={16} />{signal}</div>)}</div></section>
            <section className="card p-5"><h2 className="mb-4 font-semibold">Alertas</h2><div className="space-y-3">{lead.score.negativeSignals.map((signal) => <div key={signal} className="flex gap-3 text-sm"><X className="mt-0.5 shrink-0 text-[#c85d49]" size={16} />{signal}</div>)}</div></section>
            <div className="px-1 text-xs text-[#8a938e]">Confianza: {Math.round(lead.score.confidence * 100)}% · Motor v{lead.score.scoringVersion}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
