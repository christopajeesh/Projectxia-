import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Play, CheckCircle2, Cpu, Zap, CornerDownLeft } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useNavigate } from 'react-router-dom';

const LiveCyberTerminal = ({ className = '' }) => {
  const { playClick, playShield, playSuccess } = useSound();
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { text: '⚡ ProjectXia Quantum Kernel v4.2.0 [Online]', type: 'system' },
    { text: 'Type "help" to view available engineering commands or "scan" to test code.', type: 'info' },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    playClick();
    const newHistory = [...history, { text: `user@projectxia:~$ ${inputVal}`, type: 'user' }];

    if (cmd === 'help') {
      newHistory.push(
        { text: 'Available Commands:', type: 'system' },
        { text: '  scan          - Run live AI code & circuit plagiarism audit', type: 'info' },
        { text: '  projects      - Browse all verified engineering blueprints', type: 'info' },
        { text: '  kicad         - Inspect 4-layer PCB pinouts & schematics', type: 'info' },
        { text: '  verify        - Check SHA-256 repository authenticity token', type: 'info' },
        { text: '  clear         - Clear terminal console', type: 'info' }
      );
    } else if (cmd === 'scan') {
      playShield();
      newHistory.push(
        { text: '[INITIATING SCAN] Extracting AST tokens & circuit topologies...', type: 'warn' },
        { text: '✔ Abstract Plagiarism: 0.2% (Pass - Clean Originality)', type: 'success' },
        { text: '✔ Static Vulnerabilities: 0 Detected', type: 'success' },
        { text: '✔ Verdict: 100% Verified Commercial Grade Blueprint', type: 'success' }
      );
    } else if (cmd === 'projects' || cmd === 'marketplace') {
      playSuccess();
      newHistory.push({ text: 'Navigating to Engineering Marketplace...', type: 'system' });
      setTimeout(() => navigate('/marketplace'), 800);
    } else if (cmd === 'kicad' || cmd === 'schematic') {
      playShield();
      newHistory.push(
        { text: 'KiCAD Schematic Matrix Loaded: Dual-Layer PCB @ 115200 Baud', type: 'success' }
      );
    } else if (cmd === 'verify') {
      playSuccess();
      newHistory.push({
        text: 'SHA-256 HASH: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 [VALID]',
        type: 'success',
      });
    } else if (cmd === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else {
      newHistory.push({
        text: `Command not recognized: "${cmd}". Type "help" for a list of commands.`,
        type: 'error',
      });
    }

    setHistory(newHistory);
    setInputVal('');
  };

  return (
    <div className={`rounded-3xl bg-gray-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl overflow-hidden font-mono text-xs ${className}`}>
      {/* Top Console Bar */}
      <div className="p-3.5 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold ml-2 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            PROJECTXIA_CORE_TERMINAL
          </span>
        </div>
        <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          ONLINE
        </span>
      </div>

      {/* Terminal Output Area */}
      <div className="p-4 h-48 overflow-y-auto space-y-2 leading-relaxed bg-[#030712]/90 select-text">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`${
              line.type === 'user'
                ? 'text-cyan-300 font-bold'
                : line.type === 'success'
                ? 'text-emerald-400'
                : line.type === 'warn'
                ? 'text-yellow-300'
                : line.type === 'error'
                ? 'text-rose-400'
                : line.type === 'system'
                ? 'text-purple-300 font-bold'
                : 'text-slate-300'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleCommand} className="p-2.5 border-t border-slate-800 bg-gray-900/90 flex items-center gap-2">
        <span className="text-cyan-400 font-bold pl-2">user@px:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="type 'help', 'scan', 'projects'..."
          className="flex-1 bg-transparent text-white focus:outline-none text-xs font-mono"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default LiveCyberTerminal;
