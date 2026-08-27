import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ShieldCheck,
  Play,
  ArrowUpDown,
  Tag,
  Star,
  Download,
  ExternalLink,
  Sparkles,
  Cpu,
  Code,
  Layers,
  ArrowRight,
  Zap,
  Terminal,
  MessageSquare,
  Share2,
  Handshake,
  PlusCircle,
  Sliders,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import VideoPlayerModal from '../components/ui/VideoPlayerModal';
import ArchitecturePeekModal from '../components/ui/ArchitecturePeekModal';
import ShareProjectModal from '../components/ui/ShareProjectModal';
import DealOfferModal from '../components/ui/DealOfferModal';
import EditSellOrderModal from '../components/ui/EditSellOrderModal';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MarketplacePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { playClick, playHover, playSuccess } = useSound();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [activeShareProject, setActiveShareProject] = useState(null);
  const [activeDealProject, setActiveDealProject] = useState(null);
  const [activeEditProject, setActiveEditProject] = useState(null);

  const [allProjects, setAllProjects] = useState(() => {
    try {
      const localList = JSON.parse(localStorage.getItem('projectxia_uploaded_projects') || '[]');
      const deletedList = JSON.parse(localStorage.getItem('projectxia_admin_deleted_projects') || '[]');
      return localList.filter((p) => (p._id || p.id) && !deletedList.includes(p._id || p.id));
    } catch (e) {
      return [];
    }
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [activePeekProject, setActivePeekProject] = useState(null);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [deliveryType, setDeliveryType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hideOwnListings, setHideOwnListings] = useState(false);

  const departments = [
    'All Departments',
    'Computer Science (CSE / IT)',
    'AI & Data Science (AI / ML)',
    'Electronics & Comm (ECE)',
    'Electrical Engineering (EEE)',
    'Mechanical & Robotics',
    'Civil & Structural IoT',
    'Biomedical & Biotech',
    'Cyber Security',
  ];

  const deliveryTypes = [
    { id: 'All', label: 'All Projects', icon: Layers },
    { id: 'Hardware + Software', label: 'Hardware + IoT Code', icon: Cpu },
    { id: 'Software Only', label: 'Software / AI Models', icon: Code },
    { id: 'Hardware Only', label: 'PCB Schematics & CAD', icon: Zap },
  ];

  const isUserOwnProject = (project) => {
    if (!user || !project) return false;
    const userId = String(user._id || user.id || '').trim();
    const userEmail = String(user.email || '').trim().toLowerCase();

    const sellerId = String(
      project.seller?.id || project.seller?._id || project.authorId || project.userId || ''
    ).trim();
    const sellerEmail = String(project.seller?.email || project.authorEmail || '').trim().toLowerCase();

    if (userId && sellerId && userId === sellerId) return true;
    if (userEmail && sellerEmail && userEmail === sellerEmail) return true;
    return false;
  };

  // Initial fetch on mount
  useEffect(() => {
    // Purge old cached fake demo projects if any
    try {
      localStorage.removeItem('px_cached_marketplace_projects');
    } catch (e) {}

    fetchMarketplaceProjects();
    window.addEventListener('storage', fetchMarketplaceProjects);
    return () => {
      window.removeEventListener('storage', fetchMarketplaceProjects);
    };
  }, []);

  // Instant client-side filtering whenever filters change (0ms latency!)
  useEffect(() => {
    let filtered = [...allProjects];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.techStack || []).some((t) => String(t).toLowerCase().includes(q))
      );
    }

    if (deliveryType !== 'All') {
      filtered = filtered.filter((p) => p.projectType === deliveryType);
    }

    if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Departments') {
      const qCat = selectedCategory.toLowerCase().slice(0, 5);
      filtered = filtered.filter((p) => (p.category || '').toLowerCase().includes(qCat));
    }

    if (maxPrice && Number(maxPrice) < 1000000) {
      filtered = filtered.filter((p) => Number(p.price || 0) <= Number(maxPrice));
    }

    if (hideOwnListings && user) {
      filtered = filtered.filter((p) => !isUserOwnProject(p));
    }

    setProjects(filtered);
  }, [allProjects, search, selectedCategory, deliveryType, maxPrice, hideOwnListings, user]);

  const fetchMarketplaceProjects = async () => {
    try {
      const res = await api.get('/projects').catch(() => ({ data: { projects: [] } }));
      const serverList = res.data?.projects || [];
      const localList = JSON.parse(localStorage.getItem('projectxia_uploaded_projects') || '[]');
      const deletedList = JSON.parse(localStorage.getItem('projectxia_admin_deleted_projects') || '[]');

      // Merge local and server lists
      const combinedMap = new Map();

      // Load user local uploads
      localList.forEach((p) => {
        const id = p._id || p.id;
        if (id && !deletedList.includes(id)) {
          combinedMap.set(id, p);
        }
      });

      // Load server projects (excluding fake demo IDs)
      serverList.forEach((p) => {
        const id = p._id || p.id;
        if (id && !deletedList.includes(id) && !id.startsWith('proj_001_') && !id.startsWith('proj_002_') && !id.startsWith('proj_003_') && !id.startsWith('proj_004_')) {
          combinedMap.set(id, p);
        }
      });

      let fetchedList = Array.from(combinedMap.values());
      setAllProjects(fetchedList);
    } catch (e) {
      console.warn('[Marketplace Fetch Warning]:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    playClick();
    fetchMarketplaceProjects();
  };

  return (
    <div className="relative min-h-screen pt-8 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ProjectXia Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mt-1">
              Explore Verified Engineering Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Browse authentic hardware, software, and IoT projects with verified video walkthroughs, schematics, and clean source code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/upload"
              onClick={playClick}
              className="px-5 py-2.5 rounded-full bg-[#00ffaa] hover:bg-[#33ffbb] text-black font-display font-bold text-xs shadow-[0_0_15px_rgba(0,255,170,0.3)] cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-black" />
              <span>+ List Original Project</span>
            </Link>

            <span className="text-xs font-mono text-[#00ffaa] bg-black/60 border border-[#00ffaa]/30 px-3.5 py-2 rounded-full">
              {projects.length} Projects Live
            </span>
          </div>
        </div>

        {/* Page Purpose & How It Works Banner for Visitors */}
        <div className="mb-6 p-5 rounded-3xl page-purpose-banner text-xs text-neutral-300 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-2 text-sm">
                <span className="p-1 rounded bg-[#00ffaa]/20 text-[#00ffaa]">💡</span>
                <span>What is this page for? (Marketplace Guide)</span>
              </p>
              <p className="text-neutral-300 text-xs">
                This page lists <strong>complete, working engineering projects</strong> built by students and researchers. Every project includes <strong>working video demos, verified source code, architecture schematics, and direct chat with the creator</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-300 shrink-0">
              <span className="px-3 py-1 rounded-full bg-black/50 border border-[#00ffaa]/30 text-[#00ffaa]">✓ Video Demos</span>
              <span className="px-3 py-1 rounded-full bg-black/50 border border-purple-500/30 text-purple-300">✓ Full Source Code</span>
              <span className="px-3 py-1 rounded-full bg-black/50 border border-emerald-500/30 text-emerald-300">✓ Direct Creator Chat</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Dashboard */}
        <div className="mb-8 p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl space-y-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#00ffaa]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword, IEEE topic, hardware board (ESP32, STM32, ROS2), or framework (PyTorch, React)..."
                className="w-full bg-black/60 border border-white/10 focus:border-[#00ffaa] rounded-full pl-11 pr-4 py-3 text-xs text-white font-mono placeholder:text-neutral-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Search Blueprints</span>
            </button>
          </form>

          {/* Delivery Type Selector */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
            {deliveryTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    playClick();
                    setDeliveryType(type.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deliveryType === type.id
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-gray-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Department Category Pills with Framer Motion Layout Animation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {departments.map((dept) => {
              const isSelected =
                selectedCategory === dept || (dept === 'All Departments' && selectedCategory === 'All');
              return (
                <button
                  key={dept}
                  onClick={() => {
                    playClick();
                    setSelectedCategory(dept === 'All Departments' ? 'All' : dept);
                  }}
                  className={`relative px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'text-black font-extrabold'
                      : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5 hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00ffaa] via-[#33ffbb] to-[#00ffaa] shadow-[0_0_20px_rgba(0,255,170,0.45)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {dept}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filters Bar: Sort & Max Price & Own Listings */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-gray-900 text-cyan-400 focus:ring-0"
                />
                <span className="text-white font-bold">Original Source Code Only</span>
              </label>

              {user && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideOwnListings}
                    onChange={(e) => {
                      playClick();
                      setHideOwnListings(e.target.checked);
                    }}
                    className="rounded border-slate-700 bg-gray-900 text-purple-400 focus:ring-0"
                  />
                  <span className="text-purple-300 font-bold">Hide My Own Listings (Exclude items I posted)</span>
                </label>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span>Max Budget: ₹{Number(maxPrice) >= 1000000 ? '10,00,000+ (Unlimited)' : Number(maxPrice).toLocaleString('en-IN')}</span>
              <input
                type="range"
                min="1000"
                max="1000000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onMouseUp={() => fetchMarketplaceProjects()}
                className="w-32 accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-24 text-center text-cyan-400 font-mono text-sm">
            Querying ProjectXia Verified Engineering Vault...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-gray-950/80 border border-slate-800 p-8 space-y-4 text-slate-300 font-mono">
            <h3 className="text-xl text-white font-display font-bold">No engineering projects found in this department.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Every project on ProjectXia is an authentic, original creation. Be the first innovator to publish your verified project here!
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Original Project Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const isOwnListing = isUserOwnProject(project);

              return (
                <motion.div
                  key={project._id || project.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className={`rounded-3xl bg-white/[0.02] border overflow-hidden backdrop-blur-2xl flex flex-col justify-between shadow-2xl group transition-all duration-300 ${
                    isOwnListing
                      ? 'border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                      : 'border-white/10 hover:border-[#00ffaa]/50 hover:shadow-[0_0_30px_rgba(0,255,170,0.2)]'
                  }`}
                >
                  <div>
                    {/* Thumbnail & Video Trigger */}
                    <div className="relative aspect-video overflow-hidden bg-black/40">
                      <img
                        src={project.screenshots?.[0] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Author Ownership Badge */}
                      {isOwnListing && (
                        <div className="absolute top-3 left-3 bg-purple-600 text-white font-display font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-lg border border-purple-400/40 flex items-center gap-1 z-10">
                          <span>👑 Your Sell Order</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          playClick();
                          setActiveVideoModal(project);
                        }}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#00ffaa] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,255,170,0.4)] transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#00ffaa] bg-black/50 px-2.5 py-1 rounded-full border border-[#00ffaa]/30 font-bold truncate max-w-[200px]">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-base text-white line-clamp-2 leading-snug group-hover:text-[#00ffaa] transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-sans">
                        {project.tagline || project.description}
                      </p>

                      {/* Tech & Hardware Stack Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {project.techStack?.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Bar: Negotiable Price + Make Offer / Edit Sell */}
                  <div className="p-5 pt-3 border-t border-white/10 mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 block">Asking Budget:</span>
                        <div className="flex items-center gap-1.5">
                          <p className="font-display font-black text-xl text-[#00ffaa]">
                            ₹{Number(project.price || 0).toLocaleString('en-IN')}
                          </p>
                          {isOwnListing ? (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                              Your Active Sell
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00ffaa]/10 text-[#00ffaa] border border-[#00ffaa]/30">
                              Negotiable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            playClick();
                            setActiveShareProject(project);
                          }}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Share Showcase Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/projects/${project._id || project.id}`}
                          onClick={playClick}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 transition-colors"
                        >
                          View Specs →
                        </Link>
                      </div>
                    </div>

                    {/* Peer-to-Peer Showcase Actions vs Author Management */}
                    <div className="space-y-2 pt-1 font-mono text-xs">
                      {isOwnListing ? (
                        /* AUTHOR CONTROLS: Quick Adjust Sell Price & Manage Specs */
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              playClick();
                              setActiveEditProject(project);
                            }}
                            className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:opacity-95 text-black font-display font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>✏️ Adjust Price / Edit</span>
                          </button>

                          <Link
                            to={`/projects/${project._id || project.id}`}
                            onClick={playClick}
                            className="py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md text-center"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>Manage Listing</span>
                          </Link>
                        </div>
                      ) : (
                        /* BUYER CONTROLS: Propose Deal & Direct Creator Chat */
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              playClick();
                              setActiveDealProject(project);
                            }}
                            className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-black font-display font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                          >
                            <Handshake className="w-3.5 h-3.5 fill-current" />
                            <span>🤝 Propose Deal</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              playClick();
                              if (!isAuthenticated) {
                                openAuthModal('login', 'Please log in or register to chat directly with verified project creators.');
                                return;
                              }
                              navigate('/chat', {
                                state: {
                                  creatorId: project.seller?.id || 'verified_seller',
                                  creatorName: project.seller?.name || 'Verified Innovator',
                                  creatorAvatar: project.seller?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(project.seller?.name || 'Seller')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`,
                                  projectContext: {
                                    projectId: project._id || project.id,
                                    title: project.title,
                                    price: project.price,
                                    category: project.category,
                                  },
                                },
                              });
                            }}
                            className="py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>💬 Chat / Negotiate</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Sell Order & Price Adjuster Modal */}
      {activeEditProject && (
        <EditSellOrderModal
          isOpen={!!activeEditProject}
          project={activeEditProject}
          onClose={() => setActiveEditProject(null)}
          onProjectUpdated={(updatedProject) => {
            setProjects((prev) =>
              prev.map((p) =>
                (p._id || p.id) === (updatedProject._id || updatedProject.id) ? updatedProject : p
              )
            );
          }}
        />
      )}

      {/* Deal Offer Negotiation Modal (Direct human-to-human P2P) */}
      {activeDealProject && (
        <DealOfferModal
          isOpen={!!activeDealProject}
          project={activeDealProject}
          onClose={() => setActiveDealProject(null)}
          onOfferSubmitted={(offerData) => {
            navigate('/chat', {
              state: {
                creatorId: activeDealProject.seller?.id || 'verified_seller',
                creatorName: activeDealProject.seller?.name || 'Verified Innovator',
                creatorAvatar: activeDealProject.seller?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeDealProject.seller?.name || 'Seller')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`,
                projectContext: {
                  projectId: activeDealProject._id || activeDealProject.id,
                  title: activeDealProject.title,
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

      {/* Video Modal Trigger */}
      {activeVideoModal && (
        <VideoPlayerModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          videoUrl={activeVideoModal.demoVideo}
          title={activeVideoModal.title}
          category={activeVideoModal.category}
          trustScore={activeVideoModal.trustScore}
        />
      )}

      {/* Share & Link Modal */}
      {activeShareProject && (
        <ShareProjectModal
          isOpen={!!activeShareProject}
          onClose={() => setActiveShareProject(null)}
          project={activeShareProject}
        />
      )}
    </div>
  );
};

export default MarketplacePage;
