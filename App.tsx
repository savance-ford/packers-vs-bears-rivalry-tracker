import React, { useEffect, useState } from "react";
import {
  Trophy,
  History,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// --- Types ---
interface RivalryData {
  updatedThroughSeason: string;
  allTime: {
    packersWins: number;
    bearsWins: number;
    ties: number;
    packersWinPct: number;
    lastMatchup: {
      date: string;
      packersScore: number;
      bearsScore: number;
      winner: string;
    };
    longestWinStreak: {
      team: string;
      games: number;
    };
    last10: {
      packersWins: number;
      bearsWins: number;
      ties: number;
    };
  };
  eras: {
    name: string;
    packers: number;
    bears: number;
    ties: number;
    note: string;
  }[];
  excuses: string[];
  packersExcuses: string[];
  ctaLinks: {
    ticketsUrl: string;
    gearUrl: string;
  };
}

// --- Components ---
const CountUp: React.FC<{ end: number; duration?: number }> = ({
  end,
  duration = 1000,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const linear = Math.min(elapsed / duration, 1);

      // Smooth ease-out for a more "premium" feel
      const eased = 1 - Math.pow(1 - linear, 3);

      const current = Math.floor(eased * end);
      setCount(current);

      if (linear < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end); // ensure exact final value
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count}</span>;
};

const SectionHeading: React.FC<{ children: React.ReactNode; id?: string }> = ({
  children,
  id,
}) => (
  <h2
    id={id}
    className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-8 flex items-center gap-3"
  >
    <div className="w-2 h-10 bg-green-700 rounded-full"></div>
    {children}
  </h2>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}> = ({ icon, label, value, description }) => (
  <div className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:border-transparent transition-all duration-300">
    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </span>
    <h3 className="text-3xl font-black text-blue-950 mb-3">{value}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

const App: React.FC = () => {
  const [data, setData] = useState<RivalryData | null>(null);

  // Excuse + sharing state
  const [excuse, setExcuse] = useState("");
  const [excuseIndex, setExcuseIndex] = useState<number>(0);
  const [packersExcuseIndex, setPackersExcuseIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [packersExcuse, setPackersExcuse] = useState("");
  const [packersCopied, setPackersCopied] = useState(false);

  // Page state
  const [error, setError] = useState<string | null>(null);

  // Helper: build share text (used for copy + X)
  const buildShareText = (e: string) =>
    `"${e}" — Bears fan, probably. via packersvsbears.com 🧀🏈`;

  // Helper: set excuse + persist as shareable URL (?excuse=7)
  const setExcuseAndUrl = (idx: number, json: RivalryData) => {
    const total = json.excuses?.length ?? 0;
    if (!total) return;

    const safeIdx = ((idx % total) + total) % total;
    const next = json.excuses[safeIdx] ?? "We’re rebuilding. Again.";

    setExcuseIndex(safeIdx);
    setExcuse(next);

    const params = new URLSearchParams(window.location.search);
    params.set("excuse", String(safeIdx));
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  const setPackersExcuseAndUrl = (idx: number) => {
    if (!data?.packersExcuses?.length) return;

    const total = data.packersExcuses.length;
    const safeIdx = ((idx % total) + total) % total;
    const next = data.packersExcuses[safeIdx] ?? "We’ll be fine.";

    setPackersExcuseIndex(safeIdx);
    setPackersExcuse(next);

    const params = new URLSearchParams(window.location.search);
    params.set("p_excuse", String(safeIdx));
    window.history.replaceState({}, "", `?${params.toString()}`);
  };

  useEffect(() => {
    // Fetch local JSON (expects public/data/rivalry.json)
    fetch(`${import.meta.env.BASE_URL}data/rivalry.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load rivalry data");
        return res.json();
      })
      .then((json: RivalryData) => {
        setData(json);

        // Initialize Bears generator
        setExcuse(json.excuses?.[0] ?? "We're rebuilding. Again.");

        // Initialize Packers generator
        setPackersExcuse(json.packersExcuses?.[0] ?? "We’ll be fine.");

        // URL state: if ?excuse= is present, load that specific excuse
        const params = new URLSearchParams(window.location.search);
        const idxRaw = params.get("excuse");

        if (idxRaw !== null) {
          const idx = Number(idxRaw);
          if (
            Number.isFinite(idx) &&
            idx >= 0 &&
            idx < (json.excuses?.length ?? 0)
          ) {
            setExcuseAndUrl(idx, json);
            return;
          }
        }

        // Default to first excuse and keep URL in sync
        setExcuseAndUrl(0, json);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load the stats. Please refresh the page.");
      });
  }, []);

  const generateExcuse = () => {
    if (!data?.excuses?.length) return;
    const idx = Math.floor(Math.random() * data.excuses.length);
    setExcuseAndUrl(idx, data);
  };

  const generatePackersExcuse = () => {
    if (!data?.packersExcuses?.length) return;

    const idx = Math.floor(Math.random() * data.packersExcuses.length);
    setPackersExcuseAndUrl(idx);
  };

  const copyToClipboard = async () => {
    const text = buildShareText(excuse);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for blocked clipboard / older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch {
        setCopied(false);
        alert("Copy failed—try manually copying.");
      }
    }
  };

  const copyPackersExcuse = async () => {
    try {
      await navigator.clipboard.writeText(
        `"${packersExcuse}" — Packers fan, probably.`
      );
      setPackersCopied(true);
      setTimeout(() => setPackersCopied(false), 1500);
    } catch {
      alert("Copy failed.");
    }
  };

  const shareOnX = () => {
    // Uses a direct link to the current excuse
    const text = buildShareText(excuse);
    const shareUrl = `${window.location.origin}${window.location.pathname}?excuse=${excuseIndex}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;

    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const sharePackersOnX = () => {
    const text = `"${packersExcuse}" — Packers fan, probably. via packersvsbears.com 🧀🏈`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?p_excuse=${packersExcuseIndex}`;

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;

    window.open(intent, "_blank", "noopener,noreferrer");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. HERO SECTION */}
      <header className="relative bg-white pt-20 pb-16 px-6 overflow-hidden border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Simple internal anchors (SEO/crawl + UX) */}
          <nav className="text-xs sm:text-sm text-gray-500 font-semibold mb-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#stats"
              className="hover:text-orange-600 transition-colors"
            >
              All-Time Record
            </a>
            <span className="text-gray-200">|</span>
            <a href="#eras" className="hover:text-orange-600 transition-colors">
              By Era
            </a>
            <span className="text-gray-200">|</span>
            <a
              href="#excuses"
              className="hover:text-orange-600 transition-colors"
            >
              Excuse Generator
            </a>
          </nav>

          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-green-800 bg-green-50 rounded-full uppercase">
            The North&apos;s Eternal Grudge
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 tracking-tight mb-4">
            Packers <span className="text-gray-300">vs</span> Bears
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto mb-6">
            The Rivalry. The Record. The Reality. <br />
            <span className="text-sm text-gray-400 mt-2 block font-normal">
              Updated through the {data.updatedThroughSeason} season
            </span>
          </p>

          {/* SEO-friendly descriptive copy (Google likes real text) */}
          <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Explore the full <strong>Packers vs Bears all-time record</strong>,
            including rivalry stats like win percentage, recent results, and
            era-by-era breakdowns. This page tracks the historical matchup
            between the Green Bay Packers and Chicago Bears with light satire
            and simple, fast-loading visuals.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full md:w-auto">
              <div className="text-center px-4">
                <span className="block text-xs font-bold text-green-700 uppercase tracking-widest mb-1">
                  Packers
                </span>
                <span className="text-6xl font-black text-blue-950">
                  <CountUp end={data.allTime.packersWins} />
                </span>
              </div>

              <div className="h-16 w-[1px] bg-gray-200"></div>

              <div className="text-center px-4">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Ties
                </span>
                <span className="text-3xl font-bold text-gray-300">
                  <CountUp end={data.allTime.ties} />
                </span>
              </div>

              <div className="h-16 w-[1px] bg-gray-200"></div>

              <div className="text-center px-4">
                <span className="block text-xs font-bold text-blue-950 uppercase tracking-widest mb-1">
                  Bears
                </span>
                <span className="text-6xl font-black text-blue-950">
                  <CountUp end={data.allTime.bearsWins} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500 uppercase">
                Win % (GB)
              </span>
              <span className="text-lg font-bold text-green-800">
                {(data.allTime.packersWinPct * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500 uppercase">
                Last Matchup
              </span>
              <span className="text-lg font-bold text-blue-950">
                {data.allTime.lastMatchup.winner}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-1/4 h-full bg-green-50/50 -skew-x-12 -translate-x-1/2"></div>
        <div className="absolute top-0 right-0 w-1/4 h-full bg-blue-50/50 -skew-x-12 translate-x-1/2"></div>
      </header>

      {/* 2. ALL-TIME STATS */}
      <section id="stats" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionHeading>All-Time Record &amp; Key Stats</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<Trophy className="text-green-700" />}
              label="All-Time Leader"
              value="Green Bay"
              description="The Packers hold the overall lead in the rivalry."
            />
            <StatCard
              icon={<TrendingUp className="text-blue-950" />}
              label="Longest Win Streak"
              value={`${data.allTime.longestWinStreak.games} Games`}
              description={`Held by ${data.allTime.longestWinStreak.team}. Consistency is king.`}
            />
            <StatCard
              icon={<ShieldCheck className="text-gray-500" />}
              label="Last 10 Matchups"
              value={`${data.allTime.last10.packersWins}-${data.allTime.last10.bearsWins}`}
              description="Recent history at a glance."
            />
            <StatCard
              icon={<Calendar className="text-orange-600" />}
              label="Last Matchup Result"
              value={`${data.allTime.lastMatchup.packersScore} - ${data.allTime.lastMatchup.bearsScore}`}
              description={`Winner: ${data.allTime.lastMatchup.winner} on ${data.allTime.lastMatchup.date}.`}
            />
            <StatCard
              icon={<History className="text-gray-900" />}
              label="Games Played"
              value={(
                data.allTime.packersWins +
                data.allTime.bearsWins +
                data.allTime.ties
              ).toString()}
              description="A historic tally of the NFL’s oldest rivalry."
            />
            <StatCard
              icon={<MessageCircle className="text-blue-500" />}
              label="Rivalry Health"
              value="Critical"
              description="Tensions remain high despite the statistical gap."
            />
          </div>
        </div>
      </section>

      {/* 3. ERA BREAKDOWN */}
      <section id="eras" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <SectionHeading>By Era</SectionHeading>
          <div className="space-y-4">
            {data.eras.map((era) => (
              <div
                key={era.name}
                className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="md:w-1/3">
                  <h3 className="text-2xl font-bold text-blue-950 mb-2">
                    {era.name}
                  </h3>
                  <p className="text-gray-500 text-sm italic">{era.note}</p>
                </div>

                <div className="flex items-center justify-center gap-12 bg-gray-50 px-8 py-4 rounded-2xl md:w-auto">
                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-green-700 uppercase mb-1">
                      Packers
                    </span>
                    <span className="text-3xl font-black text-blue-950">
                      {era.packers}
                    </span>
                  </div>

                  <div className="text-gray-300 font-bold text-xl">vs</div>

                  <div className="text-center">
                    <span className="block text-[10px] font-bold text-blue-950 uppercase mb-1">
                      Bears
                    </span>
                    <span className="text-3xl font-black text-blue-950">
                      {era.bears}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BEARS EXCUSE GENERATOR */}
      <section
        id="excuses"
        className="py-24 px-6 bg-white overflow-hidden relative"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-blue-950 mb-4 tracking-tight">
              The Bears Excuse Generator
            </h2>
            <p className="text-gray-600 font-medium">
              Lost again? Don&apos;t worry — we&apos;ve got you covered with a
              ready-made reason.
            </p>
          </div>

          <div className="bg-blue-950 text-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-blue-900/20 text-center border-b-8 border-orange-600">
            <div className="min-h-[120px] flex items-center justify-center mb-10">
              <p className="text-2xl md:text-4xl font-bold leading-tight tracking-tight italic">
                &quot;{excuse}&quot;
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={generateExcuse}
                type="button"
                aria-label="Generate a new Bears excuse"
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                New Excuse
              </button>

              <button
                onClick={copyToClipboard}
                type="button"
                aria-label="Copy excuse to clipboard"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? "Copied!" : "Copy to Share"}
              </button>

              <button
                onClick={shareOnX}
                type="button"
                aria-label="Share excuse on X"
                className="w-full sm:w-auto px-8 py-4 bg-black/80 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Share on X
              </button>
            </div>

            {/* <p className="mt-6 text-sm text-white/70">
              Tip: Each excuse has its own shareable link (example:
              <span className="font-semibold"> ?excuse=7</span>).
            </p> */}
          </div>
        </div>

        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </section>

      <section className="py-24 px-6 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-green-800 mb-4 tracking-tight">
            The Packers Rare Loss Generator
          </h2>

          <p className="text-gray-600 font-medium mb-12">
            On the rare occasion Green Bay loses...
          </p>

          <div className="bg-green-800 text-white p-8 md:p-12 rounded-[40px] shadow-xl text-center border-b-8 border-yellow-400">
            <div className="min-h-[120px] flex items-center justify-center mb-10">
              <p className="text-2xl md:text-4xl font-bold italic">
                "{packersExcuse}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={generatePackersExcuse}
                className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm"
              >
                New Excuse
              </button>

              <button
                onClick={copyPackersExcuse}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
              >
                {packersCopied ? "Copied!" : "Copy to Share"}
              </button>
              <button
                onClick={sharePackersOnX}
                type="button"
                className="w-full sm:w-auto px-8 py-4 bg-black/80 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Share on X
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-blue-950 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-12 mb-12">
            <div className="text-center md:text-left">
              <span className="text-2xl font-black tracking-tight block mb-2">
                PackersVsBears.com
              </span>
              <p className="text-white/50 text-sm max-w-sm">
                Providing essential rivalry stats and lighthearted satire for
                the NFL&apos;s most legendary matchup.
              </p>
            </div>

            <nav className="flex items-center gap-6">
              <a
                href="#stats"
                className="text-sm font-semibold hover:text-orange-500 transition-colors"
              >
                Stats
              </a>
              <a
                href="#eras"
                className="text-sm font-semibold hover:text-orange-500 transition-colors"
              >
                Eras
              </a>
              <a
                href="#excuses"
                className="text-sm font-semibold hover:text-orange-500 transition-colors"
              >
                Excuses
              </a>
            </nav>
          </div>

          <div className="text-center text-[10px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
            <p className="mb-4 font-bold text-white/40">Disclaimer</p>
            <p>
              Fan-made satire + stats. Not affiliated with the NFL or any team.{" "}
              <br />
              Team names and statistics used for informational/reporting
              purposes only.
            </p>
          </div>
        </div>
      </footer>
      <SpeedInsights />
    </div>
  );
};

export default App;
