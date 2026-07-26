"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, Flame, Gauge, Plus, Share2, Users } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { db } from "@/db/database";
import { ScoreBadge } from "@/components/score-badge";
import { EmptyState } from "@/components/empty-state";

const statusConfig = [
  { key: "hot", name: "Hot", color: "#e9684f" },
  { key: "warm", name: "Warm", color: "#eeb94d" },
  { key: "nurturing", name: "Nurturing", color: "#668eda" },
  { key: "cold", name: "Cold", color: "#b8c2bc" },
] as const;

export function DashboardView() {
  const leads = useLiveQuery(() => db.leads.toArray(), []);
  const total = leads?.length ?? 0;
  const scored = leads?.filter((lead) => lead.score) ?? [];
  const average = scored.length ? Math.round(scored.reduce((sum, lead) => sum + (lead.score?.total ?? 0), 0) / scored.length) : 0;
  const socialLeads = leads?.filter((lead) => lead.socialPlatform).length ?? 0;
  const data = statusConfig.map((status) => ({
    ...status,
    value: scored.filter((lead) => lead.score?.status === status.key).length,
  }));

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-[#116149]">Panel comercial</p>
          <h1 className="text-3xl font-bold tracking-[-.045em] sm:text-4xl">Buenos días, Andrés</h1>
          <p className="mt-2 text-sm text-[#69736d]">Aquí tienes el pulso de tu pipeline, calculado sin sacar datos del navegador.</p>
        </div>
        <Link href="/leads/import" className="button-primary"><Plus size={17} /> Importar leads</Link>
      </div>

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total de leads", value: total, hint: "en este espacio", icon: Users },
          { label: "Score promedio", value: average, hint: scored.length ? `${scored.length} analizados` : "sin analizar", icon: Gauge },
          { label: "Leads calientes", value: data[0].value, hint: "prioridad inmediata", icon: Flame },
          { label: "Leads de RRSS", value: socialLeads, hint: `${total - scored.length} pendientes de análisis`, icon: Share2 },
        ].map(({ label, value, hint, icon: Icon }) => (
          <article key={label} className="card p-5">
            <div className="mb-5 flex items-center justify-between text-sm text-[#69736d]">
              <span>{label}</span><span className="grid size-9 place-items-center rounded-xl bg-[#edf2ee] text-[#116149]"><Icon size={17} /></span>
            </div>
            <div className="metric-number text-4xl font-semibold">{value}</div>
            <p className="mt-2 text-xs text-[#89918c]">{hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[.85fr_1.4fr]">
        <article className="card p-5">
          <div className="mb-3">
            <h2 className="font-semibold">Distribución del scoring</h2>
            <p className="mt-1 text-xs text-[#7a847e]">Clasificación actual de los leads analizados</p>
          </div>
          {scored.length ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="value" innerRadius={62} outerRadius={86} paddingAngle={4}>
                      {data.map((entry) => <Cell key={entry.key} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg bg-[#f7f8f6] px-3 py-2 text-xs">
                    <span className="flex items-center gap-2"><i className="size-2 rounded-full" style={{ background: item.color }} />{item.name}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyState title="Aún no hay scoring" description="Importa leads y ejecútales el motor para ver su distribución." />}
        </article>

        <article className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#e5e9e6] p-5">
            <div><h2 className="font-semibold">Leads recientes</h2><p className="mt-1 text-xs text-[#7a847e]">Últimos contactos añadidos al espacio</p></div>
            <Link href="/leads" className="flex items-center gap-1 text-xs font-bold text-[#116149]">Ver todos <ArrowRight size={14} /></Link>
          </div>
          {leads?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fafbf9] text-[11px] uppercase tracking-wider text-[#88918c]">
                  <tr><th className="px-5 py-3 font-semibold">Lead</th><th className="px-4 py-3 font-semibold">Empresa</th><th className="px-4 py-3 font-semibold">Estado</th><th className="px-5 py-3 text-right font-semibold">Score</th></tr>
                </thead>
                <tbody>
                  {leads.slice(-6).reverse().map((lead) => (
                    <tr key={lead.id} className="border-t border-[#edf0ee]">
                      <td className="px-5 py-3.5"><div className="font-semibold">{lead.name}</div><div className="text-xs capitalize text-[#8a938e]">{lead.socialHandle ? `${lead.socialPlatform} · ${lead.socialHandle}` : lead.email ?? "Sin contacto"}</div></td>
                      <td className="px-4 py-3.5 text-[#59635e]">{lead.company ?? "—"}</td>
                      <td className="px-4 py-3.5">{lead.score ? <ScoreBadge status={lead.score.status} /> : <span className="text-xs text-[#929b96]">Pendiente</span>}</td>
                      <td className="metric-number px-5 py-3.5 text-right text-lg font-semibold">{lead.score?.total ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState title="Tu pipeline está vacío" description="Importa un CSV para empezar a priorizar oportunidades." />}
        </article>
      </section>
    </div>
  );
}
