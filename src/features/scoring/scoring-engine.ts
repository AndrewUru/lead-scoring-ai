import type { Lead, LeadScore } from "@/types/lead";
import type { IdealCustomerProfile } from "@/types/scoring";
import { normalizeText } from "./normalizers";

interface PartialScore {
  points: number;
  positives: string[];
  negatives: string[];
}

function calculateFit(lead: Lead, profile: IdealCustomerProfile): PartialScore {
  let points = 0;
  const positives: string[] = [];
  const negatives: string[] = [];
  const industry = normalizeText(lead.industry);
  const country = normalizeText(lead.country);
  const title = normalizeText(lead.jobTitle);
  const notes = normalizeText(`${lead.notes ?? ""} ${lead.tags.join(" ")}`);

  if (profile.industries.some((item) => normalizeText(item) === industry)) {
    points += 10;
    positives.push("Sector incluido en el perfil ideal");
  } else if (industry) negatives.push("Sector fuera del perfil prioritario");

  if (profile.countries.some((item) => normalizeText(item) === country)) {
    points += 5;
    positives.push("Ubicación dentro del mercado objetivo");
  }
  if (profile.jobTitles.some((item) => title.includes(normalizeText(item)))) {
    points += 8;
    positives.push("Cargo con capacidad de decisión");
  }
  if (
    lead.companySize &&
    (!profile.minimumCompanySize || lead.companySize >= profile.minimumCompanySize) &&
    (!profile.maximumCompanySize || lead.companySize <= profile.maximumCompanySize)
  ) {
    points += 6;
    positives.push("Tamaño de empresa compatible");
  }
  if (lead.estimatedBudget && profile.minimumBudget) {
    if (lead.estimatedBudget >= profile.minimumBudget) {
      points += 6;
      positives.push("Presupuesto compatible");
    } else negatives.push("Presupuesto inferior al mínimo configurado");
  }
  for (const keyword of profile.excludedKeywords) {
    if (notes.includes(normalizeText(keyword))) {
      points -= 8;
      negatives.push(`Contiene término excluido: ${keyword}`);
    }
  }
  return { points: Math.max(0, Math.min(points, 35)), positives, negatives };
}

function calculateIntent(lead: Lead): PartialScore {
  let points = 0;
  const positives: string[] = [];
  if (lead.requestedQuote) {
    points += 12;
    positives.push("Ha solicitado presupuesto");
  }
  if (lead.requestedDemo) {
    points += 10;
    positives.push("Ha solicitado una demostración");
  }
  if ((lead.formSubmissions ?? 0) > 0) {
    points += Math.min((lead.formSubmissions ?? 0) * 3, 6);
    positives.push("Ha enviado formularios");
  }
  if (lead.downloadedResource) {
    points += 3;
    positives.push("Ha descargado contenido");
  }
  if ((lead.directMessages ?? 0) > 0) {
    points += Math.min((lead.directMessages ?? 0) * 4, 8);
    positives.push("Ha iniciado una conversación por redes sociales");
  }
  if ((lead.postComments ?? 0) > 0) {
    points += Math.min((lead.postComments ?? 0) * 2, 4);
    positives.push("Ha comentado contenido de la marca");
  }
  return { points: Math.min(points, 25), positives, negatives: [] };
}

function calculateEngagement(lead: Lead): PartialScore {
  const raw =
    Math.min(lead.websiteVisits ?? 0, 8) +
    Math.min((lead.emailOpens ?? 0) * 0.5, 4) +
    Math.min((lead.emailClicks ?? 0) * 2, 8) +
    Math.min((lead.socialClicks ?? 0) * 1.5, 6) +
    Math.min((lead.socialEngagementRate ?? 0) / 2, 4);
  const points = Math.min(Math.round(raw), 20);
  return {
    points,
    positives: points >= 12 ? ["Nivel de interacción elevado"] : points ? ["Ha interactuado con la empresa"] : [],
    negatives: points ? [] : ["No se han registrado interacciones"],
  };
}

function calculateDataQuality(lead: Lead): PartialScore {
  const contactChannel = lead.email || lead.phone || lead.socialHandle;
  const fields = [lead.name, contactChannel, lead.company, lead.jobTitle, lead.industry, lead.country, lead.socialPlatform || lead.source];
  const points = Math.round((fields.filter(Boolean).length / fields.length) * 10);
  const negatives: string[] = [];
  if (!lead.email) negatives.push("No se dispone de correo electrónico");
  if (!lead.phone) negatives.push("No se dispone de teléfono");
  if (!lead.email && !lead.phone && lead.socialHandle) {
    negatives.splice(0, 2, "Contacto disponible únicamente por redes sociales");
  }
  if (!lead.company) negatives.push("No se ha identificado la empresa");
  return {
    points,
    positives: points >= 8 ? ["Información de contacto suficientemente completa"] : [],
    negatives,
  };
}

export function statusForScore(score: number): LeadScore["status"] {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "nurturing";
  return "cold";
}

export function calculateLeadScore(
  lead: Lead,
  profile: IdealCustomerProfile,
  semanticSimilarity = 0,
  scoringVersion = 1,
): LeadScore {
  const fit = calculateFit(lead, profile);
  const intent = calculateIntent(lead);
  const engagement = calculateEngagement(lead);
  const dataQuality = calculateDataQuality(lead);
  const semantic = Math.round(Math.max(0, Math.min(semanticSimilarity, 1)) * 10);
  const total = Math.min(100, fit.points + intent.points + engagement.points + dataQuality.points + semantic);
  const known = fit.points + intent.points + engagement.points + dataQuality.points;
  return {
    total,
    status: statusForScore(total),
    confidence: Number(Math.min(0.98, 0.45 + known / 150 + (semanticSimilarity > 0 ? 0.1 : 0)).toFixed(2)),
    breakdown: { fit: fit.points, intent: intent.points, engagement: engagement.points, dataQuality: dataQuality.points, semantic },
    positiveSignals: [...fit.positives, ...intent.positives, ...engagement.positives, ...dataQuality.positives],
    negativeSignals: [...fit.negatives, ...intent.negatives, ...engagement.negatives, ...dataQuality.negatives],
    recommendedAction:
      total >= 80
        ? "Contactar personalmente en menos de 24 horas"
        : total >= 60
          ? "Incluir en una secuencia comercial prioritaria"
          : total >= 40
            ? "Añadir a una campaña de nutrición"
            : "Mantener en seguimiento de baja prioridad",
    scoringVersion,
    calculatedAt: new Date().toISOString(),
  };
}
