"use client";

import { useState, type FormEvent } from "react";
import { useQuote } from "@/lib/quote-store";

const projectTypes = ["School", "College / University", "Hostel", "Office", "Government / Tender", "Other"];
const timelines = ["Within 1 month", "1–3 months", "3–6 months", "Just exploring"];

type Errors = Record<string, string[] | undefined>;

export default function LeadForm({ mode }: { mode: "enquiry" | "quote" }) {
  const items = useQuote((s) => s.items);
  const clear = useQuote((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [doneId, setDoneId] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(fd.entries());
    body.consent = fd.get("consent") === "on";
    body.source = typeof window !== "undefined" ? window.location.pathname : "";
    if (mode === "quote") body.items = items.map(({ slug, name, sizeCode, sizeLabel, finish, qty }) => ({ slug, name, sizeCode, sizeLabel, finish, qty }));

    setBusy(true);
    setErrors({});
    setMessage("");
    try {
      const res = await fetch(mode === "quote" ? "/api/quotes" : "/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setMessage(json.error ?? "Something went wrong. Please call us on +91 74046 50000.");
        return;
      }
      setDoneId(json.id);
      if (mode === "quote") clear();
    } catch {
      setMessage("We couldn’t reach the server. Check your connection, or call +91 74046 50000.");
    } finally {
      setBusy(false);
    }
  }

  if (doneId) {
    return (
      <div className="form-done" role="status">
        <h3>{mode === "quote" ? "Quote request sent" : "Enquiry sent"}</h3>
        <p>Your reference is <strong className="mono">{doneId}</strong>. Our team will call you within one working day.</p>
      </div>
    );
  }

  const err = (k: string) => errors[k]?.[0];
  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} name={id} aria-invalid={!!err(id)} aria-describedby={err(id) ? `${id}-err` : undefined} {...props} />
      {err(id) && <small id={`${id}-err`} className="err">{err(id)}</small>}
    </label>
  );

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate>
      <div className="grid2">
        {field("name", "Your name", { required: true, autoComplete: "name" })}
        {field("role", "Role (e.g. Principal, Admin)", { autoComplete: "organization-title" })}
        {field("institution", "Institution", { required: true, autoComplete: "organization" })}
        {field("city", "City", { autoComplete: "address-level2" })}
        {field("phone", "Phone", { required: true, type: "tel", autoComplete: "tel", inputMode: "tel" })}
        {field("email", "Email", { required: true, type: "email", autoComplete: "email" })}
        <label className="field" htmlFor="projectType">
          <span>Project type</span>
          <select id="projectType" name="projectType" defaultValue="School">{projectTypes.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="field" htmlFor="timeline">
          <span>Timeline</span>
          <select id="timeline" name="timeline" defaultValue="1–3 months">{timelines.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
      </div>
      <label className="field" htmlFor="message">
        <span>{mode === "quote" ? "Anything else (room sizes, delivery site, deadline)" : "What do you need?"}</span>
        <textarea id="message" name="message" rows={4} />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <label className="check" htmlFor="consent">
        <input id="consent" name="consent" type="checkbox" />
        <span>JIPH may contact me by phone, WhatsApp or email about this enquiry.</span>
      </label>
      {err("consent") && <small className="err">{err("consent")}</small>}
      {err("items") && <small className="err">{err("items")}</small>}
      {message && <p className="form-msg" role="alert">{message}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy || (mode === "quote" && items.length === 0)}>
        {busy ? "Sending…" : mode === "quote" ? `Request quote for ${items.length} item${items.length === 1 ? "" : "s"}` : "Send enquiry"}
      </button>
    </form>
  );
}
