import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { subjects } from "@/lib/mock-data";

export default function SubjectsPage() {
  const compulsory = subjects.filter((s) => s.group === "Compulsory");
  const optional = subjects.filter((s) => s.group === "Optional");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Subjects</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Every subject includes syllabus, notes, books, past papers, quizzes, and an AI Tutor.
        </p>
      </div>

      <SubjectGroup title="Compulsory Subjects" items={compulsory} />
      <SubjectGroup title="Optional Subjects" items={optional} />
    </div>
  );
}

function SubjectGroup({
  title,
  items,
}: {
  title: string;
  items: typeof subjects;
}) {
  return (
    <section>
      <h2 className="font-semibold text-on-surface mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((s) => (
          <Link key={s.slug} href={`/subjects/${s.slug}`}>
            <Card className="p-5 h-full flex flex-col hover:bg-surface-container-low transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/15 text-primary mb-3">
                <Icon name={s.icon} filled />
              </div>
              <h3 className="font-medium text-on-surface text-sm leading-snug">{s.name}</h3>
              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                  <span>Progress</span>
                  <span>{s.progress}%</span>
                </div>
                <ProgressBar value={s.progress} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
