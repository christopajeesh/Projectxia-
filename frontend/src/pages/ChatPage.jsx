import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  Search,
  CheckCheck,
  Shield,
  Circle,
  FileCode,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Check,
  Play,
  Volume2,
  Image as ImageIcon,
  X,
  Trash2,
  UserCheck,
  Handshake,
} from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const ChatPage = () => {
  const location = useLocation();
  const { playClick, playSuccess } = useSound();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Modals & Panels
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const quickEmojis = ['😊', '👍', '❤️', '🔥', '🚀', '🙏', '💯', '⚡', '👏', '🎉'];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      if (socket) {
        socket.emit('join_conversation', activeConv._id);
        socket.emit('mark_read', { conversationId: activeConv._id, userId: user?._id || user?.id });
      }
      api.put(`/chat/messages/read/${activeConv._id}`).catch(() => {});
    }
  }, [activeConv]);

  // SOCKET LISTENERS (Deduplicated & Realtime Blue Ticks)
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (!msg) return;
      setMessages((prev) => {
        const exists = prev.some((m) => (m._id || m.id) === (msg._id || msg.id));
        if (exists) return prev;
        return [...prev, msg];
      });

      // If viewing this active conversation, mark as read immediately
      if (activeConv && msg.conversationId === activeConv._id) {
        socket.emit('mark_read', { conversationId: activeConv._id, userId: user?._id || user?.id });
      }

      playSuccess();
      setTimeout(scrollToBottom, 100);
    };

    const handleUserTyping = ({ userName, isTyping: typingState }) => {
      setIsTyping(typingState);
      setTypingUser(userName || 'Seller');
    };

    const handleMessagesRead = ({ conversationId }) => {
      setMessages((prev) =>
        prev.map((m) => ({ ...m, isRead: true }))
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activeConv]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUserKey = () => {
    return (user?.email || user?._id || user?.id || 'guest').toLowerCase().trim();
  };

  const fetchConversations = async () => {
    const userKey = getUserKey();
    let cachedConvs = [];

    // Load from local storage cache first for 0ms instant recovery
    try {
      const stored = localStorage.getItem(`px_convs_${userKey}`);
      if (stored) {
        cachedConvs = JSON.parse(stored);
        if (Array.isArray(cachedConvs) && cachedConvs.length > 0) {
          setConversations(cachedConvs);
          if (!activeConv) {
            setActiveConv(cachedConvs[0]);
            fetchMessages(cachedConvs[0]._id);
          }
        }
      }
    } catch (err) {}

    try {
      const res = await api.get('/chat/conversations');
      let apiConvs = res.data.conversations || [];

      // Merge API conversations with cached conversations so past history is preserved
      const convMap = new Map();
      [...apiConvs, ...cachedConvs].forEach((c) => {
        if (c && c._id) convMap.set(String(c._id), c);
      });
      let mergedConvs = Array.from(convMap.values());

      if (location.state?.creatorId || location.state?.conversationId) {
        const targetConvId = location.state.conversationId;
        const creatorId = location.state.creatorId;
        const creatorName = location.state.creatorName || 'Project Seller';
        const creatorEmail = location.state.creatorEmail || '';
        const creatorAvatar = location.state.creatorAvatar || '';

        let existing = mergedConvs.find((c) =>
          (targetConvId && c._id === targetConvId) ||
          (creatorId && c.participants?.some((p) => p.userId === creatorId || (creatorEmail && p.email?.toLowerCase() === creatorEmail.toLowerCase())))
        );

        if (!existing) {
          existing = {
            _id: targetConvId || `conv_${Date.now()}`,
            participants: [
              {
                userId: user?._id || user?.id || 'user_guest',
                email: user?.email || '',
                name: user?.name || 'Verified User',
                avatar: user?.avatar,
                role: 'user',
              },
              {
                userId: creatorId || 'creator',
                email: creatorEmail,
                name: creatorName,
                avatar: creatorAvatar,
                role: 'creator',
              },
            ],
            projectContext: location.state.projectContext,
            lastMessage: {
              text: `Inquiring about ${location.state.projectContext?.title || 'project'}`,
              createdAt: new Date(),
            },
          };
          mergedConvs = [existing, ...mergedConvs];
        }

        setConversations(mergedConvs);
        setActiveConv(existing);
        fetchMessages(existing._id);
      } else {
        setConversations(mergedConvs);
        if (mergedConvs.length > 0 && !activeConv) {
          setActiveConv(mergedConvs[0]);
          fetchMessages(mergedConvs[0]._id);
        }
      }

      localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(mergedConvs));
    } catch (e) {
      console.error('Failed fetching conversations', e);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    const userKey = getUserKey();
    let cachedMsgs = [];

    // Load from local storage cache first for 0ms instant display
    try {
      const cached = localStorage.getItem(`px_msgs_${userKey}_${convId}`);
      if (cached) {
        cachedMsgs = JSON.parse(cached);
        if (Array.isArray(cachedMsgs) && cachedMsgs.length > 0) {
          setMessages(cachedMsgs);
        }
      }
    } catch (err) {}

    try {
      const res = await api.get(`/chat/messages/${convId}`);
      const apiMsgs = res.data.messages || [];

      // Merge API messages with local cached messages
      const msgMap = new Map();
      [...cachedMsgs, ...apiMsgs].forEach((m) => {
        const key = String(m._id || m.id);
        if (key) msgMap.set(key, m);
      });
      const mergedMsgs = Array.from(msgMap.values());

      if (mergedMsgs.length > 0) {
        setMessages(mergedMsgs);
        localStorage.setItem(`px_msgs_${userKey}_${convId}`, JSON.stringify(mergedMsgs));
      }
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.error('Failed fetching messages', e);
    }
  };

  // Sync conversation lastMessage dynamically whenever messages change
  useEffect(() => {
    if (activeConv && messages.length > 0) {
      const userKey = getUserKey();

      // Also update lastMessage in cached conversations
      setConversations((prevConvs) => {
        const updated = prevConvs.map((c) => {
          if (c._id === activeConv._id) {
            return {
              ...c,
              lastMessage: {
                text: messages[messages.length - 1]?.text || c.lastMessage?.text || '',
                createdAt: new Date(),
              },
            };
          }
          return c;
        });
        localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(updated));
        return updated;
      });
    }
  }, [activeConv?._id, messages]);

  // SEND TEXT MESSAGE (With instant optimistic rendering)
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputMsg.trim() && !attachmentFile) || !activeConv || isSending) return;
    playClick();
    setIsSending(true);

    const messageText = inputMsg;
    setInputMsg('');

    const currentUserId = String(user?._id || user?.id || 'user_guest');
    const currentUserEmail = String(user?.email || '').toLowerCase();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    const otherParticipant = activeConv.participants?.find(
      (p) => String(p.userId) !== currentUserId && String(p.email || '').toLowerCase() !== currentUserEmail
    );

    const receiverId = otherParticipant?.userId || location.state?.creatorId || 'creator';
    const receiverName = otherParticipant?.name || location.state?.creatorName || 'Project Seller';
    const receiverEmail = otherParticipant?.email || location.state?.creatorEmail || '';
    const receiverAvatar = otherParticipant?.avatar || location.state?.creatorAvatar || '';

    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConv._id,
      sender: {
        id: currentUserId,
        email: currentUserEmail,
        name: user?.name || 'Verified User',
        avatar: user?.avatar || '',
      },
      receiverId,
      receiverName,
      receiverEmail,
      receiverAvatar,
      text: messageText,
      messageType: attachmentFile ? 'media' : 'text',
      mediaUrl: attachmentFile?.preview || null,
      fileName: attachmentFile?.name || null,
      projectData: activeConv.projectContext,
      isRead: false,
      createdAt: new Date(),
    };

    // 1. Instantly render on screen (0ms delay)
    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    const payload = {
      conversationId: activeConv._id,
      receiverId,
      receiverName,
      receiverEmail,
      receiverAvatar,
      text: messageText,
      messageType: optimisticMsg.messageType,
      mediaUrl: optimisticMsg.mediaUrl,
      fileName: optimisticMsg.fileName,
      projectData: activeConv.projectContext,
    };

    setAttachmentFile(null);
    setShowEmojiPicker(false);

    try {
      const res = await api.post('/chat/messages', payload);
      const newMsg = res.data.message || optimisticMsg;

      // 2. Update temp message with server confirmed message
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? newMsg : m))
      );

      if (res.data.conversation && res.data.conversation._id !== activeConv._id) {
        setActiveConv(res.data.conversation);
      }

      // 3. Emit via real-time WebSocket to recipient
      if (socket) {
        socket.emit('send_message', {
          ...newMsg,
          receiverId,
          receiverEmail,
          senderEmail: currentUserEmail,
        });
      }
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // SEND VOICE NOTE (With instant optimistic rendering)
  const sendVoiceNote = async () => {
    if (!activeConv || isSending) return;
    playClick();
    setIsSending(true);

    const currentUserId = user?._id || user?.id || 'user_001_buyer';
    const tempId = `temp_voice_${Date.now()}`;

    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConv._id,
      sender: {
        id: currentUserId,
        name: user?.name || 'Rohan Sharma',
        avatar: user?.avatar || '',
      },
      receiverId: activeConv.participants?.find((p) => p.userId !== currentUserId)?.userId || 'user_002_creator',
      text: 'Voice note (0:18s)',
      messageType: 'voice',
      audioDuration: 18,
      projectData: activeConv.projectContext,
      isRead: false,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    const payload = {
      conversationId: activeConv._id,
      receiverId: optimisticMsg.receiverId,
      text: optimisticMsg.text,
      messageType: 'voice',
      audioDuration: 18,
      projectData: activeConv.projectContext,
    };

    try {
      const res = await api.post('/chat/messages', payload);
      const newMsg = res.data.message || optimisticMsg;

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? newMsg : m))
      );

      if (socket) {
        socket.emit('send_message', {
          conversationId: newMsg.conversationId || activeConv._id,
          message: newMsg,
        });
      }
      playSuccess();
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.error('Voice send error:', e);
    } finally {
      setIsSending(false);
    }
  };

  // HANDLE FILE ATTACHMENT SELECTION
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachmentFile({ name: file.name, preview: evt.target.result, type: 'image' });
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentFile({ name: file.name, preview: null, type: 'file' });
    }
  };

  const refreshChatHistory = () => {
    playClick();
    if (activeConv) {
      fetchMessages(activeConv._id);
    }
    setShowMenu(false);
  };

  const handleDeleteConversation = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Permanently delete this chat conversation and all history?')) return;
    playClick();
    const userKey = getUserKey();
    try {
      await api.delete(`/chat/conversations/${convId}`);
      localStorage.removeItem(`px_msgs_${userKey}_${convId}`);
      
      setConversations((prev) => {
        const updated = prev.filter((c) => c._id !== convId);
        localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(updated));
        return updated;
      });

      if (activeConv?._id === convId) {
        setActiveConv(null);
        setMessages([]);
      }
      setShowMenu(false);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getPartner = (conv) => {
    if (!conv) return { name: 'Dr. Priya Venkatesh', avatar: '' };
    const myId = user?._id || user?.id || 'user_001_buyer';
    const partner = conv.participants?.find((p) => p.userId !== myId) || conv.participants?.[0];
    return partner || { name: 'Project Creator', avatar: '' };
  };

  const filteredConversations = conversations.filter((c) => {
    const partner = getPartner(c);
    return partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col pt-3 pb-10 font-mono text-xs">
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 flex-1 flex flex-col relative z-10">
        
        {/* WHATSAPP MAIN CONTAINER */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-[#0b141a] border border-[#00a884]/30 backdrop-blur-2xl overflow-hidden shadow-2xl min-h-[660px]">
          
          {/* ============================================================ */}
          {/* LEFT: WHATSAPP CHAT LIST SIDEBAR */}
          {/* ============================================================ */}
          <div className="md:col-span-4 border-r border-[#202c33] flex flex-col bg-[#111b21]">
            
            {/* Sidebar Header */}
            <div className="p-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#202c33]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#00a884] bg-gray-900"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs text-white truncate max-w-[140px]">
                    {user?.name || 'Verified Innovator'}
                  </h3>
                  <span className="text-[10px] text-[#00a884] block font-mono">ProjectXia Direct Chat</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#00a884] bg-[#00a884]/15 px-2.5 py-1 rounded-full border border-[#00a884]/30 font-bold">
                ✓ Encrypted
              </span>
            </div>

            {/* Search Box */}
            <div className="p-3 border-b border-[#202c33]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8696a0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search seller chats..."
                  className="w-full bg-[#202c33] border-none rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/50 p-1.5 space-y-1">
              {filteredConversations.map((conv) => {
                const partner = getPartner(conv);
                const isSelected = activeConv?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      playClick();
                      setActiveConv(conv);
                    }}
                    className={`group p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-[#2a3942] border border-[#00a884]/40 shadow-md'
                        : 'hover:bg-[#202c33]/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={partner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.name || 'Seller')}&backgroundColor=111b21,202c33&textColor=00a884`}
                        alt={partner.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#00a884]/40 bg-gray-900"
                      />
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-xs text-[#e9edef] truncate">{partner.name}</h4>
                        <span className="text-[10px] font-mono text-[#00a884] font-bold">Online</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#8696a0] truncate mt-0.5">
                        {conv.lastMessage?.text || 'Direct inquiry active'}
                      </p>
                      {conv.projectContext && (
                        <span className="inline-block text-[9px] font-mono text-[#00a884] bg-[#00a884]/15 px-2 py-0.5 rounded-md mt-1 font-bold">
                          📦 {conv.projectContext.title?.substring(0, 20)}...
                        </span>
                      )}
                    </div>

                    {/* DELETE CHAT BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all absolute right-2 top-3 cursor-pointer"
                      title="Delete Chat Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: ACTIVE CHAT ROOM */}
          {/* ============================================================ */}
          <div className="md:col-span-8 flex flex-col bg-[#0b141a] relative">
            {activeConv ? (
              <>
                {/* CHAT HEADER */}
                <div className="p-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#202c33] relative z-20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={getPartner(activeConv).avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(getPartner(activeConv).name)}`}
                        alt={getPartner(activeConv).name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#00a884]"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#e9edef]">
                        {getPartner(activeConv).name}
                      </h3>
                      <p className="text-[10px] font-mono text-[#00a884] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                        <span>{isTyping ? `${typingUser} is typing...` : 'Online • Project Creator'}</span>
                      </p>
                    </div>
                  </div>

                  {/* MENU BUTTON */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-white transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showMenu && (
                        <div className="absolute right-0 top-11 w-48 bg-[#233138] border border-[#374248] rounded-2xl shadow-2xl py-2 z-50 text-xs font-mono text-[#e9edef] space-y-1">
                          <button
                            onClick={refreshChatHistory}
                            className="w-full px-4 py-2 text-left hover:bg-[#111b21] flex items-center gap-2 text-[#00a884] cursor-pointer font-bold"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Sync Chat History</span>
                          </button>
                          <button
                            onClick={() => handleDeleteConversation(activeConv._id)}
                            className="w-full px-4 py-2 text-left hover:bg-[#111b21] flex items-center gap-2 text-rose-400 cursor-pointer font-bold border-t border-[#374248]/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Chat</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MESSAGES STREAM WITH DOODLE BACKGROUND */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs relative"
                  style={{
                    backgroundImage: 'radial-gradient(#00a884 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.95,
                  }}
                >
                  {/* PINNED PROJECT INQUIRY BANNER */}
                  {activeConv.projectContext && (
                    <div className="p-3.5 rounded-2xl bg-[#1f2c34]/95 border border-[#00a884]/40 flex items-center justify-between text-xs shadow-lg backdrop-blur-md">
                      <div>
                        <span className="text-[10px] text-[#00a884] uppercase font-bold">Inquiring About Project:</span>
                        <p className="font-bold text-[#e9edef] font-display text-sm">{activeConv.projectContext.title}</p>
                      </div>
                      <span className="text-[#00a884] font-bold font-display text-base bg-[#00a884]/15 px-3 py-1 rounded-xl border border-[#00a884]/30">
                        ₹{Number(activeConv.projectContext.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* CHAT MESSAGES */}
                  {messages.map((msg) => {
                    const currentUid = String(user?._id || user?.id || 'user_001_buyer').trim();
                    const msgSenderId = String(msg.sender?.id || msg.sender?._id || '').trim();
                    const isMe = msgSenderId === currentUid || (user?.email && msg.sender?.email === user.email);

                    return (
                      <div
                        key={msg._id || msg.id || Math.random()}
                        className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl shadow-md ${
                            isMe
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                              : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#233138]'
                          }`}
                        >
                          {/* MEDIA / IMAGE ATTACHMENT */}
                          {msg.messageType === 'media' && msg.mediaUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden border border-black/30">
                              <img src={msg.mediaUrl} alt="Attachment" className="max-h-60 w-full object-cover" />
                            </div>
                          )}

                          {/* NEGOTIATION DEAL OFFER CARD */}
                          {msg.messageType === 'deal_offer' || (msg.text && msg.text.includes('PROPOSED NEGOTIATION DEAL')) ? (
                            <div className="space-y-2.5 p-3.5 bg-[#111b21]/90 rounded-2xl border border-[#00a884]/50 shadow-inner my-1">
                              <div className="flex items-center gap-2 text-[#00a884] font-bold text-xs">
                                <Handshake className="w-4.5 h-4.5 shrink-0 text-[#00a884]" />
                                <span className="uppercase tracking-wider">PROPOSED NEGOTIATION DEAL</span>
                              </div>
                              <p className="text-xs text-white leading-relaxed font-mono whitespace-pre-wrap bg-[#1a2730] p-2.5 rounded-xl border border-[#263742]">
                                {msg.text}
                              </p>
                              {!isMe && (
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playSuccess();
                                      alert('🎉 Deal Offer Accepted! The agreed negotiated rate will be applied at checkout.');
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-[#00a884] text-black font-bold text-[11px] text-center hover:bg-[#02906f] transition-all cursor-pointer shadow-md"
                                  >
                                    Accept Deal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playClick();
                                      setInputMsg(`Counter Offer: I can offer ₹${Math.round((msg.projectData?.offerPrice || 2500) * 1.1)} for this project.`);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-[#202c33] text-slate-200 font-bold text-[11px] hover:text-white transition-all cursor-pointer border border-[#374248]"
                                  >
                                    Counter
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : msg.messageType === 'voice' ? (
                            <div className="flex items-center gap-3 py-1">
                              <button
                                type="button"
                                onClick={() => playSuccess()}
                                className="w-9 h-9 rounded-full bg-[#00a884] text-black flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                              >
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </button>
                              <div className="flex-1 min-w-[140px]">
                                <div className="h-1.5 bg-[#8696a0]/30 rounded-full overflow-hidden">
                                  <div className="w-3/4 h-full bg-[#00a884]" />
                                </div>
                                <span className="text-[10px] text-[#8696a0] mt-1 block">Voice Note (0:18s)</span>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap text-xs">{msg.text}</p>
                          )}

                          {/* WHATSAPP READ RECEIPTS & TIMESTAMP */}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8696a0]">
                            <span>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              msg.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" title="Read by recipient (Blue Ticks)" />
                              ) : (
                                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" title="Delivered (Grey Ticks)" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* REALTIME TYPING INDICATOR */}
                  {isTyping && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-[#202c33]/80 w-fit text-[11px] text-[#00a884] font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#00a884]" />
                      <span>{typingUser} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ATTACHMENT PREVIEW STRIP */}
                {attachmentFile && (
                  <div className="px-4 py-2 bg-[#111b21] border-t border-[#202c33] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00a884]" />
                      <span className="text-white truncate max-w-xs">{attachmentFile.name}</span>
                    </div>
                    <button
                      onClick={() => setAttachmentFile(null)}
                      className="p-1 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/40"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* QUICK EMOJI BAR */}
                {showEmojiPicker && (
                  <div className="px-4 py-2 bg-[#111b21] border-t border-[#202c33] flex items-center gap-2 overflow-x-auto">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInputMsg((prev) => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#202c33] text-lg transition-transform hover:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* WHATSAPP INPUT BAR */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#202c33] flex items-center gap-2 border-t border-[#202c33] relative z-20"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                    title="Quick Emojis"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.zip,.py,.cpp"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                    title="Attach Photo or Document"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={sendVoiceNote}
                    disabled={isSending}
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                    title="Send Voice Note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputMsg}
                    disabled={isSending}
                    onChange={(e) => {
                      setInputMsg(e.target.value);
                      if (socket && activeConv) {
                        socket.emit('typing_start', {
                          conversationId: activeConv._id,
                          userName: user?.name,
                        });
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(
                          () => socket.emit('typing_stop', { conversationId: activeConv._id }),
                          2000
                        );
                      }
                    }}
                    placeholder="Type a direct message to seller..."
                    className="flex-1 bg-[#2a3942] border-none rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  />

                  <button
                    type="submit"
                    disabled={isSending || (!inputMsg.trim() && !attachmentFile)}
                    className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8696a0] font-mono text-xs space-y-3">
                <Shield className="w-12 h-12 text-[#00a884] animate-pulse" />
                <p>Select a project seller on the left to start WhatsApp real-time messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;
