"use client";

import { useState, useRef } from "react";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MACRO_COLORS = {
  Calories: "text-signal",
  Carbs: "text-sky",
  Fat: "text-verdant",
  Protein: "text-plum",
};

export default function Home() {
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [textDescription, setTextDescription] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const analyze = async () => {
    setError(null);
    setResult(null);
    if (!imageFile && !textDescription.trim()) {
      setError("Upload an image or describe your meal first.");
      return;
    }
    setLoading(true);
    try {
      let payload = { textDescription, goals };
      if (imageFile) {
        payload.imageBase64 = await fileToBase64(imageFile);
        payload.mimeType = imageFile.type;
      }
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data.result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setImageFile(null);
    setTextDescription("");
    setResult(null);
    setError(null);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-16">
      {/* Header */}
      <header className="flex items-center justify-between mb-24">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-brand bg-ember flex items-center justify-center text-white text-sm font-bold">
            N
          </div>
          <span className="font-display font-bold text-lg text-graphite">
            NutriAI
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-8">
          <span className="font-display text-graphite text-[16px]">How it works</span>
          <span className="font-display text-graphite text-[16px]">About</span>
        </nav>
        <button className="bg-ember text-white font-display font-semibold text-[16px] rounded-brand px-5 py-3">
          Get Started →
        </button>
      </header>

      {/* Hero */}
      {!result && (
        <section className="text-center mb-24">
          <h1 className="font-display font-bold text-[44px] sm:text-[60px] leading-[1.2] mb-4">
            <span className="text-verdant">Know Your Food.</span>{" "}
            <span className="text-graphite">Instantly.</span>
          </h1>
          <p className="font-display text-graphite text-[17px] leading-[1.6] max-w-md mx-auto mb-10">
            Snap a photo or describe your meal — Gemini breaks down every
            calorie and macro in seconds.
          </p>

          <div className="bg-white rounded-brand p-8 max-w-xl mx-auto text-left">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-mist rounded-brand p-8 text-center cursor-pointer hover:border-ember hover:bg-fog transition"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="preview"
                  className="mx-auto max-h-56 rounded-brand object-cover"
                />
              ) : (
                <div className="text-graphite/60 font-display">
                  <p className="font-semibold text-[16px]">Drag & drop a food photo</p>
                  <p className="text-[14px]">or click to browse</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            <div className="text-center text-[12px] text-graphite/50 uppercase tracking-wide my-4">
              or describe it
            </div>

            <textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="e.g. 2 rotis, dal, and a bowl of curd rice"
              rows={2}
              className="w-full border border-fog bg-fog rounded-brand p-4 text-[14px] font-display focus:outline-none focus:ring-2 focus:ring-ember mb-3"
            />

            <input
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Optional: daily goal (e.g. 2000 kcal, 100g protein)"
              className="w-full border border-fog bg-fog rounded-brand p-4 text-[14px] font-display focus:outline-none focus:ring-2 focus:ring-ember mb-4"
            />

            {error && <p className="text-[14px] text-signal mb-3">{error}</p>}

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full bg-ember disabled:opacity-50 text-white font-display font-semibold text-[16px] py-4 rounded-brand transition"
            >
              {loading ? "Analyzing…" : "Analyze Meal"}
            </button>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section className="max-w-xl mx-auto">
          <div className="bg-white rounded-brand p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-[30px] text-graphite">
                  {result.food_name}
                </h2>
                {result.portion_estimate && (
                  <p className="font-display text-[14px] text-graphite/60">
                    {result.portion_estimate}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-[30px] text-verdant">
                  {result.health_score}/10
                </div>
                <div className="font-display text-[12px] text-graphite/50">
                  Health Score
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                ["Calories", result.calories, ""],
                ["Carbs", result.carbs_g, "g"],
                ["Fat", result.fat_g, "g"],
                ["Protein", result.protein_g, "g"],
              ].map(([label, val, unit]) => (
                <div
                  key={label}
                  className="bg-fog rounded-brand py-4 text-center"
                >
                  <div className={`font-display font-bold text-[20px] ${MACRO_COLORS[label]}`}>
                    {val}
                    {unit}
                  </div>
                  <div className="font-display text-[12px] text-graphite/50">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {result.warning_flags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {result.warning_flags.map((flag) => (
                  <span
                    key={flag}
                    className="text-[12px] font-display bg-fog text-signal px-3 py-1 rounded-brand"
                  >
                    ⚠ {flag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-fog rounded-brand p-5 font-display text-[14px] text-graphite/80 leading-[1.6] mb-6">
              {result.recommendations}
            </div>

            <button
              onClick={reset}
              className="w-full border border-fog hover:bg-fog font-display font-semibold text-[16px] py-4 rounded-brand transition text-graphite"
            >
              Analyze Another Meal
            </button>
          </div>
        </section>
      )}

      <footer className="text-center text-[12px] font-display text-graphite/40 mt-24">
        Built with Next.js, Tailwind CSS & Google Gemini API
      </footer>
    </main>
  );
}
