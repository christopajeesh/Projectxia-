import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Terminal, Cpu, CheckCircle2, Heart, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative border-t border-cyan-500/20 bg-gray-950/95 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-black text-white">
                PROJECT<span className="text-gradient-cyan">XIA</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              India's premier next-generation software marketplace. Built for researchers, student innovators, and engineering startups with integrated AI Scam & Plagiarism Shield.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anti-Hacker Guard Active
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li><Link to="/marketplace?category=Artificial+Intelligence" className="hover:text-cyan-300">Artificial Intelligence</Link></li>
              <li><Link to="/marketplace?category=Cyber+Security" className="hover:text-cyan-300">Cyber Security & WAF</Link></li>
              <li><Link to="/marketplace?category=Blockchain" className="hover:text-cyan-300">zk-SNARK & Web3</Link></li>
              <li><Link to="/marketplace?category=IoT" className="hover:text-cyan-300">IoT & Agritech Embedded</Link></li>
              <li><Link to="/marketplace?category=Cloud+Computing" className="hover:text-cyan-300">Cloud & Kubernetes</Link></li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3">
              Security & Defense
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li><Link to="/ai-shield" className="hover:text-purple-300">AI Plagiarism Analyzer</Link></li>
              <li><Link to="/ai-shield" className="hover:text-purple-300">Scam & Backdoor Detector</Link></li>
              <li><Link to="/profile" className="hover:text-purple-300">KYC Creator Certification</Link></li>
              <li><Link to="/admin" className="hover:text-purple-300">Owner Audit Registry</Link></li>
              <li><span className="text-slate-500">256-Bit SSL End-to-End</span></li>
            </ul>
          </div>

          {/* Platform Innovation */}
          <div>
            <h4 className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider mb-3">
              Engineering Hub
            </h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed mb-3">
              Built for engineering students, researchers, and technical startups to showcase, buy, and collaborate on hardware and software projects.
            </p>
            <div className="p-3 rounded-xl bg-gray-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span>Video Walkthroughs:</span>
                <span className="text-cyan-400 font-bold">Mandatory</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plagiarism Checker:</span>
                <span className="text-emerald-400 font-bold">Integrated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
          <p>© 2026 ProjectXia Inc. All rights reserved. Engineering Marketplace & Custom Development Platform.</p>
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="hover:text-slate-300">Projects</Link>
            <Link to="/ai-shield" className="hover:text-slate-300">Plagiarism Checker</Link>
            <span className="text-cyan-400">Node: Cloud Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
