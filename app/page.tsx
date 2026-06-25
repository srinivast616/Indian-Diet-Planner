"use client";

import { useState } from "react";

type Goal = "lose_weight" | "gain_weight" | "diabetic_friendly";

interface FormData {
  age: string;
  height: string;
  weight: string;
  goal: Goal;
}

function formatResponse(text: string) {
  const lines = text.split("\n");
  let html = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      html += `<h2>${trimmed.slice(3)}</h2>`;
    } else if (trimmed.startsWith("### ")) {
      html += `<h3>${trimmed.slice(4)}</h3>`;
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      html += `<h3>${trimmed.slice(2, -2)}</h3>`;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      html += `<ul><li>${trimmed
        .slice(2)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li></ul>`;
    } else if (/^\d+\./.test(trimmed)) {
      html += `<p>${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    } else {
      html += `<p>${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }
  }

  html = html.replace(/<\/ul><ul>/g, "");
  return html;
}

async function downloadPDF(result: string, form: FormData, goalLabel: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkNewPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header background
  doc.setFillColor(2, 136, 209); // #0288D1
  doc.rect(0, 0, pageWidth, 28, "F");

  // Title in header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("🍛 Indian Diet Planner", margin, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Personalised meal plan powered by AI", margin, 20);

  y = 36;

  // User info pills row
  doc.setFillColor(225, 245, 254); // #E1F5FE
  doc.roundedRect(margin, y, contentWidth, 14, 3, 3, "F");
  doc.setTextColor(21, 101, 192); // #1565C0
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const infoText = `Age: ${form.age} yrs   |   Height: ${form.height} cm   |   Weight: ${form.weight} kg   |   Goal: ${goalLabel}`;
  doc.text(infoText, margin + 4, y + 9);

  y += 22;

  // Parse and render the AI response
  const lines = result.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      y += 3;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const heading = trimmed.slice(3);
      checkNewPage(14);

      // Section heading with blue underline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(21, 101, 192); // #1565C0
      doc.text(heading, margin, y);
      y += 2;
      doc.setDrawColor(2, 136, 209); // #0288D1
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

    } else if (trimmed.startsWith("### ")) {
      const subheading = trimmed.slice(4).replace(/\*\*/g, "");
      checkNewPage(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(1, 87, 155); // #01579B
      doc.text(subheading, margin, y);
      y += 6;

    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const subheading = trimmed.slice(2, -2);
      checkNewPage(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(1, 87, 155);
      doc.text(subheading, margin, y);
      y += 6;

    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const item = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "$1");
      checkNewPage(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      // Bullet dot
      doc.setFillColor(2, 136, 209);
      doc.circle(margin + 2, y - 1.5, 1, "F");

      const wrappedLines = doc.splitTextToSize(item, contentWidth - 8);
      doc.text(wrappedLines, margin + 6, y);
      y += wrappedLines.length * 5 + 1;

    } else {
      // Regular paragraph — strip bold markers
      const clean = trimmed.replace(/\*\*(.*?)\*\*/g, "$1");
      checkNewPage(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      const wrappedLines = doc.splitTextToSize(clean, contentWidth);
      doc.text(wrappedLines, margin, y);
      y += wrappedLines.length * 5 + 2;
    }
  }

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(240, 247, 255);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "This plan is for general guidance only. Consult a registered dietitian before making dietary changes.",
      margin,
      pageHeight - 5
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: "right" });
  }

  doc.save("indian-diet-plan.pdf");
}

const GOAL_OPTIONS: { value: Goal; label: string; emoji: string }[] = [
  { value: "lose_weight", label: "Lose Weight", emoji: "⚖️" },
  { value: "gain_weight", label: "Gain Weight", emoji: "💪" },
  { value: "diabetic_friendly", label: "Diabetic Friendly", emoji: "🩺" },
];

export default function Home() {
  const [form, setForm] = useState<FormData>({
    age: "",
    height: "",
    weight: "",
    goal: "lose_weight",
  });
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setResult(data.result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const goalLabel = GOAL_OPTIONS.find((g) => g.value === form.goal)?.label || form.goal;
      await downloadPDF(result, form, goalLabel);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const isValid = form.age && form.height && form.weight;

  return (
    <main className="min-h-screen bg-[#E1F5FE]">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🍛</span>
          <div>
            <h1 className="font-display text-[#1565C0] font-bold text-lg leading-tight" style={{ fontFamily: "Georgia, serif" }}>
              Indian Diet Planner
            </h1>
            <p className="text-xs text-[#1565C0]/60">Personalised meal plans, rooted in Indian cuisine</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#1565C0] text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <span>✨</span> AI-powered nutrition guidance
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Your body. Your goals.<br />
            <span className="text-[#0288D1]">Your thali.</span>
          </h2>
          <p className="text-[#1A1A1A]/60 max-w-md mx-auto text-sm sm:text-base">
            Get a personalised Indian diet plan tailored to your body and health goals — dal, roti, sabzi and all.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 sm:p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Body metrics */}
            <div>
              <p className="text-xs font-semibold text-[#1565C0]/70 uppercase tracking-widest mb-3">
                Body Metrics
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "age", label: "Age", unit: "yrs", placeholder: "25" },
                  { key: "height", label: "Height", unit: "cm", placeholder: "165" },
                  { key: "weight", label: "Weight", unit: "kg", placeholder: "65" },
                ].map(({ key, label, unit, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-[#1A1A1A]/70 mb-1.5">
                      {label}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={placeholder}
                        value={form[key as keyof FormData]}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [key]: e.target.value }))
                        }
                        className="w-full border border-blue-200 rounded-xl px-3 py-2.5 pr-10 text-sm bg-[#E1F5FE] focus:outline-none focus:ring-2 focus:ring-[#0288D1]/40 focus:border-[#0288D1] transition-all"
                        min={1}
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1A1A1A]/40 font-medium">
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal selection */}
            <div>
              <p className="text-xs font-semibold text-[#1565C0]/70 uppercase tracking-widest mb-3">
                Your Goal
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GOAL_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, goal: value }))}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      form.goal === value
                        ? "border-[#0288D1] bg-blue-50 text-[#1565C0]"
                        : "border-blue-100 bg-[#E1F5FE] text-[#1A1A1A]/70 hover:border-blue-200"
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span>{label}</span>
                    {form.goal === value && (
                      <span className="ml-auto text-[#0288D1]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-[#0288D1] hover:bg-[#0277BD] disabled:bg-blue-200 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              {loading ? "Generating your plan…" : "Create My Diet Plan →"}
            </button>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="spinner" />
            <p className="text-sm text-[#1A1A1A]/50 animate-pulse">
              Crafting your personalised thali…
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3 items-start fade-in">
            <span className="text-red-400 text-lg mt-0.5">⚠️</span>
            <div>
              <p className="font-medium text-red-700 text-sm">Could not generate plan</p>
              <p className="text-red-600 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-blue-200" />
              <span className="text-sm font-medium text-[#1565C0]/70 flex items-center gap-1.5">
                <span>🍽️</span> Your Diet Plan
              </span>
              <div className="h-px flex-1 bg-blue-200" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 sm:p-8">
              {/* Summary pills + Download button row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-50 text-[#1565C0] px-3 py-1 rounded-full border border-blue-100">
                    Age: {form.age} yrs
                  </span>
                  <span className="text-xs bg-blue-50 text-[#1565C0] px-3 py-1 rounded-full border border-blue-100">
                    Height: {form.height} cm
                  </span>
                  <span className="text-xs bg-blue-50 text-[#1565C0] px-3 py-1 rounded-full border border-blue-100">
                    Weight: {form.weight} kg
                  </span>
                  <span className="text-xs bg-blue-50 text-[#01579B] px-3 py-1 rounded-full border border-blue-100">
                    {GOAL_OPTIONS.find((g) => g.value === form.goal)?.emoji}{" "}
                    {GOAL_OPTIONS.find((g) => g.value === form.goal)?.label}
                  </span>
                </div>

                {/* Download PDF Button */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="flex items-center gap-2 bg-[#0288D1] hover:bg-[#0277BD] disabled:bg-blue-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {pdfLoading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Preparing PDF…
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>
              </div>

              {/* AI response rendered */}
              <div
                className="prose-indian text-[#1A1A1A] text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatResponse(result) }}
              />

              <div className="mt-8 pt-5 border-t border-blue-100 flex items-start gap-2.5">
                <span className="text-blue-300 text-base mt-0.5">ℹ️</span>
                <p className="text-xs text-[#1A1A1A]/40 leading-relaxed">
                  This plan is for general guidance only. Please consult a registered dietitian or physician before making significant dietary changes, especially if you have a medical condition.
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => { setResult(null); setError(null); }}
                className="text-sm text-[#0288D1] hover:text-[#1565C0] font-medium transition-colors"
              >
                ← Start over
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 text-xs text-[#1A1A1A]/30">
          Indian Diet Planner · Powered by AI
        </footer>
      </div>
    </main>
  );
}
