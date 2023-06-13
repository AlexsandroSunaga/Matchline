import Link from "next/link";
import { ArrowRight, GitMerge, Upload, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MarketingPage() {
  return (
    <div className="min-h-screen paper-bg relative">
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />
      <header className="relative max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-stone-300/80">
        <div>
          <p className="text-xs uppercase text-orange-700 font-bold tracking-widest">ACME Data</p>
          <p className="font-bold text-xl text-stone-900">Record Match</p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm">Console</Button>
        </Link>
      </header>
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <p className="text-sm text-stone-600">Pipeline pillar · warm paper UI · Alexsandro Sunaga</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 max-w-3xl text-stone-900 leading-tight">
          Dedup vendor data on a{" "}
          <span className="text-orange-600 underline decoration-orange-300 decoration-4 underline-offset-4">
            analyst workbench
          </span>
        </h1>
        <p className="mt-6 text-lg text-stone-700 max-w-2xl">
          Stone sidebar, paper grid background, orange accents — built to look different from the purple RAG app and cyan support desk.
        </p>
        <Link href="/dashboard/match" className="inline-block mt-8">
          <Button size="lg" className="gap-2">
            Start match job <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
      <section className="relative max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { icon: Upload, title: "Match workspace", desc: "CSV upload on cream panels." },
          { icon: GitMerge, title: "Cluster review", desc: "Merge tables with confidence scores." },
          { icon: Workflow, title: "Pipeline", desc: "Ingest → block → review story." },
        ].map((f) => (
          <div key={f.title} className="panel p-6">
            <f.icon className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="font-bold text-stone-900">{f.title}</h3>
            <p className="text-sm text-stone-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
