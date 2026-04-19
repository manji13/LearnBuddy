import { useState, useEffect, useRef, useCallback } from "react";
import NavBar from '../../Components/NavBar/NavBar';

const API = "http://localhost:8000";

const STYLES = [
  { id: "concise",  label: "Concise",  icon: "⚡", desc: "compact" },
  { id: "detailed", label: "Detailed", icon: "☰",  desc: "Full coverage"  },
  { id: "bullet",   label: "Bullets",  icon: "◦◦◦", desc: "Key points"   },
];

function OllamaStatus({ ok, onRefresh }) {
  const cfg = ok === null
    ? { label: "Checking…",        bg: "bg-blue-50",   border: "border-blue-200",  dot: "bg-blue-400",  text: "text-blue-700" }
    : ok
    ? { label: "Ollama connected", bg: "bg-green-50",  border: "border-green-300", dot: "bg-green-500", text: "text-green-800" }
    : { label: "Ollama offline",   bg: "bg-red-50",    border: "border-red-200",   dot: "bg-red-500",   text: "text-red-800"  };
  return (
    <div className={`flex items-center gap-1.5 ${cfg.bg} border ${cfg.border} rounded-full px-3.5 py-1.5`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />
      <span className={`text-xs font-bold whitespace-nowrap ${cfg.text}`}>{cfg.label}</span>
      <button
        onClick={onRefresh}
        className={`bg-transparent border-none cursor-pointer ${cfg.text} text-sm pl-0.5 opacity-70 hover:opacity-100`}
        title="Refresh"
      >↺</button>
    </div>
  );
}

function StatPill({ label, value, highlight }) {
  return (
    <div className={`text-center px-4 py-2.5 rounded-xl border flex-1 min-w-[80px] ${
      highlight
        ? "bg-green-50 border-green-300"
        : "bg-blue-50 border-blue-200"
    }`}>
      <div className={`text-[10px] uppercase tracking-widest font-bold mb-0.5 ${
        highlight ? "text-green-700" : "text-blue-500"
      }`}>{label}</div>
      <div className={`text-[15px] font-bold font-mono ${
        highlight ? "text-green-800" : "text-blue-800"
      }`}>{value}</div>
    </div>
  );
}

export default function Summarize() {
  const [tab,      setTab]      = useState("text");
  const [text,     setText]     = useState("");
  const [file,     setFile]     = useState(null);
  const [style,    setStyle]    = useState("concise");
  const [model,    setModel]    = useState("");
  const [models,   setModels]   = useState([]);
  const [ollamaOk, setOllamaOk] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState(false);
  const [drag,     setDrag]     = useState(false);
  const fileRef = useRef();

  const checkHealth = useCallback(async () => {
    try {
      const r = await fetch(`${API}/summarize/health`, { signal: AbortSignal.timeout(4000) });
      const d = await r.json();
      setOllamaOk(d.ollama_connected);
      if (d.models?.length) {
        setModels(d.models);
        setModel(prev => prev || d.models[0]);
      }
    } catch { setOllamaOk(false); }
  }, []);

  useEffect(() => {
    checkHealth();
    const id = setInterval(checkHealth, 6000);
    return () => clearInterval(id);
  }, [checkHealth]);

  async function handleSummarize() {
    setError(""); setResult(null); setLoading(true);
    try {
      let res;
      if (tab === "text") {
        if (!text.trim()) throw new Error("Please paste some text first.");
        res = await fetch(`${API}/summarize/text`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, model, style }),
        });
      } else {
        if (!file) throw new Error("Please upload a file.");
        const fd = new FormData();
        fd.append("file", file); fd.append("model", model); fd.append("style", style);
        res = await fetch(`${API}/summarize/file`, { method: "POST", body: fd });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "Request failed");
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function handleCopy() {
    if (!result?.summary) return;
    navigator.clipboard.writeText(result.summary);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const canSubmit = !loading && !!model && (tab === "text" ? text.trim().length > 10 : !!file);
  const compression = result ? Math.round((1 - result.summary_length / Math.max(result.original_length, 1)) * 100) : 0;

  return (
    <div className="font-sans bg-white min-h-screen text-slate-900">
      <NavBar />

      {/* Sticky top header */}
      <header className="bg-white border-b border-slate-200 px-9 py-3.5 flex items-center gap-4 sticky top-0 z-10">
      
        <div className="ml-auto">
          <OllamaStatus ok={ollamaOk} onRefresh={checkHealth} />
        </div>
      </header>

      {/* Split layout */}
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* ── LEFT PANEL: Input ── */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col bg-white overflow-y-auto">
          <div className="px-8 py-6 flex flex-col gap-5 flex-1">

            {/* Offline warning */}
            {ollamaOk === false && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3.5 text-sm text-orange-900 leading-relaxed">
                <strong className="block text-orange-700 font-extrabold text-sm mb-1">⚠️ Ollama is not running</strong>
                Open a terminal and run: <code className="bg-white px-1.5 py-0.5 rounded text-xs text-indigo-900 border border-slate-200 font-mono">ollama serve</code><br />
                Install a model: <code className="bg-white px-1.5 py-0.5 rounded text-xs text-indigo-900 border border-slate-200 font-mono">ollama pull llama3.2</code><br />
                Then click ↺ to refresh.
              </div>
            )}

           

            {/* Style selector */}
            <div>
              <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">Summary Style</div>
              <div className="flex gap-2.5">
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex-1 py-3 px-2 rounded-xl cursor-pointer flex flex-col items-center gap-1 font-sans transition-all text-slate-600 border ${
                      style === s.id
                        ? "border-2 border-indigo-500 bg-blue-50 text-indigo-700"
                        : "border border-slate-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
                    }`}
                  >
                    <span className="text-base">{s.icon}</span>
                    <span className="font-bold text-[13px]">{s.label}</span>
                    <span className="text-[11px] opacity-60">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setTab("text")}
                className={`flex-1 py-2.5 rounded-[9px] font-sans text-sm cursor-pointer transition-all ${
                  tab === "text"
                    ? "bg-white text-indigo-700 font-bold shadow-sm"
                    : "bg-transparent text-slate-400 font-medium hover:text-slate-600"
                }`}
              >✏️ Paste Text</button>
              <button
                onClick={() => setTab("file")}
                className={`flex-1 py-2.5 rounded-[9px] font-sans text-sm cursor-pointer transition-all ${
                  tab === "file"
                    ? "bg-white text-indigo-700 font-bold shadow-sm"
                    : "bg-transparent text-slate-400 font-medium hover:text-slate-600"
                }`}
              >📎 Upload File</button>
            </div>

            {/* Text input */}
            {tab === "text" ? (
              <div>
                <textarea
                  className="w-full min-h-[200px] bg-blue-50 border border-blue-200 rounded-xl text-slate-900 px-4 py-3.5 text-[15px] leading-[1.7] resize-y outline-none font-sans transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Paste your article, report, notes, or any text here…"
                />
               
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-2xl min-h-[160px] flex items-center justify-center cursor-pointer transition-all bg-blue-50 ${
                  drag ? "border-indigo-500 bg-blue-100" : "border-blue-200 hover:border-indigo-400 hover:bg-blue-100"
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0] || null)}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-4xl">📄</span>
                    <span className="font-bold text-indigo-700 text-[15px]">{file.name}</span>
                    <span className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      className="bg-transparent border border-red-300 text-red-500 rounded-lg px-3 py-1 cursor-pointer text-xs font-bold mt-1 hover:bg-red-50 transition-colors"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                    >✕ Remove</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <span className="text-4xl mb-1">☁</span>
                    <span className="font-bold text-slate-600 text-[15px]">Drop file here or click to browse</span>
                    <span className="text-sm">Supports .pdf · .docx · .txt</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              className="w-full py-3.5 bg-blue-600 text-white border-none rounded-xl font-sans text-[15px] font-extrabold cursor-pointer tracking-wide transition-all shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:bg-blue-700 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center justify-center gap-2"
              onClick={handleSummarize}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Summarising…
                </>
              ) : "Summarise →"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Result ── */}
        <div className="w-1/2 bg-slate-50 flex flex-col overflow-y-auto">
          <div className="px-8 py-6 flex flex-col gap-5 flex-1">

            {/* Placeholder */}
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-indigo-200">✦</div>
                <div className="text-sm font-bold text-slate-500 mb-1.5">No summary yet</div>
                <div className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
                  Configure your options on the left and hit <strong>Summarise</strong> to see results here.
                </div>
              </div>
            )}

            {/* Loading bubble */}
            {loading && (
              <div className="flex gap-3 items-start animate-[fadeUp_.3s_ease_both]">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-lg flex-shrink-0">✨</div>
                <div className="bg-white border border-slate-100 py-3 px-4 rounded-t-[22px] rounded-br-[22px] rounded-bl-[4px] shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                    <span className="ml-2 text-slate-500 text-sm font-medium">Summarising…</span>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="flex flex-col gap-4 animate-[fadeUp_.35s_ease_both]">
                {/* AI chat bubble */}
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-lg flex-shrink-0 shadow-sm mt-0.5">✨</div>
                  <div className="bg-white border border-slate-200 rounded-t-[22px] rounded-br-[22px] rounded-bl-[4px] shadow-[0_2px_8px_rgba(99,102,241,0.06)] flex-1 overflow-hidden">

                    {/* Bubble header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div>
                        <span className="block text-[17px] font-extrabold text-indigo-900 mb-0.5">Summary</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {result.model} · {result.style} · {compression}% compressed
                        </span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`rounded-lg py-1.5 px-4 cursor-pointer text-[13px] font-bold transition-all border font-sans ${
                          copied
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-blue-50 border-blue-200 text-indigo-700 hover:bg-blue-100"
                        }`}
                      >
                        {copied ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>

                    {/* Summary text */}
                    <div className="px-6 py-5 text-[15px] leading-[1.85] text-slate-700">
                      {result.summary.split("\n").map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={i} className="h-2" />;

                        // **Heading** → underlined section title (no stars)
                        const headingMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
                        if (headingMatch) {
                          return (
                            <p key={i} className="mt-5 mb-1.5 font-bold text-indigo-900 text-[15px] underline underline-offset-4 decoration-indigo-300 decoration-2">
                              {headingMatch[1]}
                            </p>
                          );
                        }

                        // * bullet item → styled list row
                        const bulletMatch = trimmed.match(/^\*\s+(.+)$/);
                        if (bulletMatch) {
                          return (
                            <div key={i} className="flex items-start gap-2.5 my-1 ml-2">
                              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                              <span>{bulletMatch[1]}</span>
                            </div>
                          );
                        }

                        // Plain paragraph — strip any remaining stray ** pairs inline
                        const parts = trimmed.split(/\*\*(.+?)\*\*/g);
                        return (
                          <p key={i} className="my-1">
                            {parts.map((part, j) =>
                              j % 2 === 1
                                ? <span key={j} className="font-semibold text-slate-800">{part}</span>
                                : part
                            )}
                          </p>
                        );
                      })}
                    </div>

                    {/* Stats */}
                    
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-5 text-xs text-slate-300">
        Summarix · Built with Ollama + React · All processing is local
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}