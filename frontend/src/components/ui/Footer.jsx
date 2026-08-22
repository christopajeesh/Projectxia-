import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Terminal, Cpu, CheckCircle2, Heart, Award } from 'lucide-react';
import TermsModal from './TermsModal';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="relative border-t border-white/10 bg-[#030303] overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-[#00ffaa]">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-black text-white">
                PROJECT<span className="text-[#00ffaa]">XIA</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              India's premier next-generation software marketplace. Built for researchers, student innovators, and engineering startups with integrated AI Scam & Plagiarism Shield.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-3 py-1 rounded-full bg-black/60 border border-[#00ffaa]/30 text-[#00ffaa]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anti-Hacker Guard Active
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#00ffaa] uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link to="/marketplace?category=Artificial+Intelligence" className="hover:text-white transition-colors">Artificial Intelligence</Link></li>
              <li><Link to="/marketplace?category=Cyber+Security" className="hover:text-white transition-colors">Cyber Security & WAF</Link></li>
              <li><Link to="/marketplace?category=Blockchain" className="hover:text-white transition-colors">zk-SNARK & Web3</Link></li>
              <li><Link to="/marketplace?category=IoT" className="hover:text-white transition-colors">IoT & Agritech Embedded</Link></li>
              <li><Link to="/marketplace?category=Cloud+Computing" className="hover:text-white transition-colors">Cloud & Kubernetes</Link></li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider mb-3">
              Security & Defense
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/ai-shield" className="hover:text-violet-300 transition-colors">AI Plagiarism Analyzer</Link></li>
              <li><Link to="/ai-shield" className="hover:text-violet-300 transition-colors">Scam & Backdoor Detector</Link></li>
              <li><Link to="/profile" className="hover:text-violet-300 transition-colors">KYC Creator Certification</Link></li>
              <li><Link to="/admin" className="hover:text-violet-300 transition-colors">Owner Audit Registry</Link></li>
              <li><span className="text-slate-500">256-Bit SSL End-to-End</span></li>
            </ul>
          </div>

          {/* Platform Innovation */}
          <div>
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
              Engineering Hub
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built for engineering students, researchers, and technical startups to showcase, buy, and collaborate on hardware and software projects.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Video Walkthroughs:</span>
                <span className="text-indigo-400 font-bold">Mandatory</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plagiarism Checker:</span>
                <span className="text-emerald-400 font-bold">Integrated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 ProjectXia Inc. All rights reserved. Engineering Marketplace & Custom Development Platform.</p>
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="hover:text-slate-300 transition-colors">Projects</Link>
            <Link to="/ai-shield" className="hover:text-slate-300 transition-colors">Plagiarism Checker</Link>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span className="text-emerald-400 font-mono">Node: Cloud Secured</span>
          </div>
        </div>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </footer>
  );
};

export default Footer;
