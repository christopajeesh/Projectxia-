import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Handshake, Clock, MessageSquare, Send, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import confetti from 'canvas-confetti';

const DealOfferModal = ({ isOpen, onClose, project, onOfferSubmitted }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { playClick, playSuccess } = useSound();

  const askingPrice = Number(project?.price || 2999);
  const [offerPrice, setOfferPrice] = useState(Math.round(askingPrice * 0.85)); // Default 15% discount negotiation
  const [deliveryDays, setDeliveryDays] = useState('5');
  const [customRequirements, setCustomRequirements] = useState('');
  const [buyerNote, setBuyerNote] = useState('Interested in acquiring your project. Let us negotiate and finalize terms.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login', 'Please log in to submit a deal proposal to the project seller.');
      return;
    }

    playSuccess();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setSubmitted(true);

    if (onOfferSubmitted) {
      onOfferSubmitted({
        projectId: project._id,
        projectTitle: project.title,
        sellerId: project.seller?.id || 'seller_default',
        sellerName: project.seller?.name || 'Project Creator',
        askingPrice,
        offerPrice: Number(offerPrice),
        deliveryDays,
        customRequirements,
        buyerNote,
        buyerName: user?.name || 'Verified Innovator',
        buyerEmail: user?.email || 'buyer@projectxia.dev',
      });
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 via-[#0a0f1d] to-black border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 z-10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-white">
                  Propose Deal & Negotiate
                </h3>
                <p className="text-[11px] font-mono text-emerald-400">
                  Direct Creator-to-Buyer Deal Making
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h4 className="font-display font-black text-xl text-emerald-300">
                Deal Proposal Dispatched!
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Your offer of <strong className="text-white">₹{Number(offerPrice).toLocaleString('en-IN')}</strong> has been transmitted directly into the creator's live chat inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitOffer} className="space-y-4 pt-4 text-xs font-mono">
              {/* Project Snippet */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-slate-400 block font-sans truncate">Target Project:</span>
                  <strong className="text-white font-sans text-sm truncate block">{project.title}</strong>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Asking Price:</span>
                  <strong className="text-emerald-400 text-sm">₹{askingPrice.toLocaleString('en-IN')} (Negotiable)</strong>
                </div>
              </div>

              {/* Offer Price Input */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Your Proposed Offer (₹ INR) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-emerald-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={100}
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 focus:border-emerald-400 rounded-xl pl-8 pr-3 py-2.5 text-white text-base font-bold focus:outline-none"
                    placeholder="e.g. 2500"
                  />
                </div>
                <div className="flex gap-2 pt-1.5">
                  {[0.7, 0.8, 0.9, 1.0].map((multiplier) => {
                    const quickPrice = Math.round(askingPrice * multiplier);
                    return (
                      <button
                        key={multiplier}
                        type="button"
                        onClick={() => {
                          playClick();
                          setOfferPrice(quickPrice);
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-500/20 text-[10px] text-slate-300 hover:text-emerald-300 border border-white/10 cursor-pointer"
                      >
                        {multiplier === 1.0 ? 'Full' : `${Math.round(multiplier * 100)}%`} (₹{quickPrice})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expected Delivery & Scope */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Timeline (Days)
                  </label>
                  <select
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                  >
                    <option value="1">Instant / 1 Day</option>
                    <option value="3">3 Days (Fast)</option>
                    <option value="5">5 Days (Standard)</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days (Custom Mod)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Deal Type
                  </label>
                  <div className="p-2.5 bg-black/60 border border-slate-700 rounded-xl text-emerald-300 font-bold text-center text-xs flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Direct Negotiation</span>
                  </div>
                </div>
              </div>

              {/* Custom Deliverables & Requirements */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Custom Requirements / Deliverables
                </label>
                <textarea
                  rows={2}
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  placeholder="e.g. Need complete source code, circuit diagram, and 1-hour walkthrough session."
                  className="w-full bg-black/60 border border-slate-700 focus:border-emerald-400 rounded-xl p-2.5 text-white text-xs focus:outline-none"
                />
              </div>

              {/* Note to Seller */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Message to Seller
                </label>
                <input
                  type="text"
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  placeholder="Say hello and propose your offer..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:opacity-95 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Deal Offer to Seller →</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DealOfferModal;
