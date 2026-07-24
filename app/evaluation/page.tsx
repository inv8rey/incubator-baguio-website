import type { Metadata } from "next";
import EvaluationForm from "./EvaluationForm";

export const metadata: Metadata = {
  title: "Consultation & Mentoring Feedback Form — Incubator Baguio",
  description:
    "A private feedback form for Incubator Baguio consultation and mentoring visitors.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function EvaluationPage() {
  return (
    <main className="evaluation-page">
      <section className="evaluation-hero">
        <div className="evaluation-brand">
          <img src={`${BP}/assets/city-of-baguio-seal.png`} alt="City of Baguio" width={46} height={46} />
          <img src={`${BP}/assets/cpdso-logo.png`} alt="CPDSO" width={46} height={46} />
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" width={42} height={34} />
        </div>
        <p className="evaluation-kicker">Incubator Baguio</p>
        <h1>Consultation & Mentoring Feedback Form</h1>
        <p className="evaluation-lede">
          Thank you for visiting Incubator Baguio! We value your feedback. This
          short survey will take about 2 minutes to complete and will help us
          improve our consultation and mentoring services.
        </p>
      </section>

      <section className="evaluation-body" aria-label="Feedback form">
        <EvaluationForm />
      </section>
    </main>
  );
}
