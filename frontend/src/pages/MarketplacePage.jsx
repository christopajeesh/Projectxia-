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
} from 'lucide-react';
import VideoPlayerModal from '../components/ui/VideoPlayerModal';
import ArchitecturePeekModal from '../components/ui/ArchitecturePeekModal';
import ShareProjectModal from '../components/ui/ShareProjectModal';
import DealOfferModal from '../components/ui/DealOfferModal';
import AuroraBackground from '../components/ui/AuroraBackground';
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

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [activePeekProject, setActivePeekProject] = useState(null);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [deliveryType, setDeliveryType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(25000);
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

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

  useEffect(() => {
    fetchMarketplaceProjects();
    window.addEventListener('storage', fetchMarketplaceProjects);
    return () => {
      window.removeEventListener('storage', fetchMarketplaceProjects);
    };
  }, [selectedCategory, sortBy, verifiedOnly, deliveryType]);

  const fetchMarketplaceProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Departments') {
        params.append('category', selectedCategory);
      }
      if (sortBy) params.append('sort', sortBy);
      if (verifiedOnly) params.append('verifiedOnly', 'true');
      if (maxPrice) params.append('maxPrice', maxPrice);

      const res = await api.get(`/projects?${params.toString()}`).catch(() => ({ data: { projects: [] } }));
      const serverList = res.data?.projects || [];
      const localList = JSON.parse(localStorage.getItem('projectxia_uploaded_projects') || '[]');
      const deletedList = JSON.parse(localStorage.getItem('projectxia_admin_deleted_projects') || '[]');

      // Merge local and server lists
      const combinedMap = new Map();
      localList.forEach((p) => {
        const id = p._id || p.id;
        if (id && !deletedList.includes(id)) {
          combinedMap.set(id, p);
        }
      });
      serverList.forEach((p) => {
        const id = p._id || p.id;
        if (id && !deletedList.includes(id)) {
          if (!combinedMap.has(id)) {
            combinedMap.set(id, p);
          }
        }
      });

      let fetchedList = Array.from(combinedMap.values());
      if (deliveryType !== 'All') {
        fetchedList = fetchedList.filter((p) => p.projectType === deliveryType);
      }
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'All Departments') {
        fetchedList = fetchedList.filter((p) => (p.category || '').toLowerCase().includes(selectedCategory.toLowerCase().slice(0, 5)));
      }

      setProjects(fetchedList);
    } catch (e) {
      console.warn('[Marketplace Fetch Warning]:', e.message);
      setProjects([]);
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
      <AuroraBackground theme="cyan" className="opacity-75" />

      {/* Ambient Visual Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter blur-[1px] scale-105"
          src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/30 via-transparent to-[#030712]/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Original Project</span>
            </Link>

            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
              {projects.length} Original Projects
            </span>
          </div>
        </div>

        {/* Plain-English Page Purpose & How It Works Banner for Visitors */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-purple-950/60 border border-cyan-500/30 text-xs text-slate-300 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="font-bold text-white flex items-center gap-2 text-sm">
                <span className="p-1 rounded bg-cyan-500/20 text-cyan-300">💡</span>
                <span>What is this page for? (Marketplace Guide)</span>
              </p>
              <p className="text-slate-300 text-xs">
                This page lists <strong>complete, working engineering projects</strong> built by students and researchers. Every project includes <strong>working video demos, verified source code, architecture schematics, and direct chat with the creator</strong> for custom adjustments.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-500/30 text-cyan-300">✓ Video Demos</span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-purple-500/30 text-purple-300">✓ Full Source Code</span>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-500/30 text-emerald-300">✓ Direct Creator Chat</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Dashboard */}
        <div className="mb-8 p-6 rounded-3xl bg-gray-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl space-y-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by keyword, IEEE topic, hardware board (ESP32, STM32, ROS2), or framework (PyTorch, React)..."
                className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-2xl pl-10 pr-4 py-3 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
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

          {/* Department Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  playClick();
                  setSelectedCategory(dept === 'All Departments' ? 'All' : dept);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                  (selectedCategory === dept || (dept === 'All Departments' && selectedCategory === 'All'))
                    ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20 border border-purple-400'
                    : 'bg-gray-900/90 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Filters Bar: Sort & Max Price */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-4 text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-gray-900 text-cyan-400 focus:ring-0"
                />
                <span className="text-white font-bold">100% Plagiarism & Code-Audited Only</span>
              </label>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span>Max Budget: ₹{maxPrice.toLocaleString('en-IN')}</span>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onMouseUp={() => fetchMarketplaceProjects()}
                className="w-28 accent-cyan-400"
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
            {projects.map((project) => (
              <motion.div
                key={project._id}
                whileHover={{ y: -6 }}
                className="rounded-3xl bg-gray-950/90 border border-cyan-500/25 overflow-hidden backdrop-blur-xl flex flex-col justify-between shadow-xl shadow-black/80 group transition-all"
              >
                <div>
                  {/* Thumbnail & Video Trigger */}
                  <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img
                      src={project.screenshots?.[0] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <button
                      onClick={() => {
                        playClick();
                        setActiveVideoModal(project);
                      }}
                      className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-cyan-500/85 hover:bg-cyan-400 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-bold truncate max-w-[200px]">
                        {project.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{project.rating || 4.9}</span>
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-base text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {project.tagline || project.description}
                    </p>

                    {/* Tech & Hardware Stack Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.techStack?.slice(0, 4).map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Bar: Negotiable Price + Make Offer + Chat with Seller */}
                <div className="p-5 pt-0 border-t border-slate-900 mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">Asking Budget:</span>
                      <div className="flex items-center gap-1.5">
                        <p className="font-display font-black text-lg text-emerald-400">
                          ₹{Number(project.price || 0).toLocaleString('en-IN')}
                        </p>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Negotiable
                        </span>
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
                        to={`/projects/${project._id}`}
                        onClick={playClick}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 transition-colors"
                      >
                        View Specs →
                      </Link>
                    </div>
                  </div>

                  {/* Peer-to-Peer Showcase Actions */}
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setActivePeekProject(project);
                      }}
                      className="w-full py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>⚡ Peek Architecture & Circuit BOM</span>
                    </button>

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
                                projectId: project._id,
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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
                  projectId: activeDealProject._id,
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

      {/* Architecture & Code Peek Modal */}
      {activePeekProject && (
        <ArchitecturePeekModal
          project={activePeekProject}
          onClose={() => setActivePeekProject(null)}
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
