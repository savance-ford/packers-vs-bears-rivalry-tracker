import React, { useState, useEffect } from "react";
import {
  Trophy,
  History,
  MessageCircle,
  Ticket,
  ShoppingBag,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";

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
    let start = 0;
    if (end === 0) return;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
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
  const [excuse, setExcuse] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch local JSON to avoid ESM import issues in some environments
    fetch(`${import.meta.env.BASE_URL}data/rivalry.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load rivalry data");
        return res.json();
      })
      .then((json: RivalryData) => {
        setData(json);
        setExcuse(json.excuses[0]);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load the stats. Please refresh the page.");
      });
  }, []);

  const generateExcuse = () => {
    if (!data) return;
    const newExcuse =
      data.excuses[Math.floor(Math.random() * data.excuses.length)];
    setExcuse(newExcuse);
  };

  const copyToClipboard = () => {
    const text = `"${excuse}" - via PackersVsBears.com 🧀🏈`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-green-800 bg-green-50 rounded-full uppercase">
            The North's Eternal Grudge
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 tracking-tight mb-4">
            Packers <span className="text-gray-300">vs</span> Bears
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto mb-12">
            The Rivalry. The Record. The Reality. <br />
            <span className="text-sm text-gray-400 mt-2 block font-normal">
              Updated through the {data.updatedThroughSeason} season
            </span>
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full md:w-auto">
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
          <SectionHeading>All-Time Record & Key Stats</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<Trophy className="text-green-700" />}
              label="All-Time Leader"
              value="Green Bay"
              description={`The Packers took the all-time lead in 2017 and haven't looked back.`}
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
              description="A decade of data tells a very one-sided story."
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
              description="A historic tally of the NFL's oldest and most frequent rivalry."
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
            {data.eras.map((era, idx) => (
              <div
                key={idx}
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
              Lost again? Don't worry, we've got you covered with a ready-made
              reason.
            </p>
          </div>

          <div className="bg-blue-950 text-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-blue-900/20 text-center border-b-8 border-orange-600">
            <div className="min-h-[120px] flex items-center justify-center mb-10">
              <p className="text-2xl md:text-4xl font-bold leading-tight tracking-tight italic">
                "{excuse}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={generateExcuse}
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
              >
                New Excuse
              </button>
              <button
                onClick={copyToClipboard}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? "Copied!" : "Copy to Share"}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* 5. MONETIZATION-READY CTA */}
      <section id="gear" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 md:p-16 text-center border border-gray-100 shadow-sm">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">Gear Up</h2>
          <p className="text-gray-500 mb-10">
            Rep the green and gold (or the navy and orange) for the next
            showdown. Don't show up empty-handed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href={data.ctaLinks.ticketsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-5 bg-blue-950 text-white font-bold rounded-2xl hover:translate-y-[-2px] transition-all"
            >
              <Ticket className="w-5 h-5" />
              Find Tickets
            </a>
            <a
              href={data.ctaLinks.gearUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-5 border-2 border-blue-950 text-blue-950 font-bold rounded-2xl hover:bg-blue-50 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Rivalry Gear
            </a>
          </div>
          <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest">
            Links may be affiliate links in the future.
          </p>
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
                the NFL's most legendary matchup.
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
    </div>
  );
};

export default App;
