"use client";

import { useState } from "react";

export interface Question {
  id: string;
  label: string;
}

interface Props {
  questions: Question[];
  onSubmit: (answers: string) => void;
}

const GOAL_OPTIONS = [
  "Build audience",
  "Sell product / service",
  "Brand awareness",
  "Share knowledge",
  "Other"
];

export function QuestionnaireForm({ questions, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [goal, setGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");

  const handleSubmit = () => {
    const finalGoal = goal === "Other" ? customGoal : goal;
    if (!finalGoal) return;
    
    let answersText = questions.map(q => `${q.label}: ${answers[q.id] || "N/A"}`).join("\n");
    answersText += `\nGoal: ${finalGoal}`;
    onSubmit(answersText);
  };

  const isFormValid = goal && (goal !== "Other" || customGoal.trim().length > 0) && questions.every(q => answers[q.id]?.trim());

  return (
    <div className="mt-4 bg-[var(--surface-2)] border border-[var(--border)] p-4 sm:p-5 rounded-[16px] shadow-sm max-w-[500px]">
      <h3 className="text-[15px] font-semibold mb-4 text-[var(--text-primary)]">Please provide a few more details:</h3>
      
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              {q.label} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-[var(--brand)] transition-colors"
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Your answer..."
            />
          </div>
        ))}

        <div>
          <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
            What do you want to achieve with this post? <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setGoal(opt)}
                className={`px-3 py-1.5 text-[13px] rounded-full border transition-colors ${
                  goal === opt 
                    ? "bg-[rgba(67,56,255,1)] border-[rgba(67,56,255,1)] text-white" 
                    : "bg-[var(--surface-1)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          
          {goal === "Other" && (
            <input
              type="text"
              className="mt-2 w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-[14px] outline-none focus:border-[rgba(67,56,255,0.5)] transition-colors"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Please specify your goal..."
              autoFocus
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full mt-2 py-2.5 rounded-[8px] bg-[rgba(67,56,255,1)] text-white font-medium text-[14px] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Submit & Continue
        </button>
      </div>
    </div>
  );
}
