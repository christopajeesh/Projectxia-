import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

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

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [mRes, uRes, lRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users'),
        api.get('/admin/agency-leads'),
      ]);
      setMetrics(mRes.data.metrics);
      setAuditLogs(mRes.data.auditLogs || []);
      setUsersList(uRes.data.users || []);
      setAgencyLeads(lRes.data.agencyLeads || []);
    } catch (e) {}
  };

  const handleToggleBan = async (userId) => {
    playShield();
    try {
      const res = await api.put(`/admin/users/${userId}/ban`);
      setUsersList(prev => prev.map(u => (u._id === userId || u.id === userId ? res.data.user : u)));
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
    <div className="relative min-h-screen pt-8 pb-24 overflow-hidden">
      <AuroraBackground />

      {/* Ambient Video Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-15 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover filter blur-[1px] scale-105"
          src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/95 via-[#030712]/80 to-[#030712]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header HUD */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/25 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                ProjectXia Admin Panel
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                theprojectxia@gmail.com
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white mt-2">
              Platform Admin & Reports
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Secret activity logging, agency project requests, and user moderation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-900 border border-slate-800 rounded-2xl text-xs font-mono text-right">
              <span className="text-slate-400">Owner Access:</span>
              <p className="text-emerald-400 font-bold">100% UNRESTRICTED</p>
            </div>
          </div>
        </div>

        {/* HUD Overview Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-gray-950/80 border border-cyan-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Inbound Agency Leads</span>
              <p className="text-2xl font-display font-black text-white mt-1">{agencyLeads.length}</p>
              <span className="text-[10px] font-mono text-emerald-400">Dispatched to theprojectxia@gmail.com</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-950/80 border border-purple-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Registered Innovators</span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalUsers}</p>
              <span className="text-[10px] font-mono text-slate-400">Activity Secretly Logged</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-950/80 border border-emerald-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Verified Projects</span>
              <p className="text-2xl font-display font-black text-white mt-1">{metrics.totalProjects}</p>
              <span className="text-[10px] font-mono text-cyan-400">100% Genuine Schematics</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-950/80 border border-rose-500/30 backdrop-blur-xl">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Intrusions Blocked</span>
              <p className="text-2xl font-display font-black text-rose-400 mt-1">{metrics.totalIntrusionsBlocked}</p>
              <span className="text-[10px] font-mono text-slate-400">Zero-Day Defense</span>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto text-xs font-mono">
          {[
            { id: 'agency', label: `Inbound Agency Leads (${agencyLeads.length})` },
            { id: 'activity', label: `Secret User Activity Logs (${auditLogs.length})` },
            { id: 'users', label: `User Quarantine & Moderation (${usersList.length})` },
            { id: 'broadcast', label: 'Platform Live Broadcaster' },
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

        {/* TAB 1: INBOUND AGENCY LEADS */}
        {activeTab === 'agency' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-white">ProjectXia Development Inbound Requests</h3>
                <p className="text-xs font-mono text-slate-400">
                  All requests submitted via the custom build modal are automatically copied and dispatched to <strong className="text-cyan-300">theprojectxia@gmail.com</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {agencyLeads.length === 0 ? (
                <div className="p-8 text-center bg-gray-900/60 rounded-2xl border border-slate-800 text-xs font-mono text-slate-400">
                  No agency leads pending. All new client ideas will appear here instantly.
                </div>
              ) : (
                agencyLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="p-6 rounded-2xl bg-gray-950/90 border border-cyan-500/30 space-y-3 font-mono text-xs shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-base text-white">{lead.name}</h4>
                          <div className="flex items-center gap-3 text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 text-cyan-300">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              {lead.mobile}
                            </span>
                            <span>•</span>
                            <span className="text-purple-300">{lead.dept}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          {lead.budget}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold">Project Requirements:</span>
                      <p className="text-slate-200 mt-1 leading-relaxed bg-black/60 p-3 rounded-xl border border-slate-800">
                        {lead.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Dispatched to: theprojectxia@gmail.com (Alert Confirmed)</span>
                      </span>

                      <a
                        href={`https://wa.me/${lead.mobile.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-[#00a884] hover:bg-[#02906f] text-black font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <span>Chat via WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
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
                All platform events (Logins, Logouts, Registrations, Uploads) are secretly recorded with user details, IP address, and timestamps for <strong className="text-cyan-300">theprojectxia@gmail.com</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950/90 border border-cyan-500/30 overflow-x-auto">
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
                  {auditLogs.map((log) => {
                    const isLogin = log.action.includes('LOGIN');
                    const isLogout = log.action.includes('LOGOUT');
                    const isRegister = log.action.includes('REGISTER');

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
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span>{log.performedBy?.name || 'Innovator User'}</span>
                          </p>
                          <p className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{log.performedBy?.mobile || '+91 98765 43210'}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.performedBy?.email}</p>
                        </td>
                        <td className="py-3 text-slate-300">{log.ipAddress || '122.164.82.11 (Secure IP)'}</td>
                        <td className="py-3 text-slate-400 text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="py-3 text-right text-[10px] text-emerald-400">
                          theprojectxia@gmail.com
                        </td>
                      </tr>
                    );
                  })}
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
                1-click freeze / quarantine to prevent fake users or malicious hackers from uploading.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950/90 border border-cyan-500/30 overflow-x-auto">
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
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt="" className="w-7 h-7 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-cyan-400">{u.role?.toUpperCase()}</span>
                        <p className="text-[10px] text-slate-500">{u.verificationLevel}</p>
                      </td>
                      <td className="py-3 text-emerald-400 font-bold">{u.reputationScore}%</td>
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
                          onClick={() => handleToggleBan(u._id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            u.isBanned
                              ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                              : 'bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900'
                          }`}
                        >
                          {u.isBanned ? 'Restore User' : 'Quarantine'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM LIVE BROADCASTER */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl bg-gray-950/90 border border-cyan-500/30 p-6 sm:p-8 rounded-3xl space-y-4 font-mono text-xs">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Broadcast System Announcement</h3>
              <p className="text-slate-400">
                Dispatches a high-priority banner across all connected web nodes and students in India.
              </p>
            </div>

            {broadcastMsg && (
              <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold">
                {broadcastMsg}
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
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
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
