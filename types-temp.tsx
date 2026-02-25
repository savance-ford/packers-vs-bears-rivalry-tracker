// --- Types ---
export interface RivalryData {
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
