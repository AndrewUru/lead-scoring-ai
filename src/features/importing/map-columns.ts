import { normalizeText } from "@/features/scoring/normalizers";
import type { Lead } from "@/types/lead";

export type ImportField = keyof Pick<
  Lead,
  "name" | "email" | "phone" | "company" | "jobTitle" | "industry" | "country" | "source" |
  "socialPlatform" | "socialHandle" | "socialProfileUrl" | "followerCount" | "socialEngagementRate" |
  "directMessages" | "postComments" | "socialClicks" | "campaign" |
  "companySize" | "estimatedBudget" | "notes"
>;

const aliases: Record<ImportField, string[]> = {
  name: ["nombre", "nombre completo", "full name", "full_name", "contact", "lead name", "lead_name"],
  email: ["email", "correo", "correo electronico", "e-mail"],
  phone: ["telefono", "phone", "movil", "mobile"],
  company: ["empresa", "company", "organizacion"],
  jobTitle: ["cargo", "puesto", "job title", "job_title", "title"],
  industry: ["sector", "industria", "industry"],
  country: ["pais", "country", "mercado"],
  source: ["fuente", "source", "origen"],
  socialPlatform: ["red social", "rrss", "plataforma", "platform", "social network", "social_network"],
  socialHandle: ["usuario", "handle", "username", "social handle", "social_handle", "perfil"],
  socialProfileUrl: ["url perfil", "profile url", "profile_url", "social url", "social_url"],
  followerCount: ["seguidores", "followers", "follower count", "follower_count"],
  socialEngagementRate: ["engagement", "tasa engagement", "engagement rate", "engagement_rate"],
  directMessages: ["mensajes directos", "dms", "direct messages", "direct_messages", "mensajes"],
  postComments: ["comentarios", "comments", "post comments", "post_comments"],
  socialClicks: ["clics rrss", "social clicks", "social_clicks", "link clicks", "link_clicks"],
  campaign: ["campaña", "campana", "campaign", "ad campaign", "ad_campaign"],
  companySize: ["empleados", "tamano empresa", "company size", "company_size"],
  estimatedBudget: ["presupuesto", "budget", "estimated budget", "estimated_budget"],
  notes: ["notas", "notes", "comentarios"],
};

export function suggestMapping(headers: string[]): Partial<Record<ImportField, string>> {
  const mapping: Partial<Record<ImportField, string>> = {};
  for (const field of Object.keys(aliases) as ImportField[]) {
    const match = headers.find((header) => aliases[field].includes(normalizeText(header)));
    if (match) mapping[field] = match;
  }
  return mapping;
}

export function rowToLead(
  row: Record<string, string>,
  mapping: Partial<Record<ImportField, string>>,
  workspaceId: string,
): Lead | null {
  const get = (field: ImportField) => mapping[field] ? row[mapping[field] as string]?.trim() : "";
  const name = get("name");
  if (!name) return null;
  const now = new Date().toISOString();
  const number = (value: string) => value ? Number(value.replace(/[^\d.,-]/g, "").replace(",", ".")) || undefined : undefined;
  const platform = get("socialPlatform").toLowerCase();
  const supportedPlatforms = ["instagram", "linkedin", "tiktok", "facebook", "x", "youtube"] as const;
  const socialPlatform = platform
    ? supportedPlatforms.find((item) => platform.includes(item)) ?? "other"
    : undefined;
  return {
    id: crypto.randomUUID(),
    workspaceId,
    name,
    email: get("email") || undefined,
    phone: get("phone") || undefined,
    company: get("company") || undefined,
    jobTitle: get("jobTitle") || undefined,
    industry: get("industry") || undefined,
    country: get("country") || undefined,
    source: get("source") || undefined,
    socialPlatform,
    socialHandle: get("socialHandle") || undefined,
    socialProfileUrl: get("socialProfileUrl") || undefined,
    followerCount: number(get("followerCount")),
    socialEngagementRate: number(get("socialEngagementRate")),
    directMessages: number(get("directMessages")),
    postComments: number(get("postComments")),
    socialClicks: number(get("socialClicks")),
    campaign: get("campaign") || undefined,
    companySize: number(get("companySize")),
    estimatedBudget: number(get("estimatedBudget")),
    notes: get("notes") || undefined,
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}
