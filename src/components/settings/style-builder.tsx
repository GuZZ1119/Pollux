"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserStyleProfile, ApiResponse } from "@/lib/types";
import { PRESET_META } from "@/lib/style/presets";

interface Props {
  gmailConnected: boolean;
}

type Tab = "choose" | "preview";
type LearnSource = "gmail_sent" | "paste" | "upload" | "preset";

export function StyleBuilder({ gmailConnected }: Props) {
  const [tab, setTab] = useState<Tab>("choose");
  const [profile, setProfile] = useState<UserStyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<LearnSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/style");
      const json: ApiResponse<UserStyleProfile> = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setTab("preview");
      }
    } catch {
      /* ignore — no profile yet */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ----- Preset selection -----
  async function handlePreset(presetId: string) {
    setBusy("preset");
    setError(null);
    try {
      const res = await fetch("/api/style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_preset", presetId }),
      });
      const json: ApiResponse<UserStyleProfile> = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      setProfile(json.data ?? null);
      setTab("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to apply preset");
    } finally {
      setBusy(null);
    }
  }

  // ----- Gmail learning -----
  async function handleGmailLearn() {
    setBusy("gmail_sent");
    setError(null);
    try {
      const res = await fetch("/api/style/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "gmail_sent" }),
      });
      const json: ApiResponse<UserStyleProfile> = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      setProfile(json.data ?? null);
      setTab("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gmail learning failed");
    } finally {
      setBusy(null);
    }
  }

  // ----- Manual paste -----
  async function handlePasteSubmit() {
    if (!pasteText.trim()) return;
    setBusy("paste");
    setError(null);
    try {
      const samples = pasteText.split(/\n---\n|\n\n\n/).filter((t) => t.trim());
      const res = await fetch("/api/style/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "manual_samples", texts: samples }),
      });
      const json: ApiResponse<UserStyleProfile> = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      setProfile(json.data ?? null);
      setPasteText("");
      setShowPaste(false);
      setTab("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Style extraction failed");
    } finally {
      setBusy(null);
    }
  }

  // ----- File upload -----
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy("upload");
    setError(null);
    try {
      const texts: string[] = [];
      for (const file of Array.from(files)) {
        const text = await file.text();
        if (text.trim()) texts.push(text);
      }
      if (texts.length === 0) throw new Error("No readable text found in uploaded files");

      const res = await fetch("/api/style/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "manual_samples", texts }),
      });
      const json: ApiResponse<UserStyleProfile> = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      setProfile(json.data ?? null);
      setTab("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File processing failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ----- Reset -----
  function handleReset() {
    setProfile(null);
    setTab("choose");
    setShowPaste(false);
    setError(null);
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-100 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-64" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4].map((n) => <div key={n} className="h-20 bg-gray-50 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">✨</span> Build Your Style
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {profile ? "Your personalized style is active." : "Choose how to teach Pollux your writing style."}
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Active
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tab: choose source */}
      {tab === "choose" && (
        <div className="p-5 space-y-5">
          {/* 4 onboarding paths */}
          <div className="grid grid-cols-1 gap-3">
            {/* Path 1: Gmail Sent */}
            <button
              disabled={!gmailConnected || busy !== null}
              onClick={handleGmailLearn}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                gmailConnected
                  ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                  : "border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60"
              }`}
            >
              <span className="text-2xl mt-0.5">{busy === "gmail_sent" ? "⏳" : "📧"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Learn from Gmail Sent
                  {busy === "gmail_sent" && <span className="text-xs font-normal text-blue-500 ml-2">Analyzing...</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {gmailConnected
                    ? "Analyze your recent sent emails to extract your natural writing style."
                    : "Connect Gmail first to use this option."}
                </p>
              </div>
              {gmailConnected && (
                <span className="text-[10px] uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 shrink-0">
                  Recommended
                </span>
              )}
            </button>

            {/* Path 2: Upload files */}
            <button
              disabled={busy !== null}
              onClick={() => fileRef.current?.click()}
              className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all"
            >
              <span className="text-2xl mt-0.5">{busy === "upload" ? "⏳" : "📎"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Upload Writing Samples
                  {busy === "upload" && <span className="text-xs font-normal text-blue-500 ml-2">Processing...</span>}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload .txt or .md files of your previous emails or writing.
                </p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.text"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Path 3: Paste text */}
            <button
              disabled={busy !== null}
              onClick={() => setShowPaste(!showPaste)}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                showPaste ? "border-blue-400 bg-blue-50/30" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <span className="text-2xl mt-0.5">📝</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Paste Writing Samples</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Paste your emails or messages directly. Separate multiple samples with &ldquo;---&rdquo;.
                </p>
              </div>
            </button>

            {showPaste && (
              <div className="ml-12 space-y-3">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={"Paste your writing samples here...\n\nSeparate multiple samples with a line of ---\n\n---\n\nSecond sample here..."}
                  rows={6}
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none placeholder:text-gray-300"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePasteSubmit}
                    disabled={!pasteText.trim() || busy !== null}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {busy === "paste" ? "Analyzing..." : "Analyze Style"}
                  </button>
                  <span className="text-xs text-gray-400">
                    {pasteText.split(/\n---\n/).filter((t) => t.trim()).length} sample(s) detected
                  </span>
                </div>
              </div>
            )}

            {/* Path 4: Presets */}
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-4 mb-3">
                <span className="text-2xl mt-0.5">🎯</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Start from a Preset</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pick a base style to get started immediately. You can refine later.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 ml-12">
                {PRESET_META.map((p) => (
                  <button
                    key={p.id}
                    disabled={busy !== null}
                    onClick={() => handlePreset(p.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all disabled:opacity-40"
                  >
                    <span>{p.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{p.label}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: preview active style */}
      {tab === "preview" && profile && (
        <div className="p-5 space-y-4">
          {/* Source badge */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Source:</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium capitalize">
              {profile.source.replace("_", " ")}
            </span>
            <span className="text-gray-300">|</span>
            <span>{profile.exampleCount} example(s)</span>
            <span className="text-gray-300">|</span>
            <span>Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* StyleCard preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-20 shrink-0">Persona</span>
              <span className="text-sm font-semibold text-gray-900 capitalize">{profile.styleCard.persona}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-20 shrink-0 pt-1">Tone</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.styleCard.toneRules.map((r, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">{r}</span>
                ))}
              </div>
            </div>

            {profile.styleCard.bannedPhrases.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-20 shrink-0 pt-1">Avoid</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.styleCard.bannedPhrases.map((p, i) => (
                    <span key={i} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg line-through decoration-red-300">{p}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider w-20 shrink-0 pt-1">Sign-offs</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.styleCard.signoffPatterns.map((s, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{s}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Emoji</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5 capitalize">{profile.styleCard.emojiPreference}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Sentences</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5 capitalize">{profile.styleCard.sentenceStyle}</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Directness</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5 capitalize">{profile.styleCard.directness ?? "balanced"}</p>
              </div>
            </div>
          </div>

          {/* Representative examples */}
          {profile.examples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Representative Examples ({Math.min(profile.examples.length, 3)} of {profile.examples.length})
              </p>
              <div className="space-y-2">
                {profile.examples.slice(0, 3).map((ex) => (
                  <div key={ex.id} className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3 leading-relaxed">
                    {ex.text.length > 200 ? ex.text.slice(0, 200) + "…" : ex.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Change Style Source
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
