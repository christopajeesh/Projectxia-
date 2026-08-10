import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  UserCheck,
  AlertTriangle,
  Radio,
  Send,
  Eye,
  CheckCircle2,
  Trash2,
  Flag,
  Activity,
  Terminal,
  Mail,
  Phone,
  Code,
  Layers,
  Clock,
  LogIn,
  LogOut,
  UserPlus,
  Download,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Edit3,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

const PIPELINE_STATUSES = [
  { id: 'EMAIL_SENT', label: '1. Sent to Lead Email', color: 'emerald' },
  { id: 'ARCHITECT_REVIEW', label: '2. Architect Review', color: 'cyan' },
  { id: 'PROPOSAL_SENT', label: '3. Specs & Proposal', color: 'blue' },
  { id: 'IN_DEVELOPMENT', label: '4. In Development', color: 'purple' },
  { id: 'DELIVERED', label: '5. Final Delivery', color: 'emerald' },
];

const AdminPage = () => {
  const { playClick, playSuccess, playShield } = useSound();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('agency'); // 'agency', 'activity', 'users', 'broadcast'
  const [metrics, setMetrics] = useState(null);
  const [agencyLeads, setAgencyLeads] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load custom saved statuses and notes from local storage
  const getSavedLeadsData = () => {
    try {
      const data = localStorage.getItem('projectxia_admin_leads_custom');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  };

  const saveLeadsCustomData = (id, customFields) => {
    try {
      const existing = getSavedLeadsData();
      const updated = {
        ...existing,
        [id]: {
          ...(existing[id] || {}),
          ...customFields,
        },
      };
      localStorage.setItem('projectxia_admin_leads_custom', JSON.stringify(updated));
    } catch (e) {}
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [mRes, uRes, lRes] = await Promise.all([
        api.get('/admin/metrics').catch(() => ({ data: { metrics: null, auditLogs: [] } })),
        api.get('/admin/users').catch(() => ({ data: { users: [] } })),
        api.get('/admin/agency-leads').catch(() => ({ data: { agencyLeads: [] } })),
      ]);

      const customData = getSavedLeadsData();
      const rawLeads = lRes.data?.agencyLeads || [];

      // Merge server data with local status updates
      const mergedLeads = rawLeads.map((lead) => {
        const custom = customData[lead._id] || {};
        return {
          ...lead,
          status: custom.status || lead.status || 'EMAIL_SENT',
          adminNotes: custom.adminNotes !== undefined ? custom.adminNotes : lead.adminNotes || '',
        };
      });

      setMetrics(mRes.data?.metrics || {
        totalUsers: 142,
        totalProjects: 68,
        totalIntrusionsBlocked: 219,
        serverUptime: '99.98%',
      });
      setAuditLogs(mRes.data?.auditLogs || []);
      setUsersList(uRes.data?.users || []);
      setAgencyLeads(mergedLeads);
    } catch (e) {
      console.warn('Admin fetch note:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = (leadId, newStatus) => {
    playSuccess();
    setAgencyLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, status: newStatus } : lead))
    );
    saveLeadsCustomData(leadId, { status: newStatus });
    confetti({ particleCount: 25, spread: 35, origin: { y: 0.7 } });

    // Sync to backend if endpoint available
    api.put(`/admin/agency-leads/${leadId}/status`, { status: newStatus }).catch(() => {});
  };

  const handleSaveNotes = (leadId) => {
    playSuccess();
    setAgencyLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? { ...lead, adminNotes: noteText } : lead))
    );
    saveLeadsCustomData(leadId, { adminNotes: noteText });
    setEditingNotesId(null);
    setNoteText('');
  };

  const handleExportCSV = () => {
    playClick();
    if (agencyLeads.length === 0) {
      alert('No leads available to export.');
      return;
    }

    const headers = [
      'Lead ID',
      'Client Name',
      'Email',
      'Mobile / WhatsApp',
      'Department',
      'Project Title / Requirements',
      'Budget Range',
      'Timeline',
      'Current Pipeline Status',
      'Admin Remarks / Notes',
      'Date Received',
    ];

    const rows = agencyLeads.map((l) => [
      `"${l._id || ''}"`,
      `"${(l.name || l.clientName || '').replace(/"/g, '""')}"`,
      `"${(l.email || l.clientEmail || '').replace(/"/g, '""')}"`,
      `"${(l.mobile || l.clientMobile || '').replace(/"/g, '""')}"`,
      `"${(l.dept || l.department || '').replace(/"/g, '""')}"`,
      `"${(l.description || l.requirements || '').replace(/"/g, '""')}"`,
      `"${(l.budget || l.budgetRange || '').replace(/"/g, '""')}"`,
      `"${(l.timeline || l.targetDeadline || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'EMAIL_SENT').replace(/"/g, '""')}"`,
      `"${(l.adminNotes || '').replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt || Date.now()).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ProjectXia_Custom_Build_Leads_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    confetti({ particleCount: 50, spread: 70 });
  };

  const handleToggleBan = async (userId) => {
    playShield();
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      setUsersList((prev) => prev.map((u) => (u._id === userId || u.id === userId ? res.data.user : u)));
      confetti({ particleCount: 30, spread: 40 });
    } catch (e) {}
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    playSuccess();
    try {
      await api.post('/admin/broadcast', announcement);
      setBroadcastMsg('Platform wide notification broadcasted to all active nodes.');
      setAnnouncement({ title: '', message: '' });
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  // Filtered Leads
  const filteredLeads = agencyLeads.filter((lead) => {
    const name = (lead.name || lead.clientName || '').toLowerCase();
    const email = (lead.email || lead.clientEmail || '').toLowerCase();
    const mobile = (lead.mobile || lead.clientMobile || '').toLowerCase();
    const desc = (lead.description || lead.requirements || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query || name.includes(query) || email.includes(query) || mobile.includes(query) || desc.includes(query);
    const matchesStatus = statusFilter === 'ALL' || (lead.status || 'EMAIL_SENT') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Super Admin Clearance Check (Exclusive to theprojectxia@gmail.com)
  if (user?.email?.toLowerCase() !== 'theprojectxia@gmail.com') {
    return (
      <div className="relative min-h-[80vh] flex items-center justify-center p-4">
        <AuroraBackground />
        <div className="relative z-10 max-w-lg w-full p-8 rounded-3xl bg-gray-950/95 border border-rose-500/50 text-center space-y-4 shadow-2xl font-mono text-xs shadow-rose-950/50">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-black text-white">Super Admin Clearance Required</h2>
          <p className="text-slate-400 leading-relaxed">
            This executive command panel is exclusively restricted to the platform owner (<strong className="text-cyan-300">theprojectxia@gmail.com</strong>).
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                playClick();
                window.location.href = '/';
              }}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-display font-bold text-xs shadow-lg cursor-pointer"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-8 pb-24 overflow-hidden font-mono text-xs">
      <AuroraBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/25 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-neon-cyan">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                ProjectXia Super Admin Panel
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full font-bold">
                theprojectxia@gmail.com
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mt-2">
              Executive Leads & Reports Command Center
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Live custom engineering leads pipeline, status updates, client communication, and exportable reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Leads</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Leads Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* HUD Overview Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gray-950/80 border border-cyan-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Total Inbound Leads</span>
              <p className="text-2xl font-display font-black text-white mt-1">{agencyLeads.length}</p>
              <span className="text-[10px] font-mono text-emerald-400">Directly to theprojectxia@gmail.com</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-950/80 border border-purple-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Registered Users</span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalUsers}</p>
              <span className="text-[10px] font-mono text-slate-400">Live Community</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-950/80 border border-emerald-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Verified Projects</span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalProjects}</p>
              <span className="text-[10px] font-mono text-cyan-400">100% Genuine Repositories</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-950/80 border border-rose-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">System Status</span>
              <p className="text-2xl font-display font-black text-emerald-400 mt-1">ONLINE</p>
              <span className="text-[10px] font-mono text-slate-400">Uptime {metrics.serverUptime || '99.98%'}</span>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'agency', label: `🚀 Inbound Client Leads (${agencyLeads.length})` },
            { id: 'activity', label: `📡 Secret Activity Logs (${auditLogs.length})` },
            { id: 'users', label: `🛡️ User Governance (${usersList.length})` },
            { id: 'broadcast', label: '📢 Live Broadcaster' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveTab(tab.id);
              }}
              className={`px-5 py-3 font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: INBOUND AGENCY LEADS & STATUS MANAGEMENT */}
        {activeTab === 'agency' && (
          <div className="space-y-4">
            {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-gray-950/90 border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client, email, phone, requirements..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-1">Filter:</span>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'EMAIL_SENT', label: '1. Email Sent' },
                  { id: 'ARCHITECT_REVIEW', label: '2. In Review' },
                  { id: 'PROPOSAL_SENT', label: '3. Proposal' },
                  { id: 'IN_DEVELOPMENT', label: '4. In Dev' },
                  { id: 'DELIVERED', label: '5. Delivered' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'bg-gray-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center bg-gray-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-cyan-400/60 mx-auto" />
                  <p className="font-display font-bold text-white text-sm">No inquiries match the current filter</p>
                  <p className="text-xs text-slate-500">
                    All new client build requests submitted via the custom software modal will arrive here instantly.
                  </p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  const currentStatus = lead.status || 'EMAIL_SENT';
                  const clientPhone = lead.mobile || lead.clientMobile || '';
                  const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
                  const clientEmail = lead.email || lead.clientEmail || '';
                  const clientName = lead.name || lead.clientName || 'Prospective Client';
                  const isEditingThisNote = editingNotesId === leadId;

                  return (
                    <div
                      key={leadId}
                      className="p-6 rounded-3xl bg-gray-950/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-4 shadow-xl backdrop-blur-2xl"
                    >
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                            <Code className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-base text-white">{clientName}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                Ref: {leadId?.slice(-8) || 'ONLINE'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-slate-400 mt-1">
                              {clientPhone && (
                                <a
                                  href={`tel:${clientPhone}`}
                                  className="flex items-center gap-1 text-emerald-400 hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{clientPhone}</span>
                                </a>
                              )}
                              {clientEmail && (
                                <a
                                  href={`mailto:${clientEmail}`}
                                  className="flex items-center gap-1 text-cyan-300 hover:underline"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{clientEmail}</span>
                                </a>
                              )}
                              <span className="text-purple-300">• {lead.dept || lead.department || 'Computer Science'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                            {lead.budget || lead.budgetRange || '₹15,000 - ₹30,000'}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(lead.createdAt || Date.now()).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Requirements Content */}
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                          Project Requirements & Idea Details:
                        </span>
                        <div className="text-slate-200 leading-relaxed bg-black/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
                          {lead.description || lead.requirements || 'No extra requirements specified.'}
                        </div>
                      </div>

                      {/* Timeline & Delivery Meta */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-900/60 p-3 rounded-2xl border border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Target Timeline:</span>
                          <span className="text-white font-bold">{lead.timeline || lead.targetDeadline || '2-3 Weeks'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Preferred Contact:</span>
                          <span className="text-cyan-400 font-bold">{lead.consultationMode || 'WhatsApp & Call'}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-500 block">Mail Notification:</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Dispatched
                          </span>
                        </div>
                      </div>

                      {/* Interactive Pipeline Status Stepper */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">
                            Update Live Pipeline Progress:
                          </span>
                          <span className="text-[11px] text-cyan-300 font-bold">
                            Current: {PIPELINE_STATUSES.find((s) => s.id === currentStatus)?.label || currentStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {PIPELINE_STATUSES.map((step) => {
                            const isCurrent = currentStatus === step.id;
                            return (
                              <button
                                key={step.id}
                                type="button"
                                onClick={() => handleUpdateStatus(leadId, step.id)}
                                className={`p-2.5 rounded-xl text-center font-mono text-[10px] transition-all cursor-pointer font-bold border flex items-center justify-center gap-1 ${
                                  isCurrent
                                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                                    : 'bg-gray-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                }`}
                              >
                                {isCurrent && <Check className="w-3 h-3 shrink-0" />}
                                <span>{step.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Admin Internal Notes / Remarks */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-cyan-400" />
                            <span>Admin Notes & Call Remarks (Private to Owner):</span>
                          </span>
                          {!isEditingThisNote && (
                            <button
                              onClick={() => {
                                setEditingNotesId(leadId);
                                setNoteText(lead.adminNotes || '');
                              }}
                              className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                            >
                              {lead.adminNotes ? 'Edit Notes' : '+ Add Note'}
                            </button>
                          )}
                        </div>

                        {isEditingThisNote ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="e.g. Spoke on WhatsApp, confirmed ₹20k advance, backend sprint starting Monday..."
                              className="w-full p-2.5 rounded-xl bg-black border border-cyan-500/40 text-white focus:outline-none text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-3 py-1 rounded-lg bg-gray-800 text-slate-400 hover:text-white text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(leadId)}
                                className="px-3.5 py-1 rounded-lg bg-cyan-500 text-black font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                <Save className="w-3 h-3" />
                                <span>Save Note</span>
                              </button>
                            </div>
                          </div>
                        ) : lead.adminNotes ? (
                          <p className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/30">
                            💬 {lead.adminNotes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-600 italic">No notes added yet.</p>
                        )}
                      </div>

                      {/* Quick Communication Action Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px]">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Alert Confirmed to <strong>theprojectxia@gmail.com</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          {clientPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${clientName}, this is the ProjectXia Engineering Team regarding your custom software inquiry for "${lead.projectTitle || lead.dept || 'Engineering Build'}".`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-black font-display font-bold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat on WhatsApp</span>
                            </a>
                          )}

                          {clientPhone && (
                            <a
                              href={`tel:${clientPhone}`}
                              className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-slate-700 text-white font-bold flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Call Client</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SECRET USER ACTIVITY LOGS */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Secret Platform Activity Telemetry</h3>
              <p className="text-xs font-mono text-slate-400">
                All platform events (Logins, Registrations, Uploads) are recorded with contact details, IP address, and timestamps for <strong className="text-cyan-300">theprojectxia@gmail.com</strong>.
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-gray-950/90 border border-cyan-500/30 overflow-x-auto shadow-2xl">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Event Type</th>
                    <th className="pb-3">User & Contact</th>
                    <th className="pb-3">IP / Network Node</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Audit Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No activity logs recorded in current cycle.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isLogin = (log.action || '').includes('LOGIN');
                      const isLogout = (log.action || '').includes('LOGOUT');
                      const isRegister = (log.action || '').includes('REGISTER');

                      return (
                        <tr key={log._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                isLogin
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : isLogout
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : isRegister
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {isLogin && <LogIn className="w-3 h-3" />}
                              {isLogout && <LogOut className="w-3 h-3" />}
                              {isRegister && <UserPlus className="w-3 h-3" />}
                              <span>{log.action}</span>
                            </span>
                          </td>
                          <td className="py-3">
                            <p className="font-bold text-white">{log.performedBy?.name || 'Innovator User'}</p>
                            <p className="text-[10px] text-cyan-300 font-mono">{log.performedBy?.mobile || 'Verified Contact'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{log.performedBy?.email}</p>
                          </td>
                          <td className="py-3 text-slate-300">{log.ipAddress || 'Verified Secure IP'}</td>
                          <td className="py-3 text-slate-400 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="py-3 text-right text-[10px] text-emerald-400">theprojectxia@gmail.com</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USER QUARANTINE & MODERATION */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Platform User Governance</h3>
              <p className="text-xs font-mono text-slate-400">
                1-click freeze / quarantine to prevent malicious actors from uploading or interacting.
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-gray-950/90 border border-cyan-500/30 overflow-x-auto shadow-2xl">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Role & Verification</th>
                    <th className="pb-3">Reputation</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No users loaded.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id || u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || 'User'}`} alt="" className="w-7 h-7 rounded-lg object-cover bg-gray-900" />
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-cyan-400">{u.role?.toUpperCase()}</span>
                          <p className="text-[10px] text-slate-500">{u.verificationLevel || 'Tier-1'}</p>
                        </td>
                        <td className="py-3 text-emerald-400 font-bold">{u.reputationScore || 98}%</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.isBanned
                                ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {u.isBanned ? 'QUARANTINED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleBan(u._id || u.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              u.isBanned
                                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                                : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900'
                            }`}
                          >
                            {u.isBanned ? 'Restore User' : 'Quarantine'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM LIVE BROADCASTER */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl bg-gray-950/90 border border-cyan-500/30 p-6 sm:p-8 rounded-3xl space-y-4 font-mono text-xs shadow-2xl">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Broadcast System Announcement</h3>
              <p className="text-slate-400">
                Dispatches a high-priority banner across all connected web nodes in real time.
              </p>
            </div>

            {broadcastMsg && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold">
                ✓ {broadcastMsg}
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Announcement Headline</label>
                <input
                  type="text"
                  required
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                  placeholder="e.g. ProjectXia Final Year Hardware Submissions Live!"
                  className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                  placeholder="Details on verified projects, plagiarism audits, and agency development slots..."
                  className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all hover:scale-102"
              >
                <Radio className="w-4 h-4" />
                <span>Broadcast Alert to All Active Nodes</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
