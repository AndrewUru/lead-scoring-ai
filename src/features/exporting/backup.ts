import { db } from "@/db/database";

export async function downloadBackup(): Promise<void> {
  const [workspaces, leads, scoringConfigurations] = await Promise.all([
    db.workspaces.toArray(),
    db.leads.toArray(),
    db.scoringConfigurations.toArray(),
  ]);
  const payload = JSON.stringify(
    { format: "locallead-ai", version: 1, exportedAt: new Date().toISOString(), workspaces, leads, scoringConfigurations },
    null,
    2,
  );
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `locallead-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File): Promise<void> {
  const parsed = JSON.parse(await file.text()) as {
    format: string;
    workspaces: never[];
    leads: never[];
    scoringConfigurations: never[];
  };
  if (parsed.format !== "locallead-ai" || !Array.isArray(parsed.leads)) throw new Error("Copia no válida");
  await db.transaction("rw", db.workspaces, db.leads, db.scoringConfigurations, async () => {
    await Promise.all([db.workspaces.clear(), db.leads.clear(), db.scoringConfigurations.clear()]);
    await db.workspaces.bulkPut(parsed.workspaces);
    await db.leads.bulkPut(parsed.leads);
    await db.scoringConfigurations.bulkPut(parsed.scoringConfigurations);
  });
}
