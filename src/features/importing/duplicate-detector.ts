import type { Lead } from "@/types/lead";
import { normalizeEmail, normalizePhone, normalizeText } from "@/features/scoring/normalizers";

export function duplicateKey(lead: Lead): string {
  const email = normalizeEmail(lead.email);
  if (email) return `email:${email}`;
  const phone = normalizePhone(lead.phone);
  if (phone) return `phone:${phone}`;
  if (lead.socialPlatform && lead.socialHandle) {
    return `social:${lead.socialPlatform}:${normalizeText(lead.socialHandle).replace(/^@/, "")}`;
  }
  return `identity:${normalizeText(lead.company)}:${normalizeText(lead.name)}`;
}

export function withoutDuplicates(incoming: Lead[], existing: Lead[]): Lead[] {
  const seen = new Set(existing.map(duplicateKey));
  return incoming.filter((lead) => {
    const key = duplicateKey(lead);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
