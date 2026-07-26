import Dexie, { type EntityTable } from "dexie";
import type { Lead } from "@/types/lead";
import type { ScoringConfiguration } from "@/types/scoring";
import type { Workspace } from "@/types/workspace";

export class LocalLeadDatabase extends Dexie {
  leads!: EntityTable<Lead, "id">;
  workspaces!: EntityTable<Workspace, "id">;
  scoringConfigurations!: EntityTable<ScoringConfiguration, "id">;

  constructor() {
    super("locallead-ai");
    this.version(1).stores({
      leads:
        "id, workspaceId, email, phone, company, industry, source, createdAt, updatedAt, score.status, score.total",
      workspaces: "id, name, createdAt",
      scoringConfigurations: "id, workspaceId, name, version, updatedAt",
    });
    this.version(2).stores({
      leads:
        "id, workspaceId, email, phone, company, industry, source, socialPlatform, socialHandle, campaign, createdAt, updatedAt, score.status, score.total",
      workspaces: "id, name, createdAt",
      scoringConfigurations: "id, workspaceId, name, version, updatedAt",
    });
  }
}

export const db = new LocalLeadDatabase();
