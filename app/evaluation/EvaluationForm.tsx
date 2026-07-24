"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const visitorTypes = [
  "Student",
  "Startup Founder",
  "Aspiring Entrepreneur",
  "MSME Owner",
  "Researcher / Faculty",
  "Government Representative",
  "Industry Partner",
  "Other",
];

const visitPurposes = [
  "Startup Consultation",
  "Business Mentoring",
  "Partnership Discussion",
  "Innovation Project",
  "Research / Commercialization",
  "General Inquiry",
  "Other",
];

const startupStages = [
  "Idea",
  "Prototype",
  "MVP",
  "Launched",
  "Growing",
  "Not applicable",
];

const ratings = [
  "The staff was welcoming and professional.",
  "The consultation addressed my questions or needs.",
  "The information and advice provided were helpful.",
  "Overall, I am satisfied with my experience.",
];

type Scores = Record<string, string>;

export default function EvaluationForm() {
  const [visitorType, setVisitorType] = useState("");
  const [visitorTypeOther, setVisitorTypeOther] = useState("");
  const [visitPurpose, setVisitPurpose] = useState("");
  const [visitPurposeOther, setVisitPurposeOther] = useState("");
  const [startupName, setStartupName] = useState("");
  const [respondentRole, setRespondentRole] = useState("");
  const [organizationContact, setOrganizationContact] = useState("");
  const [startupSector, setStartupSector] = useState("");
  const [startupStage, setStartupStage] = useState("");
  const [scores, setScores] = useState<Scores>({});
  const [likedMost, setLikedMost] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [improvements, setImprovements] = useState("");
  const [recommend, setRecommend] = useState("");
  const [updates, setUpdates] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const answeredRatings = useMemo(
    () => ratings.every((statement) => scores[statement]),
    [scores]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextErrors: Record<string, string> = {};

    if (!visitorType) nextErrors.visitorType = "Please select one.";
    if (visitorType === "Other" && !visitorTypeOther.trim()) {
      nextErrors.visitorTypeOther = "Please specify your answer.";
    }
    if (!visitPurpose) nextErrors.visitPurpose = "Please select one.";
    if (visitPurpose === "Other" && !visitPurposeOther.trim()) {
      nextErrors.visitPurposeOther = "Please specify your answer.";
    }
    if (!answeredRatings) nextErrors.ratings = "Please rate each statement.";
    if (!takeaway.trim()) nextErrors.takeaway = "Please share your response.";
    if (!recommend) nextErrors.recommend = "Please select one.";
    if (!updates) nextErrors.updates = "Please select one.";
    if (updates === "Yes" && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      if (!supabase) {
        setErrors({
          submit:
            "The feedback service is not configured yet. Please try again later.",
        });
        return;
      }

      setSaving(true);
      const { error } = await supabase.from("consultation_feedback").insert({
        visitor_type: visitorType,
        visitor_type_other: visitorType === "Other" ? visitorTypeOther.trim() : "",
        visit_purpose: visitPurpose,
        visit_purpose_other: visitPurpose === "Other" ? visitPurposeOther.trim() : "",
        startup_name: startupName.trim(),
        respondent_role: respondentRole.trim(),
        organization_contact: organizationContact.trim(),
        startup_sector: startupSector.trim(),
        startup_stage: startupStage,
        ratings: scores,
        liked_most: likedMost.trim(),
        takeaway: takeaway.trim(),
        improvements: improvements.trim(),
        would_recommend: recommend,
        wants_updates: updates === "Yes",
        email: updates === "Yes" ? email.trim() : "",
      });
      setSaving(false);

      if (error) {
        setErrors({
          submit:
            "We could not save your feedback right now. Please try again in a moment.",
        });
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (submitted) {
    return (
      <div className="evaluation-thanks" role="status">
        <div className="evaluation-check" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2>Thank You!</h2>
        <p>
          Thank you for taking the time to share your feedback. Your responses
          help us continuously improve our services and strengthen Baguio
          City&apos;s startup and innovation ecosystem.
        </p>
      </div>
    );
  }

  return (
    <form className="evaluation-form" onSubmit={submit}>
      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>1</span>
          What best describes you?
        </h2>
        <p className="evaluation-hint">Select one</p>
        <div className="evaluation-options">
          {visitorTypes.map((type) => (
            <label key={type} className="evaluation-choice">
              <input
                type="radio"
                name="visitorType"
                value={type}
                checked={visitorType === type}
                onChange={(event) => setVisitorType(event.target.value)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        {visitorType === "Other" && (
          <input
            className="evaluation-input"
            value={visitorTypeOther}
            onChange={(event) => setVisitorTypeOther(event.target.value)}
            placeholder="Please specify"
          />
        )}
        {errors.visitorType && <p className="evaluation-error">{errors.visitorType}</p>}
        {errors.visitorTypeOther && <p className="evaluation-error">{errors.visitorTypeOther}</p>}
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>2</span>
          What was the primary purpose of your visit?
        </h2>
        <p className="evaluation-hint">Select one</p>
        <div className="evaluation-options">
          {visitPurposes.map((purpose) => (
            <label key={purpose} className="evaluation-choice">
              <input
                type="radio"
                name="visitPurpose"
                value={purpose}
                checked={visitPurpose === purpose}
                onChange={(event) => setVisitPurpose(event.target.value)}
              />
              <span>{purpose}</span>
            </label>
          ))}
        </div>
        {visitPurpose === "Other" && (
          <input
            className="evaluation-input"
            value={visitPurposeOther}
            onChange={(event) => setVisitPurposeOther(event.target.value)}
            placeholder="Please specify"
          />
        )}
        {errors.visitPurpose && <p className="evaluation-error">{errors.visitPurpose}</p>}
        {errors.visitPurposeOther && <p className="evaluation-error">{errors.visitPurposeOther}</p>}
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>3</span>
          Startup / organization details
        </h2>
        <p className="evaluation-hint">Optional, but helpful for follow-up and ecosystem tracking</p>
        <div className="evaluation-field-grid">
          <div>
            <label>Startup / organization name</label>
            <input
              className="evaluation-input"
              value={startupName}
              onChange={(event) => setStartupName(event.target.value)}
              placeholder="Name of startup, business, school, or organization"
            />
          </div>
          <div>
            <label>Your role</label>
            <input
              className="evaluation-input"
              value={respondentRole}
              onChange={(event) => setRespondentRole(event.target.value)}
              placeholder="Founder, student, owner, researcher, etc."
            />
          </div>
          <div className="evaluation-field-wide">
            <label>Where can we contact you?</label>
            <input
              className="evaluation-input"
              value={organizationContact}
              onChange={(event) => setOrganizationContact(event.target.value)}
              placeholder="Email, phone number, Facebook page, LinkedIn, or website"
            />
          </div>
          <div>
            <label>Sector / focus area</label>
            <input
              className="evaluation-input"
              value={startupSector}
              onChange={(event) => setStartupSector(event.target.value)}
              placeholder="Food, tourism, tech, creative, research, etc."
            />
          </div>
          <div>
            <label>Current stage</label>
            <select
              className="evaluation-input"
              value={startupStage}
              onChange={(event) => setStartupStage(event.target.value)}
            >
              <option value="">Select if applicable</option>
              {startupStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>4</span>
          Please rate your experience.
        </h2>
        <p className="evaluation-hint">
          Scale: 1 = Strongly Disagree | 2 = Disagree | 3 = Neutral | 4 =
          Agree | 5 = Strongly Agree
        </p>
        <div className="evaluation-rating-table">
          <div className="evaluation-rating-head">
            <span>Statement</span>
            {[1, 2, 3, 4, 5].map((score) => (
              <span key={score}>{score}</span>
            ))}
          </div>
          {ratings.map((statement) => (
            <div className="evaluation-rating-row" key={statement}>
              <p>{statement}</p>
              {[1, 2, 3, 4, 5].map((score) => (
                <label key={score} aria-label={`${statement} ${score}`}>
                  <input
                    type="radio"
                    name={statement}
                    value={score}
                    checked={scores[statement] === String(score)}
                    onChange={(event) =>
                      setScores((current) => ({
                        ...current,
                        [statement]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          ))}
        </div>
        {errors.ratings && <p className="evaluation-error">{errors.ratings}</p>}
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>5</span>
          What did you like most about today&apos;s consultation or mentoring
          session?
        </h2>
        <p className="evaluation-hint">Optional</p>
        <textarea
          className="evaluation-textarea"
          value={likedMost}
          onChange={(event) => setLikedMost(event.target.value)}
          placeholder="Your response"
        />
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>6</span>
          What was your biggest takeaway from today&apos;s consultation, and how
          do you plan to apply it?
        </h2>
        <textarea
          className="evaluation-textarea"
          value={takeaway}
          onChange={(event) => setTakeaway(event.target.value)}
          placeholder="Your response"
        />
        {errors.takeaway && <p className="evaluation-error">{errors.takeaway}</p>}
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>7</span>
          How can we improve our consultation and mentoring services?
        </h2>
        <p className="evaluation-hint">Optional</p>
        <textarea
          className="evaluation-textarea"
          value={improvements}
          onChange={(event) => setImprovements(event.target.value)}
          placeholder="Your response"
        />
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>8</span>
          Would you recommend Incubator Baguio to others?
        </h2>
        <div className="evaluation-options evaluation-options-compact">
          {["Yes", "Maybe", "No"].map((answer) => (
            <label key={answer} className="evaluation-choice">
              <input
                type="radio"
                name="recommend"
                value={answer}
                checked={recommend === answer}
                onChange={(event) => setRecommend(event.target.value)}
              />
              <span>{answer}</span>
            </label>
          ))}
        </div>
        {errors.recommend && <p className="evaluation-error">{errors.recommend}</p>}
      </section>

      <section className="evaluation-section">
        <h2 className="evaluation-question">
          <span>9</span>
          Would you like to receive updates on future programs, events, and
          opportunities from Incubator Baguio?
        </h2>
        <div className="evaluation-options evaluation-options-compact">
          {["Yes", "No"].map((answer) => (
            <label key={answer} className="evaluation-choice">
              <input
                type="radio"
                name="updates"
                value={answer}
                checked={updates === answer}
                onChange={(event) => setUpdates(event.target.value)}
              />
              <span>{answer}</span>
            </label>
          ))}
        </div>
        {updates === "Yes" && (
          <div className="evaluation-email">
            <label>If yes, please provide your email address (optional):</label>
            <input
              className="evaluation-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
        )}
        {errors.updates && <p className="evaluation-error">{errors.updates}</p>}
        {errors.email && <p className="evaluation-error">{errors.email}</p>}
      </section>

      {errors.submit && <p className="evaluation-error">{errors.submit}</p>}

      <button className="evaluation-submit" type="submit" disabled={saving}>
        {saving ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}
