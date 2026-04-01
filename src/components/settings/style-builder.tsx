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
      /* no profile yet */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

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
      if (texts.length === 0) throw new Error("No readable text found");

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

  function handleReset() {
    setProfile(null);
    setTab("choose");
    setShowPaste(false);
    setError(null);
  }

  if (loading) {
    return (
      <div className="border border-border rounded-xl bg-surface p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-subtle rounded w-36" />
          <div className="h-3 bg-page rounded w-56" />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[1, 2, 3, 4].map((n) => <div key={n} className="h-16 bg-page rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-medium text-ink flex items-center gap-1.5">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Writing Style
          </h2>
          <p className="text-[12px] text-ink-tertiary mt-0.5">
            {profile ? "Your personalized style is active." : "Teach Pollux how you write."}
          </p>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-positive bg-positive-subtle px-2 py-0.5 rounded-md">
              Active
            </span>
            <button
              onClick={handleReset}
              className="text-[11px] text-ink-faint hover:text-danger transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mt-4 px-3 py-2.5 bg-danger-subtle border border-danger/10 rounded-lg">
          <p className="text-[12px] text-danger">{error}</p>
        </div>
      )}

      {/* Choose source */}
      {tab === "choose" && (
        <div className="p-5 space-y-3">
          {/* Gmail Sent */}
          <button
            disabled={!gmailConnected || busy !== null}
            onClick={handleGmailLearn}
            className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
              gmailConnected
                ? "border-border hover:border-accent/30 hover:bg-accent-subtle/30 cursor-pointer"
                : "border-border-light bg-page cursor-not-allowed opacity-50"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0l-9.75 6.093L2.25 6.75" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink">
                Learn from Gmail Sent
                {busy === "gmail_sent" && <span className="text-[11px] font-normal text-accent ml-2">Analyzing…</span>}
              </p>
              <p className="text-[11px] text-ink-tertiary mt-0.5">
                {gmailConnected ? "Analyze your recent sent emails." : "Connect Gmail first."}
              </p>
            </div>
            {gmailConnected && (
              <span className="text-[10px] font-medium text-positive bg-positive-subtle px-1.5 py-0.5 rounded shrink-0 mt-1">
                Recommended
              </span>
            )}
          </button>

          {/* Upload */}
          <button
            disabled={busy !== null}
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-start gap-3 p-3.5 rounded-lg border border-border hover:border-accent/30 hover:bg-accent-subtle/30 text-left transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink">
                Upload Samples
                {busy === "upload" && <span className="text-[11px] font-normal text-accent ml-2">Processing…</span>}
              </p>
              <p className="text-[11px] text-ink-tertiary mt-0.5">Upload .txt or .md files.</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,.text" multiple className="hidden" onChange={handleFileUpload} />

          {/* Paste */}
          <button
            disabled={busy !== null}
            onClick={() => setShowPaste(!showPaste)}
            className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
              showPaste ? "border-accent bg-accent-subtle/30" : "border-border hover:border-accent/30 hover:bg-accent-subtle/30"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-ink">Paste Samples</p>
              <p className="text-[11px] text-ink-tertiary mt-0.5">
                Paste text directly. Separate with &ldquo;---&rdquo;.
              </p>
            </div>
          </button>

          {showPaste && (
            <div className="ml-11 space-y-2.5">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"Paste your writing samples here…\n\nSeparate with ---"}
                rows={5}
                className="w-full text-[13px] border border-border rounded-lg p-3 focus:border-accent focus:shadow-focus outline-none resize-none bg-surface placeholder:text-ink-faint"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pasteText.trim() || busy !== null}
                  className="px-4 py-2 bg-accent text-white text-[12px] font-medium rounded-lg hover:bg-accent-hover disabled:opacity-40 transition-colors"
                >
                  {busy === "paste" ? "Analyzing…" : "Analyze"}
                </button>
                <span className="text-[11px] text-ink-faint">
                  {pasteText.split(/\n---\n/).filter((t) => t.trim()).length} sample(s)
                </span>
              </div>
            </div>
          )}

          {/* Presets */}
          <div className="border border-border rounded-lg p-3.5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink">Start from a Preset</p>
                <p className="text-[11px] text-ink-tertiary mt-0.5">Pick a base style and refine later.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 ml-11">
              {PRESET_META.map((p) => (
                <button
                  key={p.id}
                  disabled={busy !== null}
                  onClick={() => handlePreset(p.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border-light hover:border-accent/30 hover:bg-accent-subtle/30 text-left transition-all disabled:opacity-40"
                >
                  <span className="text-base">{p.icon}</span>
                  <div>
                    <p className="text-[12px] font-medium text-ink">{p.label}</p>
                    <p className="text-[10px] text-ink-faint leading-tight">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {tab === "preview" && profile && (
        <div className="p-5 space-y-4">
          {/* Source info */}
          <div className="flex items-center gap-2 text-[11px] text-ink-tertiary">
            <span className="bg-subtle px-2 py-0.5 rounded font-medium capitalize">
              {profile.source.replace("_", " ")}
            </span>
            <span className="text-ink-faint">·</span>
            <span>{profile.exampleCount} examples</span>
            <span className="text-ink-faint">·</span>
            <span>Updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Style details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase w-20 shrink-0">Persona</span>
              <span className="text-[13px] font-medium text-ink capitalize">{profile.styleCard.persona}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase w-20 shrink-0 pt-0.5">Tone</span>
              <div className="flex flex-wrap gap-1">
                {profile.styleCard.toneRules.map((r, i) => (
                  <span key={i} className="text-[11px] bg-accent-subtle text-accent px-2 py-0.5 rounded">{r}</span>
                ))}
              </div>
            </div>

            {profile.styleCard.bannedPhrases.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase w-20 shrink-0 pt-0.5">Avoid</span>
                <div className="flex flex-wrap gap-1">
                  {profile.styleCard.bannedPhrases.map((p, i) => (
                    <span key={i} className="text-[11px] bg-danger-subtle text-danger px-2 py-0.5 rounded line-through">{p}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase w-20 shrink-0 pt-0.5">Sign-offs</span>
              <div className="flex flex-wrap gap-1">
                {profile.styleCard.signoffPatterns.map((s, i) => (
                  <span key={i} className="text-[11px] bg-subtle text-ink-secondary px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center p-2 bg-page rounded-lg">
                <p className="text-[10px] text-ink-faint uppercase tracking-wide">Emoji</p>
                <p className="text-[12px] font-medium text-ink mt-0.5 capitalize">{profile.styleCard.emojiPreference}</p>
              </div>
              <div className="text-center p-2 bg-page rounded-lg">
                <p className="text-[10px] text-ink-faint uppercase tracking-wide">Sentences</p>
                <p className="text-[12px] font-medium text-ink mt-0.5 capitalize">{profile.styleCard.sentenceStyle}</p>
              </div>
              <div className="text-center p-2 bg-page rounded-lg">
                <p className="text-[10px] text-ink-faint uppercase tracking-wide">Directness</p>
                <p className="text-[12px] font-medium text-ink mt-0.5 capitalize">{profile.styleCard.directness ?? "balanced"}</p>
              </div>
            </div>
          </div>

          {/* Examples */}
          {profile.examples.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-ink-tertiary tracking-wide uppercase mb-2">
                Examples ({Math.min(profile.examples.length, 3)} of {profile.examples.length})
              </p>
              <div className="space-y-1.5">
                {profile.examples.slice(0, 3).map((ex) => (
                  <div key={ex.id} className="text-[12px] text-ink-secondary bg-page border border-border-light rounded-lg p-3 leading-relaxed">
                    {ex.text.length > 200 ? ex.text.slice(0, 200) + "…" : ex.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-1">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 text-[12px] font-medium text-ink-secondary bg-subtle rounded-lg hover:bg-border transition-colors"
            >
              Change source
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
