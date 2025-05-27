"use client";

type Section = {
  title: string;
  points: string[];
};

type DocumentContentProps = {
  title: string;
  sections: Section[];
};

export function SampleDocumentContent({ title, sections }: DocumentContentProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-medium">{title}</h2>
      
      <div className="space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="rounded-lg bg-[rgba(255,255,255,0.06)] p-4">
            <h3 className="mb-2 font-medium">{section.title}</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {section.points.map((point, j) => (
                <li key={j}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button className="rounded-md bg-[var(--gemini-accent)] px-4 py-2 text-sm font-medium text-black">
          Export as Markdown
        </button>
      </div>
    </div>
  );
} 