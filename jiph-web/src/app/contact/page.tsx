import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import { company } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Contact and factory visit",
  description: "Enquire about institutional furniture or book a visit to the JIPH factory in Gharaunda, Haryana.",
};

export default function ContactPage() {
  return (
    <div className="wrap page">
      <p className="eyebrow">Contact</p>
      <h1>Tell us about your project.</h1>
      <p className="lead">Share the institution, rooms and student numbers. We’ll call within one working day, and can arrange a visit to our factory to see samples.</p>
      <div className="quote-layout">
        <div className="card">
          <LeadForm mode="enquiry" />
        </div>
        <aside className="contact-side">
          <h2>Factory and head office</h2>
          <p>{company.address}</p>
          <h2>Phone</h2>
          <p>{company.phones.map((p) => <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="block">{p}</a>)}</p>
          <h2>Email</h2>
          <p><a href={`mailto:${company.email}`}>{company.email}</a></p>
          <h2>WhatsApp</h2>
          <p><a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener">Chat on WhatsApp</a></p>
          <p><a href="https://maps.google.com/?q=JIPH+Furniture+Gharaunda" target="_blank" rel="noopener">Open in Google Maps →</a></p>
        </aside>
      </div>
    </div>
  );
}
