import { Database } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-56 place-items-center text-center">
      <div>
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-[#e7eee9] text-[#116149]"><Database /></span>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm leading-6 text-[#69736d]">{description}</p>
      </div>
    </div>
  );
}
