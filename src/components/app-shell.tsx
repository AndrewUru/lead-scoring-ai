"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  Database,
  LayoutDashboard,
  ListFilter,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Database },
  { href: "/leads/import", label: "Importar", icon: Upload },
  { href: "/scoring", label: "Scoring", icon: Sparkles },
  { href: "/segments", label: "Segmentos", icon: ListFilter },
  { href: "/settings", label: "Configuración", icon: Settings2 },
] as const;

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="desktop-sidebar sticky top-0 h-screen border-r border-[#dfe5e1] bg-[#eef2ed] px-4 py-5">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 text-[17px] font-bold tracking-[-.03em]">
          <span className="grid size-9 place-items-center rounded-[10px] bg-[#116149] text-white">
            <ChartNoAxesCombined size={19} />
          </span>
          LocalLead <span className="text-[#116149]">AI</span>
        </Link>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#818b85]">Espacio de trabajo</div>
        <button className="mb-7 flex w-full items-center justify-between rounded-xl border border-[#d7dfda] bg-white px-3 py-3 text-left text-sm font-semibold">
          Ventas principal <SlidersHorizontal size={15} className="text-[#7d8781]" />
        </button>
        <nav className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-[#dce8df] text-[#0f5843]" : "text-[#5e6963] hover:bg-white/70 hover:text-[#18201c]"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.3 : 1.8} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-[#173d32] p-4 text-white">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} /> Privacidad local</div>
          <p className="text-xs leading-5 text-white/65">Tus leads permanecen en este navegador.</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#dfe5e1] bg-[#f5f7f3]/90 px-5 backdrop-blur lg:px-8">
          <Link href="/dashboard" className="font-bold tracking-[-.03em] lg:hidden">LocalLead AI</Link>
          <p className="hidden text-sm text-[#69736d] lg:block">Scoring local, privado y explicable</p>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#e2eee7] px-3 py-1.5 text-xs font-semibold text-[#116149] sm:block">● Datos protegidos</span>
            <div className="grid size-9 place-items-center rounded-full bg-[#d8f65a] text-sm font-bold">AV</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
