import React, { useEffect, useState, useCallback } from "react";
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
import CountUp from "./components/CountUp";
import SectionHeading from "./components/SectionHeading";
import StatCard from "./components/StatCard";

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
    longestWinStreak: { team: string; games: number };
    last10: { packersWins: number; bearsWins: number; ties: number };
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
  ctaLinks: { ticketsUrl: string; gearUrl: string };
}

// --- Custom Hooks ---

// 1. Manages fetching the rivalry data
const useRivalryData = () => {
  const [data, setData] = useState<RivalryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/rivalry.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load rivalry data");
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError("Unable to load the stats. Please refresh the page.");
      });
  }, []);

  return { data, error };
};

// 2. Reusable hook for excuse state and URL syncing
const useExcuseManager = (items: string[] | undefined, urlKey: string) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items?.length) return;
    const params = new URLSearchParams(window.location.search);
    const idxRaw = params.get(urlKey);

    if (idxRaw !== null) {
      const idx = Number(idxRaw);
      if (Number.isFinite(idx) && idx >= 0 && idx < items.length) {
        setIndex(idx);
        return;
      }
    }

    // Sync default to URL if not present
    params.set(urlKey, "0");
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [items, urlKey]);

  const generate = useCallback(() => {
    if (!items?.length) return;
    const next = Math.floor(Math.random() * items.length);
    setIndex(next);

    const params = new URLSearchParams(window.location.search);
    params.set(urlKey, String(next));
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [items, urlKey]);

  return { excuse: items?.[index] ?? "", index, generate };
};

// 3. Reusable clipboard hook
const useClipboard = (resetDuration = 1500) => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDuration);
    } catch {
      alert("Copy failed—try manually copying.");
    }
  };

  return { copied, copy };
};

// --- Sub-Components ---

// Reusable Excuse Generator Component to keep DRY
interface ExcuseGeneratorProps {
  id?: string;
  title: string;
  subtitle: string;
  excuse: string;
  excuseIndex: number;
  urlKey: string;
  teamTag: string;
  onGenerate: () => void;
  theme: {
    sectionBg: string;
    titleColor: string;
    cardClasses: string;
    btnClasses: string;
    decorations?: React.ReactNode;
  };
}

const ExcuseGeneratorSection: React.FC<ExcuseGeneratorProps> = ({
  id,
  title,
  subtitle,
  excuse,
  excuseIndex,
  urlKey,
  teamTag,
  onGenerate,
  theme,
}) => {
  const { copied, copy } = useClipboard();

  const shareText = `"${excuse}" — ${teamTag} fan, probably.`;
  const shareUrl = `${window.location.origin}${window.location.pathname}?${urlKey}=${excuseIndex}`;

  const handleShareX = () => {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText + " via packersvsbears.com 🧀🏈"
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id={id}
      className={`py-24 px-6 relative overflow-hidden ${theme.sectionBg}`}
    >
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <h2
          className={`text-4xl md:text-5xl font-black mb-4 tracking-tight ${theme.titleColor}`}
        >
          {title}
        </h2>
        <p className="text-gray-600 font-medium mb-12">{subtitle}</p>

        <div
          className={`p-8 md:p-12 rounded-[40px] shadow-2xl text-center border-b-8 ${theme.cardClasses}`}
        >
          <div className="min-h-[120px] flex items-center justify-center mb-10">
            <p className="text-2xl md:text-4xl font-bold italic leading-tight tracking-tight">
              "{excuse}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGenerate}
              className={`w-full sm:w-auto px-8 py-4 font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-sm ${theme.btnClasses}`}
            >
              New Excuse
            </button>

            <button
              onClick={() => copy(shareText)}
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
              onClick={handleShareX}
              className="w-full sm:w-auto px-8 py-4 bg-black/80 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Share on X
            </button>
          </div>
        </div>
      </div>
      {theme.decorations}
    </section>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const { data, error } = useRivalryData();

  // Initialize excuse managers
  const bearsExcuses = useExcuseManager(data?.excuses, "excuse");
  const packersExcuses = useExcuseManager(data?.packersExcuses, "p_excuse");

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
      <ExcuseGeneratorSection
        id="excuses"
        title="The Bears Excuse Generator"
        subtitle="Lost again? Don't worry — we've got you covered with a ready-made reason."
        excuse={bearsExcuses.excuse}
        excuseIndex={bearsExcuses.index}
        urlKey="excuse"
        teamTag="Bears"
        onGenerate={bearsExcuses.generate}
        theme={{
          sectionBg: "bg-white",
          titleColor: "text-blue-950",
          cardClasses:
            "bg-blue-950 text-white border-orange-600 shadow-blue-900/20",
          btnClasses: "bg-orange-600 hover:bg-orange-700 text-white",
          decorations: (
            <>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
            </>
          ),
        }}
      />

      {/* 5. PACKERS EXCUSE GENERATOR */}
      <ExcuseGeneratorSection
        title="The Packers Rare Loss Generator"
        subtitle="On the rare occasion Green Bay loses..."
        excuse={packersExcuses.excuse}
        excuseIndex={packersExcuses.index}
        urlKey="p_excuse"
        teamTag="Packers"
        onGenerate={packersExcuses.generate}
        theme={{
          sectionBg: "bg-gray-50",
          titleColor: "text-green-800",
          cardClasses: "bg-green-800 text-white border-yellow-400",
          btnClasses: "bg-yellow-400 hover:bg-yellow-500 text-green-900",
        }}
      />

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
