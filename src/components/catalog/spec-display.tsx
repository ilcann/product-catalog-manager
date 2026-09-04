import { cn } from "@/lib/utils";
import { SPEC_GROUPS, type Specification, type TechDocument } from "@/lib/catalog/types";
import { FileText, ShieldCheck, BookOpen, FlaskConical, Award, Download } from "lucide-react";

export function SpecGroups({
  specs,
  highlightKeys = [],
}: {
  specs: Specification[];
  highlightKeys?: string[];
}) {
  const groups = SPEC_GROUPS.map((g) => ({
    ...g,
    items: specs.filter((s) => s.group === g.id),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">Teknik özellik girilmemiş.</p>;
  }

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.id}>
          <div className="tech-rule pb-2">
            <span className="tech-label">
              {g.label} · {g.labelTr}
            </span>
          </div>
          <dl className="mt-1">
            {g.items.map((s) => (
              <div
                key={s.id + s.key}
                className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2"
              >
                <dt className="text-sm text-muted-foreground">{s.key}</dt>
                <dd className="text-right text-sm font-medium text-foreground">
                  {s.value}
                  {s.unit ? <span className="ml-1 text-muted-foreground">{s.unit}</span> : null}
                  {highlightKeys.includes(s.key.toLowerCase()) ? (
                    <span className="ml-2 rounded-xs bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      override
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

const kindMeta: Record<TechDocument["kind"], { label: string; Icon: typeof FileText }> = {
  datasheet: { label: "Teknik Föy", Icon: FileText },
  manual: { label: "Kılavuz", Icon: BookOpen },
  warranty: { label: "Garanti", Icon: ShieldCheck },
  "test-report": { label: "Test Raporu", Icon: FlaskConical },
  certificate: { label: "Sertifika", Icon: Award },
};

export function DocumentList({ documents }: { documents: TechDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">Belge eklenmemiş.</p>;
  }
  return (
    <ul className="divide-y divide-border border-y border-border">
      {documents.map((d) => {
        const meta = kindMeta[d.kind];
        return (
          <li key={d.id} className="flex items-center gap-3 py-3">
            <meta.Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.title}</p>
              <p className="truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {meta.label}
                {d.issuer ? ` · ${d.issuer}` : ""}
                {d.reference ? ` · ${d.reference}` : ""}
              </p>
            </div>
            <a
              href={d.url || undefined}
              download={d.url ? true : undefined}
              target={d.url ? "_blank" : undefined}
              rel={d.url ? "noreferrer" : undefined}
              aria-disabled={!d.url}
              aria-label={`${d.title} indir`}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md border transition-colors",
                 d.url
                  ? "cursor-pointer border-border text-muted-foreground hover:border-accent hover:text-accent"
                  : "pointer-events-none border-border/50 text-muted-foreground/40",
              )}
            >
              <Download className="size-4" strokeWidth={1.5} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
