import Link from "next/link";
import { ArrowRight, GitMerge, Upload, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MarketingPage() {
  return (
    <div className="min-h-screen paper-bg relative">
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />
      <header className="relative max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-stone-300/80">
        <div>
          <p className="text-xs uppercase text-orange-700 font-bold tracking-widest">Matchline Data</p>
          <p className="font-bold text-xl text-stone-900">Record Match</p>
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm">Console</Button>
        </Link>
      </header>
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <p className="text-sm text-stone-600">Built by Alexsandro Sunaga</p>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 max-w-3xl text-stone-900 leading-tight">
          Find the duplicate companies in your{" "}
          <span className="text-orange-600 underline decoration-orange-300 decoration-4 underline-offset-4">
            vendor list
          </span>
        </h1>
        <p className="mt-6 text-lg text-stone-700 max-w-2xl">
          Upload a CSV and see which rows are the same business written differently, such as Acme Inc, ACME Incorporated and
          Acme Ltd. Review the groups, then download one clean row per company.
        </p>
        <Link href="/dashboard/match" className="inline-block mt-8">
          <Button size="lg" className="gap-2">
            Try it with a sample file <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
      <section className="relative max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { icon: Upload, title: "Match workspace", desc: "Upload a CSV, set how strict the match is, and run it." },
          { icon: GitMerge, title: "Duplicate groups", desc: "Each group says why a row is in it: a similar name, the same email, or both." },
          { icon: Workflow, title: "Clean export", desc: "Download one row per company with the source rows it replaces." },
        ].map((f) => (
          <div key={f.title} className="panel p-6">
            <f.icon className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="font-bold text-stone-900">{f.title}</h3>
            <p className="text-sm text-stone-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </section>
      <footer className="relative max-w-6xl mx-auto px-6 pb-10 text-xs text-stone-500">
        The sample vendors are made up.
      </footer>
    </div>
  );
}
