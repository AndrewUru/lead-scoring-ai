"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Search, Sparkles, Upload } from "lucide-react";
import { db } from "@/db/database";
import { ScoreBadge } from "@/components/score-badge";
import { EmptyState } from "@/components/empty-state";
import { calculateLeadScore } from "@/features/scoring/scoring-engine";
import { defaultProfile } from "@/features/scoring/defaults";
import { calculateSemanticSimilarity } from "@/features/scoring/semantic-score";

export function LeadsView() {
  const leads = useLiveQuery(() => db.leads.orderBy("createdAt").reverse().toArray(), []);
  const [query, setQuery] = useState("");
  const [working, setWorking] = useState(false);
  const filtered = (leads ?? []).filter((lead) =>
    `${lead.name} ${lead.company ?? ""} ${lead.email ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  async function scoreAll() {
    if (!leads?.length) return;
    setWorking(true);
    const config = await db.scoringConfigurations.where("workspaceId").equals("default").first();
    const profile = config?.profile ?? defaultProfile;
    for (const lead of leads) {
      let semanticSimilarity = 0;
      try {
        semanticSimilarity = await calculateSemanticSimilarity(lead, profile.idealCustomerDescription);
      } catch {
        // Rules remain available when the local model cannot be downloaded or initialized.
      }
      await db.leads.update(lead.id, {
        score: calculateLeadScore(lead, profile, semanticSimilarity, config?.version ?? 1),
        updatedAt: new Date().toISOString(),
      });
    }
    setWorking(false);
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[#116149]">Base comercial</p>
          <h1 className="text-3xl font-bold tracking-[-.045em]">Leads</h1>
          <p className="mt-2 text-sm text-[#69736d]">Busca, analiza y prioriza contactos con criterios transparentes.</p>
        </div>
        <div className="flex gap-2">
          <button className="button-secondary" onClick={scoreAll} disabled={working || !leads?.length}>
            <Sparkles size={16} /> {working ? "Analizando…" : "Puntuar todos"}
          </button>
          <Link href="/leads/import" className="button-primary"><Upload size={16} /> Importar CSV</Link>
        </div>
      </div>
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e9e5] p-4">
          <label className="relative min-w-64 flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a938e]" size={16} />
            <input className="field pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre, empresa o email…" />
          </label>
          <span className="text-xs font-semibold text-[#77817b]">{filtered.length} resultados</span>
        </div>
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fafbf9] text-[11px] uppercase tracking-[.08em] text-[#858f89]">
                <tr><th className="px-5 py-3">Contacto</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Sector</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Score</th><th className="px-5 py-3" /></tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-t border-[#edf0ee] hover:bg-[#fafbf9]">
                    <td className="px-5 py-4"><div className="font-semibold">{lead.name}</div><div className="text-xs text-[#85908a]">{lead.email ?? "Sin email"}</div></td>
                    <td className="px-4 py-4">{lead.company ?? "—"}</td>
                    <td className="px-4 py-4 text-[#647069]">{lead.industry ?? "—"}</td>
                    <td className="px-4 py-4">{lead.score ? <ScoreBadge status={lead.score.status} /> : <span className="text-xs text-[#8b948f]">Pendiente</span>}</td>
                    <td className="metric-number px-4 py-4 text-right text-lg font-semibold">{lead.score?.total ?? "—"}</td>
                    <td className="px-5 py-4 text-right"><Link href={`/leads/${lead.id}`} className="text-xs font-bold text-[#116149]">Ver detalle</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title={query ? "No hay coincidencias" : "Todavía no hay leads"} description={query ? "Prueba con otro término de búsqueda." : "Importa un CSV para crear tu base comercial."} />}
      </section>
    </div>
  );
}
