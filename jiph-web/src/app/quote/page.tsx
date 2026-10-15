import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import QuoteList from "@/components/QuoteList";

export const metadata: Metadata = {
  title: "Quote list",
  description: "Review the JIPH furniture you’ve selected and request a project quote.",
  robots: { index: false },
};

export default function QuotePage() {
  return (
    <div className="wrap page">
      <p className="eyebrow">Quote list</p>
      <h1>Your selection</h1>
      <p className="lead">Adjust quantities, then send the list. We reply with drawings, samples and pricing for your project. Nothing is charged online.</p>
      <div className="quote-layout">
        <QuoteList />
        <div className="card">
          <h2>Your details</h2>
          <LeadForm mode="quote" />
        </div>
      </div>
    </div>
  );
}
