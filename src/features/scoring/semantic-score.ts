import type { Lead } from "@/types/lead";

interface TensorResult {
  data: Float32Array | number[];
}

type Extractor = (
  text: string,
  options: { pooling: "mean"; normalize: true },
) => Promise<TensorResult>;

let extractorPromise: Promise<Extractor> | null = null;
const embeddingCache = new Map<string, number[]>();

async function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      const supportsWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
      const model = await pipeline(
        "feature-extraction",
        "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
        { device: supportsWebGpu ? "webgpu" : "wasm", dtype: "q8" },
      );
      return model as unknown as Extractor;
    })();
  }
  return extractorPromise;
}

function describeLead(lead: Lead): string {
  return [
    lead.company && `Empresa: ${lead.company}`,
    lead.industry && `Sector: ${lead.industry}`,
    lead.jobTitle && `Cargo: ${lead.jobTitle}`,
    lead.country && `País: ${lead.country}`,
    lead.socialPlatform && `Red social: ${lead.socialPlatform}`,
    lead.socialHandle && `Usuario: ${lead.socialHandle}`,
    lead.followerCount && `Seguidores: ${lead.followerCount}`,
    lead.socialEngagementRate && `Engagement social: ${lead.socialEngagementRate}%`,
    lead.campaign && `Campaña: ${lead.campaign}`,
    lead.companySize && `Empleados: ${lead.companySize}`,
    lead.estimatedBudget && `Presupuesto: ${lead.estimatedBudget} euros`,
    lead.notes && `Notas: ${lead.notes}`,
    lead.tags.length && `Etiquetas: ${lead.tags.join(", ")}`,
  ].filter(Boolean).join(". ");
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    magnitudeA += a[index] ** 2;
    magnitudeB += b[index] ** 2;
  }
  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return denominator ? dot / denominator : 0;
}

async function embed(text: string): Promise<number[]> {
  const cached = embeddingCache.get(text);
  if (cached) return cached;
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  const vector = Array.from(output.data);
  embeddingCache.set(text, vector);
  return vector;
}

export async function calculateSemanticSimilarity(
  lead: Lead,
  idealCustomerDescription: string,
): Promise<number> {
  const description = describeLead(lead);
  if (!description || !idealCustomerDescription.trim()) return 0;
  const [leadEmbedding, profileEmbedding] = await Promise.all([
    embed(description),
    embed(idealCustomerDescription),
  ]);
  return Math.max(0, Math.min(cosineSimilarity(leadEmbedding, profileEmbedding), 1));
}

export function resetSemanticModel(): void {
  extractorPromise = null;
  embeddingCache.clear();
}
