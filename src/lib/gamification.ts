export interface GamificationStats {
  level: number;
  levelTitle: string;
  rankTier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Legendary";
  tierColor: string;
  tierBg: string;
  tierBorder: string;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPercent: number;
  totalPoints: number;
}

/**
 * Calculates a student's level and progression based on total points.
 * Level curve: 
 * Level 1: 0 - 49 XP
 * Level 2: 50 - 119 XP
 * Level 3: 120 - 219 XP
 * Level 4: 220 - 349 XP
 * Level 5: 350 - 499 XP
 * Level 6+: 500+ XP (+ 200 XP per level)
 */
export function calculateGamificationStats(totalPoints: number): GamificationStats {
  const points = Math.max(0, totalPoints || 0);

  // Progressive level thresholds
  const levelThresholds = [
    0,     // Lvl 1 starts at 0
    50,    // Lvl 2 starts at 50
    120,   // Lvl 3 starts at 120
    220,   // Lvl 4 starts at 220
    350,   // Lvl 5 starts at 350
    500,   // Lvl 6 starts at 500
    700,   // Lvl 7 starts at 700
    950,   // Lvl 8 starts at 950
    1250,  // Lvl 9 starts at 1250
    1600,  // Lvl 10 starts at 1600
  ];

  let level = 1;
  while (level < levelThresholds.length && points >= levelThresholds[level]) {
    level++;
  }

  // For levels beyond threshold array, 400 XP each
  if (points >= levelThresholds[levelThresholds.length - 1]) {
    const extraPoints = points - levelThresholds[levelThresholds.length - 1];
    level = levelThresholds.length + Math.floor(extraPoints / 400);
  }

  // Calculate current range
  let floorXp = 0;
  let nextXp = 50;

  if (level < levelThresholds.length) {
    floorXp = levelThresholds[level - 1];
    nextXp = levelThresholds[level];
  } else {
    floorXp = levelThresholds[levelThresholds.length - 1] + (level - levelThresholds.length) * 400;
    nextXp = floorXp + 400;
  }

  const range = Math.max(1, nextXp - floorXp);
  const currentInLevel = Math.max(0, points - floorXp);
  const progressPercent = Math.min(100, Math.round((currentInLevel / range) * 100));

  // Determine Title & Tier
  let levelTitle = "Freshman Explorer";
  let rankTier: GamificationStats["rankTier"] = "Bronze";
  let tierColor = "text-amber-500";
  let tierBg = "bg-amber-500/10";
  let tierBorder = "border-amber-500/30";

  if (level >= 10) {
    levelTitle = "Campus Legend";
    rankTier = "Legendary";
    tierColor = "text-yellow-400";
    tierBg = "bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20";
    tierBorder = "border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.25)]";
  } else if (level >= 7) {
    levelTitle = "Master Strategist";
    rankTier = "Diamond";
    tierColor = "text-cyan-400";
    tierBg = "bg-cyan-500/10";
    tierBorder = "border-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]";
  } else if (level >= 5) {
    levelTitle = "Distinguished Scholar";
    rankTier = "Platinum";
    tierColor = "text-emerald-400";
    tierBg = "bg-emerald-500/10";
    tierBorder = "border-emerald-400/30";
  } else if (level >= 3) {
    levelTitle = "Rising Contender";
    rankTier = "Gold";
    tierColor = "text-amber-300";
    tierBg = "bg-amber-400/10";
    tierBorder = "border-amber-300/30";
  } else if (level >= 2) {
    levelTitle = "Active Pioneer";
    rankTier = "Silver";
    tierColor = "text-slate-300";
    tierBg = "bg-slate-400/10";
    tierBorder = "border-slate-400/30";
  }

  return {
    level,
    levelTitle,
    rankTier,
    tierColor,
    tierBg,
    tierBorder,
    currentLevelXp: currentInLevel,
    xpForNextLevel: range,
    progressPercent,
    totalPoints: points,
  };
}
