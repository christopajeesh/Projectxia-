import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const TrustScoreBadge = ({ score = 99, size = 'md', showLabel = true, plagiarismScore = '0.6%' }) => {
  const isHigh = score >= 90;
  const isMedium = score >= 70 && score < 90;

  const colorClass = isHigh
    ? 'text-cyan-400 border-cyan-400/40 bg-cyan-950/40 shadow-neon-cyan'
    : isMedium
    ? 'text-yellow-400 border-yellow-400/40 bg-yellow-950/40'
    : 'text-rose-400 border-rose-400/40 bg-rose-950/40';

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono font-semibold ${colorClass}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>{score}% AI Trust</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border backdrop-blur-md ${colorClass}`}>
      <div className="relative">
        <ShieldCheck className="w-5 h-5 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
      </div>
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1">
          <span className="font-display font-bold text-sm tracking-wide">{score}% Trust Score</span>
          <Sparkles className="w-3 h-3 text-cyan-300" />
        </div>
        {showLabel && (
          <span className="text-[10px] text-slate-400 font-mono">
            Plagiarism: {plagiarismScore} • AI Audited
          </span>
        )}
      </div>
    </div>
  );
};

export default TrustScoreBadge;
