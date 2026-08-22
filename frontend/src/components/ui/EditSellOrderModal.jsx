import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Tag,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Sliders,
  DollarSign,
  Check,
  Edit3,
  Layers,
  Code,
  FileText,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';

const EditSellOrderModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
  const { playClick, playSuccess } = useSound();

  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'details'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [price, setPrice] = useState(2999);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [projectType, setProjectType] = useState('Hardware + Software');
  const [techStack, setTechStack] = useState('');
  const [features, setFeatures] = useState('');
  const [demoVideo, setDemoVideo] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [documentation, setDocumentation] = useState('');

  const categories = [
    'Computer Science (CSE / IT)',
    'AI & Data Science (AI / ML)',
    'Electronics & Comm (ECE)',
    'Electrical Engineering (EEE)',
    'Mechanical & Robotics',
    'Civil & Structural IoT',
    'Biomedical & Biotech',
    'Cyber Security',
  ];

  useEffect(() => {
    if (project) {
      setPrice(Number(project.price) || 2999);
      setTitle(project.title || '');
      setTagline(project.tagline || '');
      setDescription(project.description || '');
      setCategory(project.category || 'Computer Science (CSE / IT)');
      setProjectType(project.projectType || 'Hardware + Software');
      setTechStack(
        Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack || ''
      );
      setFeatures(
        Array.isArray(project.features) ? project.features.join('\n') : project.features || ''
      );
      setDemoVideo(project.demoVideo || '');
      setGithubUrl(project.githubUrl || '');
      setDocumentation(project.documentation || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const currentOriginalPrice = Number(project.price) || 2999;
  const numPrice = Number(price) || 0;
  const creatorEarnings = Math.round(numPrice * 0.9);
  const platformFee = Math.round(numPrice * 0.1) + 99;

  // Percentage Quick Adjust Helpers
  const applyPercentChange = (percent) => {
    playClick();
    const calculated = Math.max(499, Math.round(currentOriginalPrice * (1 + percent / 100)));
    setPrice(calculated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (numPrice < 100) {
      setErrorMsg('Price must be at least ₹100.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        price: numPrice,
        category,
        projectType,
        techStack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
        features: features.split('\n').map((s) => s.trim()).filter(Boolean),
        demoVideo,
        githubUrl,
        documentation,
      };

      const res = await api.put(`/projects/${project._id || project.id}`, payload);
      const updated = res.data?.project || { ...project, ...payload };

      // Update in localStorage if saved locally
      try {
        const localList = JSON.parse(localStorage.getItem('projectxia_uploaded_projects') || '[]');
        const updatedLocal = localList.map((p) =>
          (p._id || p.id) === (project._id || project.id) ? { ...p, ...payload } : p
        );
        localStorage.setItem('projectxia_uploaded_projects', JSON.stringify(updatedLocal));
      } catch (e) {}

      playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      setSuccessMsg('Sell order price & details updated live on Marketplace!');

      if (onProjectUpdated) {
        onProjectUpdated(updated);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('[Update Sell Order Error]:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to update sell order. Please check inputs.'
      );
    } finally {
      setLoading(false);
    }
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
          className="relative w-full max-w-2xl bg-gradient-to-b from-gray-900 via-[#070d1d] to-black border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 z-10 text-white space-y-6 max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-lg sm:text-xl text-white">
                    Adjust Sell Order & Price
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
                    Author Control
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">
                  {project.title}
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

          {/* Success / Error Alerts */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Tabs: Quick Price Adjuster vs Full Specification Editor */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('pricing');
              }}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>⚡ Price & Market Shift</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('details');
              }}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>📝 Edit Blueprint Details</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'pricing' ? (
              <div className="space-y-5">
                {/* Current vs New Price Comparison Box */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block">Original Listed Price:</span>
                      <p className="text-sm font-mono text-slate-300 line-through">
                        ₹{currentOriginalPrice.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                        New Asking Price:
                      </span>
                      <p className="text-2xl sm:text-3xl font-display font-black text-emerald-400">
                        ₹{numPrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Earnings Calculation Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20">
                      <span className="text-slate-400 block text-[10px]">Your Earnings (90%):</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        ₹{creatorEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Xia Escrow Fee (10% + ₹99):</span>
                      <span className="text-slate-300 font-bold text-sm">
                        ₹{platformFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Price Preset Buttons for Hype Downfall or Surge */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      1-Click Market Trend Adjustments:
                    </span>
                    <span className="text-[10px] text-slate-500">Click to preview</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => applyPercentChange(-10)}
                      className="p-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <span>-10% Hype Dip</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPercentChange(-20)}
                      className="p-2.5 rounded-2xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-500/50 text-rose-300 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <span>-20% Downfall Cut</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPercentChange(-35)}
                      className="p-2.5 rounded-2xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>-35% Clearance</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPercentChange(15)}
                      className="p-2.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>+15% High Demand</span>
                    </button>
                  </div>
                </div>

                {/* Custom Exact Price Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 font-bold">
                    Or Enter Custom Price (₹ INR):
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-cyan-400 font-bold font-mono">₹</span>
                    <input
                      type="number"
                      min="100"
                      max="100000"
                      step="50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 2499"
                      className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-2xl pl-9 pr-4 py-3 text-sm text-white font-mono focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    Buyers in the marketplace will immediately see your newly adjusted price.
                  </p>
                </div>
              </div>
            ) : (
              /* DETAILS TAB */
              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Project Title"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tagline (One sentence hook)</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Short highlight tagline"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Department Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className="bg-gray-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Project Type</label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                    >
                      <option value="Hardware + Software" className="bg-gray-900">
                        Hardware + IoT Code
                      </option>
                      <option value="Software Only" className="bg-gray-900">
                        Software / AI Models
                      </option>
                      <option value="Hardware Only" className="bg-gray-900">
                        PCB Schematics & CAD
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Comprehensive Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Explain architecture, key features, hardware components, and results..."
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tech Stack (Comma-separated)</label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. ESP32, FreeRTOS, PyTorch, React, KiCAD"
                    className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">GitHub / Source Repo Link</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Prototype Demo Video URL</label>
                    <input
                      type="url"
                      value={demoVideo}
                      onChange={(e) => setDemoVideo(e.target.value)}
                      placeholder="https://assets.../demo.mp4"
                      className="w-full bg-gray-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Submit Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:opacity-95 text-black font-display font-black text-xs flex items-center gap-2 shadow-xl shadow-cyan-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Updating Live...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Apply Price & Update Sell Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditSellOrderModal;
