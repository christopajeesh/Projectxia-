import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Play,
  Download,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Code,
  Terminal,
  FileText,
  Star,
  UserCheck,
  Sparkles,
  Share2,
  Layers,
  Cpu,
  Handshake,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Upload,
  Sliders,
} from 'lucide-react';
import VideoPlayerModal from '../components/ui/VideoPlayerModal';
import LicenseModal from '../components/ui/LicenseModal';
import ShareProjectModal from '../components/ui/ShareProjectModal';
import DealOfferModal from '../components/ui/DealOfferModal';
import EditSellOrderModal from '../components/ui/EditSellOrderModal';
import TermsModal from '../components/ui/TermsModal';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playClick, playSuccess, playShield } = useSound();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [project, setProject] = useState(null);
  const [activeDealModal, setActiveDealModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('abstract');
  const [activeVideoModal, setActiveVideoModal] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [activeShareModal, setActiveShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Edit Project Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data?.project) {
        setProject(res.data.project);
        setEditFormData({
          title: res.data.project.title || '',
          tagline: res.data.project.tagline || '',
          description: res.data.project.description || '',
          price: res.data.project.price || 2999,
          category: res.data.project.category || 'Computer Science (CSE / IT)',
          techStack: Array.isArray(res.data.project.techStack) ? res.data.project.techStack.join(', ') : '',
          features: Array.isArray(res.data.project.features) ? res.data.project.features.join('\n') : '',
          screenshots: res.data.project.screenshots?.[0] || '',
          demoVideo: res.data.project.demoVideo || '',
          githubUrl: res.data.project.githubUrl || '',
          documentation: res.data.project.documentation || '',
        });
      } else {
        setProject(null);
      }
    } catch (e) {
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Author Check: Only the author / poster or super admin can edit/delete
  const isAuthor = Boolean(
    user &&
    project?.seller &&
    (String(user._id || user.id) === String(project.seller.id || project.seller._id) ||
     (user.email && project.seller.email && user.email.toLowerCase() === project.seller.email.toLowerCase()) ||
     user.role === 'owner' ||
     user.role === 'admin')
  );

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    playClick();
    try {
      const res = await api.post(`/projects/${id}/bookmark`);
      setIsSaved(res.data.isSaved);
      if (res.data.isSaved) {
        confetti({ particleCount: 40, spread: 50 });
      }
    } catch (e) {}
  };

  const handleStartChat = () => {
    playClick();
    if (!isAuthenticated) {
      openAuthModal('login', 'Please log in to chat with the project creator.');
      return;
    }
    navigate('/chat', {
      state: {
        creatorId: project.seller.id,
        creatorName: project.seller.name,
        creatorAvatar: project.seller.avatar,
        projectContext: {
          projectId: project._id,
          title: project.title,
          price: project.price,
        },
      },
    });
  };

  // Handle Edit Project Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const res = await api.put(`/projects/${project._id}`, {
        ...editFormData,
        price: Number(editFormData.price),
        techStack: editFormData.techStack.split(',').map(s => s.trim()).filter(Boolean),
        features: editFormData.features.split('\n').map(s => s.trim()).filter(Boolean),
        screenshots: [editFormData.screenshots],
      });

      setProject(res.data.project);
      setIsEditModalOpen(false);
      playSuccess();
      confetti({ particleCount: 70, spread: 60 });
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update project. Please ensure inputs are clear and valid.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Project Submit
  const handleDeleteSubmit = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/${project._id}`);
      playSuccess();
      setIsDeleteModalOpen(false);
      navigate('/marketplace');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
      setDeleteLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await api.post(`/projects/${id}/reviews`, newReview);
      setProject(res.data.project);
      playSuccess();
      confetti({ particleCount: 60, spread: 70 });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-cyan-400 font-mono text-sm">
        Authenticating project abstract & verified schematics...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-32 text-center text-slate-300 font-mono text-sm space-y-4 max-w-md mx-auto px-4">
        <h3 className="text-xl font-display font-bold text-white">Project Not Found in Vault</h3>
        <p className="text-xs text-slate-400">
          This project may have been moved, removed by the creator, or is awaiting original code audit.
        </p>
        <Link
          to="/marketplace"
          className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-8 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Link to="/marketplace" className="hover:text-cyan-300">Projects</Link>
            <span>/</span>
            <span className="text-cyan-400">{project.category}</span>
            <span>/</span>
            <span className="text-slate-200 truncate max-w-xs">{project.title}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* AUTHOR ONLY: Edit & Delete Action Buttons */}
            {isAuthor && (
              <div className="flex items-center gap-2 bg-purple-950/70 border border-purple-500/40 px-3 py-1 rounded-2xl">
                <span className="text-[10px] text-purple-300 font-bold">Author Clearance:</span>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-black font-bold transition-all cursor-pointer text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all cursor-pointer text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                playClick();
                setActiveShareModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:text-white transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                isSaved
                  ? 'bg-pink-500/20 text-pink-300 border-pink-400'
                  : 'bg-gray-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Bookmarked' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Project Hero Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Visual & Video Box */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-950 border border-cyan-500/30 shadow-2xl group">
              <img
                src={project.screenshots?.[0] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80'}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />

              {/* Play Video Trigger Overlay */}
              <button
                onClick={() => {
                  playShield();
                  setActiveVideoModal(true);
                }}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black flex items-center justify-center shadow-2xl shadow-cyan-500/50 transition-transform hover:scale-110 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current ml-1" />
              </button>

              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Verified Prototype Video Walkthrough</span>
              </div>
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-tight">
                {project.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base font-mono text-slate-300 leading-relaxed">
                {project.tagline}
              </p>
            </div>
          </div>

          {/* Right Action & Checkout Box */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gray-950/90 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">Asking Budget / Price:</span>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-display font-black text-emerald-400">
                      ₹{project.price?.toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Negotiable
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                  Direct P2P Deal
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified 4K Prototype Walkthrough Video</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Complete Source Code, Schematics & BOM</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Shield Plagiarism Passed ({project.plagiarismScore || 0.3}% index)</span>
                </div>
              </div>

              {/* Author Notice vs Buyer Actions */}
              {isAuthor ? (
                <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-center space-y-3 font-mono text-xs text-purple-300">
                  <div className="flex items-center justify-center gap-1.5 text-white font-bold text-sm">
                    <span>👑 Your Active Sell Order</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    You are the creator of this blueprint. Buying or proposing deals on your own project is disabled.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setIsEditModalOpen(true);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:opacity-95 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>✏️ Adjust Price / Edit Sell Order</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setActiveDealModal(true);
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:opacity-95 text-black font-display font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-emerald-500/25 hover:scale-[1.01]"
                  >
                    <Handshake className="w-4 h-4 fill-current" />
                    <span>🤝 Propose Deal & Negotiate Rate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 font-display font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-102"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>💬 Chat with Project Seller Directly</span>
                  </button>
                </div>
              )}
            </div>

            {/* AI Security & Plagiarism Breakdown Box */}
            <div className="p-5 rounded-3xl bg-cyan-950/20 border border-cyan-500/30 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Anti-Scam & Plagiarism Verification
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  VERIFIED ORIGINAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-gray-900/80 border border-slate-800">
                  <p className="text-slate-400">Plagiarism Index:</p>
                  <p className="text-cyan-300 font-bold text-base mt-0.5">{project.plagiarismScore}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-900/80 border border-slate-800">
                  <p className="text-slate-400">Clean Code Score:</p>
                  <p className="text-emerald-400 font-bold text-base mt-0.5">{project.cleanCodeScore}%</p>
                </div>
              </div>

              <p className="text-[11px] font-mono text-slate-400 leading-tight">
                Authenticity validated. Zero duplicate academic submissions or deceptive claims found.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-cyan-500/20 mb-8 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'abstract', label: 'Project Abstract & Synopsis' },
            { id: 'architecture', label: 'Architecture & Schematics' },
            { id: 'docs', label: 'Setup Runbook' },
            { id: 'seller', label: 'Seller Credentials' },
            { id: 'reviews', label: `Reviews (${project.numReviews || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveTab(tab.id);
              }}
              className={`px-5 py-3 text-xs font-mono font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="bg-gray-950/80 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          {activeTab === 'abstract' && (
            <div className="space-y-6 text-slate-300 font-mono text-sm leading-relaxed">
              <h3 className="text-lg font-display font-bold text-white">Project Abstract & Problem Statement</h3>
              <p>{project.description}</p>

              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  Key Deliverables & Specifications:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features?.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-900 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 font-mono text-xs text-slate-300">
              <h3 className="text-lg font-display font-bold text-white mb-2">System Architecture & Circuit Schematics</h3>
              <div className="p-5 rounded-2xl bg-gray-900 border border-cyan-500/30 space-y-4">
                <p>
                  This project includes full end-to-end hardware circuit diagrams, pin-out mappings, and software class flowcharts.
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4 font-mono text-xs text-slate-300">
              <h3 className="text-lg font-display font-bold text-white mb-2">Installation & Setup Guide</h3>
              <pre className="p-5 rounded-2xl bg-black border border-cyan-500/30 text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {project.documentation}
              </pre>
            </div>
          )}

          {activeTab === 'seller' && (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={project.seller?.avatar}
                alt={project.seller?.name}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-cyan-400 shadow-xl"
              />
              <div className="space-y-2 text-center sm:text-left">
                <h4 className="text-xl font-display font-bold text-white">{project.seller?.name}</h4>
                <p className="text-xs font-mono text-cyan-400">{project.seller?.verificationLevel}</p>
                <p className="text-xs font-mono text-slate-400 max-w-xl">
                  Engineering innovator verified by ProjectXia. You can message this creator directly via chat to discuss custom requirements.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <h3 className="text-lg font-display font-bold text-white">Verified Buyer Reviews</h3>
              <div className="space-y-4">
                {project.reviews?.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500">No public reviews yet. Be the first verified buyer to rate!</p>
                ) : (
                  project.reviews?.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={rev.userAvatar} alt={rev.userName} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-xs font-bold text-white font-mono">{rev.userName}</span>
                        </div>
                        <div className="flex text-yellow-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-mono text-slate-300">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">Write a Verified Rating</h4>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share feedback on code architecture, Docker integration, or hardware build quality..."
                  required
                  className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs font-mono text-white focus:outline-none"
                  rows={3}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs cursor-pointer"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Terms & Conditions & Buyer Protection Banner */}
        <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-gray-950/80 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider">
                ProjectXia Buyer Protection & Marketplace Terms
              </h4>
              <p className="text-[11px] font-mono text-slate-400">
                All source code releases, hardware schematics, and video walkthroughs are protected under official ProjectXia Terms & Conditions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="px-5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            Terms & Conditions →
          </button>
        </div>
      </div>

      {/* EDIT SELL ORDER & PRICE ADJUSTMENT MODAL (AUTHOR ONLY) */}
      {isEditModalOpen && (
        <EditSellOrderModal
          isOpen={isEditModalOpen}
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onProjectUpdated={(updatedProject) => {
            setProject(updatedProject);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL (AUTHOR ONLY) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-gray-950 border border-rose-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-white">
                Delete Project Permanently?
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Are you sure you want to delete <span className="text-rose-300 font-bold">"{project.title}"</span>? This will remove the listing from the marketplace vault.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteLoading ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoModal && (
        <VideoPlayerModal
          isOpen={activeVideoModal}
          onClose={() => setActiveVideoModal(false)}
          videoUrl={project.demoVideo}
          title={project.title}
          category={project.category}
          trustScore={project.trustScore}
        />
      )}

      {/* Direct Deal Offer Modal */}
      {activeDealModal && (
        <DealOfferModal
          isOpen={activeDealModal}
          project={project}
          onClose={() => setActiveDealModal(false)}
          onOfferSubmitted={(offerData) => {
            navigate('/chat', {
              state: {
                creatorId: project.seller?.id || 'verified_seller',
                creatorName: project.seller?.name || 'Verified Innovator',
                creatorAvatar: project.seller?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(project.seller?.name || 'Seller')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`,
                projectContext: {
                  projectId: project._id,
                  title: project.title,
                  price: offerData.offerPrice,
                  customRequirements: offerData.customRequirements,
                  buyerNote: offerData.buyerNote,
                  dealProposal: offerData,
                },
              },
            });
          }}
        />
      )}

      {/* Share Modal */}
      {activeShareModal && (
        <ShareProjectModal
          isOpen={activeShareModal}
          onClose={() => setActiveShareModal(false)}
          project={project}
        />
      )}

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default ProjectDetailPage;
