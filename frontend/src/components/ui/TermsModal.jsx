import React from 'react';
import { Shield, X, CheckCircle2, FileText, Lock, AlertTriangle, Scale } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-gray-950/95 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                ProjectXia Terms & Conditions
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Official Marketplace Standards • Version 2.4 (2026)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono text-slate-300 leading-relaxed custom-scrollbar">
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-gray-900/50 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Marketplace Platform & Code Integrity
            </h4>
            <p>
              ProjectXia is a verified technical exchange for engineering blueprints, IoT firmware, AI models, and software architectures. All uploaded code must be original or appropriately attributed under valid open-source licenses. Plagiarism, malicious backdoors, malware, and fraudulent listings are strictly prohibited and detected via automated AI Shield.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-gray-900/50 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              2. Intellectual Property & Commercial Rights
            </h4>
            <p>
              Creators retain initial authorship of their work. Upon finalized transaction, buyers receive the full licensed access tier (Standard, Commercial, or Full Exclusive IP transfer) as specified on the project listing. Creators guarantee they hold full rights to distribute the assets.
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-gray-900/50 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              3. Pricing, Payments & Escrow Protection
            </h4>
            <p>
              All listed prices are displayed in Indian Rupees (₹ INR) and international equivalents. Payments and milestone deals are protected under encrypted verification. ProjectXia guarantees delivery of verified download files, GitHub repositories, and working video demonstrations.
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-gray-900/50 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              4. Mandatory Video Walkthroughs & Quality Guarantee
            </h4>
            <p>
              Every project published on ProjectXia requires a functional video demonstration. Buyers are encouraged to review the video proof, documentation, and live demo links prior to finalizing acquisition.
            </p>
          </div>

          {/* Section 5 */}
          <div className="p-4 rounded-2xl bg-gray-900/50 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              5. Security, Fraud Prevention & Account Governance
            </h4>
            <p>
              Accounts involved in fraudulent transactions, duplicate code distribution, or spamming will be permanently quarantined by the Anti-Fraud Shield. For support or dispute inquiries, official administrative resolution is managed via <strong>theprojectxia@gmail.com</strong>.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-slate-800 bg-gray-900/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            By using ProjectXia, you agree to these Terms and Conditions.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};

export default TermsModal;
