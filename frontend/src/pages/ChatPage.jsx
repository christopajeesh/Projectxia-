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
  Pause,
  Volume2,
  Image as ImageIcon,
  X,
  Trash2,
  UserCheck,
  Handshake,
  MessageSquarePlus,
  Filter,
  Phone,
  Video,
} from 'lucide-react';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

// ============================================================
// WHATSAPP VOICE NOTE PLAYER COMPONENT (EXACT WHATSAPP WEB STYLE)
// ============================================================
const WhatsAppVoicePlayer = ({ mediaUrl, audioDuration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioDuration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!mediaUrl) return;
    const audio = new Audio(mediaUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [mediaUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // WhatsApp style amplitude bars
  const barCount = 20;
  const amplitudes = [35, 75, 40, 95, 60, 100, 45, 80, 55, 90, 35, 85, 65, 45, 90, 70, 50, 85, 40, 65];

  return (
    <div className="flex items-center gap-3 py-1 min-w-[210px] sm:min-w-[240px]">
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#00a884] text-black flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-transform hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div
          onClick={handleSeek}
          className="flex items-center gap-0.5 h-6 cursor-pointer py-1"
          title="Click to seek audio"
        >
          {amplitudes.map((heightPercent, idx) => {
            const barProgress = (idx / barCount) * 100;
            const isPlayed = barProgress <= progressPercent;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-colors ${
                  isPlayed ? 'bg-[#00a884]' : 'bg-[#8696a0]/40'
                }`}
                style={{ height: `${Math.max(20, heightPercent)}%` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#8696a0] font-mono">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration || audioDuration || 0)}</span>
          <span className="text-[#00a884] font-bold">🎤 Voice Note</span>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_SELLER_CONVERSATIONS = [
  {
    _id: 'conv_default_1',
    participants: [
      { userId: 'user_001_buyer', name: 'Verified Innovator', email: 'buyer@projectxia.com' },
      {
        userId: 'creator_priya',
        name: 'Dr. Priya Venkatesh',
        email: 'priya@projectxia.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        role: 'creator',
      },
    ],
    lastMessage: { text: 'Ntha mone 😄', createdAt: new Date(Date.now() - 3600000) },
    projectContext: { title: 'IoT Smart Hydroponics System', price: 4999 },
  },
  {
    _id: 'conv_default_2',
    participants: [
      { userId: 'user_001_buyer', name: 'Verified Innovator', email: 'buyer@projectxia.com' },
      {
        userId: 'creator_sukhno',
        name: 'Sukhno',
        email: 'sukhno@projectxia.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'creator',
      },
    ],
    lastMessage: { text: 'heheheeheee', createdAt: new Date(Date.now() - 7200000) },
    projectContext: { title: 'AI WAF & Scam Guard Shield', price: 7999 },
  },
  {
    _id: 'conv_default_3',
    participants: [
      { userId: 'user_001_buyer', name: 'Verified Innovator', email: 'buyer@projectxia.com' },
      {
        userId: 'creator_pinal',
        name: 'Pinalahh',
        email: 'pinal@projectxia.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'creator',
      },
    ],
    lastMessage: { text: 'Source code and video walkthrough sent!', createdAt: new Date(Date.now() - 86400000) },
    projectContext: { title: 'zk-SNARK Web3 Privacy Protocol', price: 12500 },
  },
];

const DEFAULT_MESSAGES_MAP = {
  conv_default_1: [
    {
      _id: 'msg_def_101',
      conversationId: 'conv_default_1',
      sender: { id: 'creator_priya', name: 'Dr. Priya Venkatesh', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
      receiverId: 'user_001_buyer',
      text: 'Ntha mone 😄',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: 'msg_def_102',
      conversationId: 'conv_default_1',
      sender: { id: 'creator_priya', name: 'Dr. Priya Venkatesh', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
      receiverId: 'user_001_buyer',
      text: '',
      messageType: 'voice',
      audioDuration: 18,
      isRead: true,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      _id: 'msg_def_103',
      conversationId: 'conv_default_1',
      sender: { id: 'user_001_buyer', name: 'Verified Innovator' },
      receiverId: 'creator_priya',
      text: 'heheheeheee',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 1800000),
    },
  ],
  conv_default_2: [
    {
      _id: 'msg_def_201',
      conversationId: 'conv_default_2',
      sender: { id: 'creator_sukhno', name: 'Sukhno', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      receiverId: 'user_001_buyer',
      text: 'Hey! The AI WAF Security project documentation is fully ready.',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000),
    },
    {
      _id: 'msg_def_202',
      conversationId: 'conv_default_2',
      sender: { id: 'user_001_buyer', name: 'Verified Innovator' },
      receiverId: 'creator_sukhno',
      text: 'Awesome! Does it include the Python Flask backdoor detector module?',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000),
    },
  ],
  conv_default_3: [
    {
      _id: 'msg_def_301',
      conversationId: 'conv_default_3',
      sender: { id: 'creator_pinal', name: 'Pinalahh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      receiverId: 'user_001_buyer',
      text: 'Source code and video walkthrough sent for zk-SNARK Web3 Privacy Protocol!',
      messageType: 'text',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000),
    },
  ],
};

const ChatPage = () => {
  const location = useLocation();
  const { playClick, playSuccess } = useSound();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

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

  // SOCKET LISTENERS
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (!msg) return;
      setMessages((prev) => {
        const exists = prev.some((m) => (m._id || m.id) === (msg._id || msg.id));
        if (exists) return prev;
        return [...prev, msg];
      });

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

  const getPartner = (conv) => {
    const defaultPartner = {
      userId: 'creator_priya',
      name: 'Dr. Priya Venkatesh',
      email: 'priya@projectxia.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'creator',
    };

    if (!conv || !Array.isArray(conv.participants) || conv.participants.length === 0) {
      return defaultPartner;
    }

    const myId = String(user?._id || user?.id || '').toLowerCase().trim();
    const myEmail = String(user?.email || '').toLowerCase().trim();

    let partner = conv.participants.find((p) => {
      if (!p) return false;
      const pId = String(p.userId || p.id || p._id || '').toLowerCase().trim();
      const pEmail = String(p.email || '').toLowerCase().trim();
      if (myId && (pId === myId || pEmail === myId)) return false;
      if (myEmail && (pEmail === myEmail || pId === myEmail)) return false;
      return true;
    });

    if (!partner) {
      partner = conv.participants[1] || conv.participants[0] || defaultPartner;
    }

    const name = partner?.name || partner?.userName || (partner?.email ? partner.email.split('@')[0] : 'Project Seller');
    const avatar = partner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=080e1e,101f4e&textColor=00f0ff`;

    return {
      ...partner,
      name,
      avatar,
    };
  };

  const fetchConversations = async () => {
    const userKey = getUserKey();
    let cachedConvs = [];

    try {
      const stored = localStorage.getItem(`px_convs_${userKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedConvs = parsed;
        }
      }
    } catch (err) {}

    let apiConvs = [];
    try {
      const res = await api.get('/chat/conversations');
      apiConvs = res.data.conversations || [];
    } catch (e) {}

    const convMap = new Map();
    [...DEFAULT_SELLER_CONVERSATIONS, ...apiConvs, ...cachedConvs].forEach((c) => {
      if (c && c._id) {
        if (!c.participants || c.participants.length === 0) {
          c.participants = [
            { userId: user?._id || 'user_001_buyer', name: user?.name || 'Verified Innovator', email: user?.email || '' },
            { userId: 'creator_priya', name: 'Dr. Priya Venkatesh', email: 'priya@projectxia.com' },
          ];
        }
        convMap.set(String(c._id), c);
      }
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
        (creatorId && c.participants?.some((p) => String(p.userId) === String(creatorId) || (creatorEmail && String(p.email).toLowerCase() === creatorEmail.toLowerCase())))
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

    try {
      localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(mergedConvs));
    } catch (err) {}
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    const userKey = getUserKey();

    let cachedMsgs = DEFAULT_MESSAGES_MAP[convId] || [];
    try {
      const cached = localStorage.getItem(`px_msgs_${userKey}_${convId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedMsgs = parsed;
        }
      }
    } catch (err) {}

    try {
      const res = await api.get(`/chat/messages/${convId}`);
      const apiMsgs = res.data.messages || [];

      const msgMap = new Map();
      [...cachedMsgs, ...apiMsgs].forEach((m) => {
        const key = String(m._id || m.id);
        if (key) msgMap.set(key, m);
      });
      const mergedMsgs = Array.from(msgMap.values());

      if (mergedMsgs.length > 0) {
        setMessages(mergedMsgs);
        localStorage.setItem(`px_msgs_${userKey}_${convId}`, JSON.stringify(mergedMsgs));
      } else {
        setMessages(cachedMsgs);
      }
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      setMessages(cachedMsgs);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    if (activeConv && messages.length > 0) {
      const userKey = getUserKey();

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
        try { localStorage.setItem(`px_convs_${userKey}`, JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
    }
  }, [activeConv?._id, messages]);

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

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? newMsg : m))
      );

      if (res.data.conversation && res.data.conversation._id !== activeConv._id) {
        setActiveConv(res.data.conversation);
      }

      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConv._id,
          message: newMsg,
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

  // ============================================================
  // WHATSAPP VOICE RECORDING ENGINE WITH REAL-TIME SPECTRUM
  // ============================================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState([30, 60, 40, 80, 50, 90, 40, 70, 30, 60, 80, 40]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const cleanupAudioContext = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const startRecording = async () => {
    try {
      playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac'].find(
        (t) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)
      ) || '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevels = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const levels = Array.from(dataArray.slice(0, 12)).map((v) => Math.max(15, Math.min(100, (v / 255) * 100)));
            setAudioLevels(levels);
            animFrameRef.current = requestAnimationFrame(updateLevels);
          }
        };
        updateLevels();
      } catch (audioErr) {}

      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone permission is required to record voice notes. Please allow microphone access in your browser settings.');
    }
  };

  const cancelRecording = () => {
    playClick();
    cleanupAudioContext();
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
    }
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    playClick();
    cleanupAudioContext();

    const recorder = mediaRecorderRef.current;
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    const duration = recordingTime > 0 ? recordingTime : 1;

    recorder.onstop = async () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio = reader.result;
        const currentUserId = String(user?._id || user?.id || 'user_guest');
        const currentUserEmail = String(user?.email || '').toLowerCase();
        const tempId = `temp_voice_${Date.now()}`;

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
          text: '',
          messageType: 'voice',
          mediaUrl: base64Audio,
          audioDuration: duration,
          projectData: activeConv.projectContext,
          isRead: false,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        const payload = {
          conversationId: activeConv._id,
          receiverId,
          receiverName,
          receiverEmail,
          receiverAvatar,
          text: '',
          messageType: 'voice',
          mediaUrl: base64Audio,
          audioDuration: duration,
          projectData: activeConv.projectContext,
        };

        try {
          const res = await api.post('/chat/messages', payload);
          const newMsg = res.data.message || optimisticMsg;

          setMessages((prev) => prev.map((m) => (m._id === tempId ? newMsg : m)));

          if (socket) {
            socket.emit('send_message', {
              conversationId: activeConv._id,
              message: newMsg,
              receiverId,
              receiverEmail,
              senderEmail: currentUserEmail,
            });
          }
          playSuccess();
          setTimeout(scrollToBottom, 100);
        } catch (e) {
          console.error('Voice send error:', e);
        }
      };

      reader.readAsDataURL(audioBlob);

      if (recorder.stream) {
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    };

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

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

  const filteredConversations = conversations.filter((c) => {
    if (!c) return false;
    const p = getPartner(c);
    const pName = String(p?.name || 'Project Seller').toLowerCase();
    const q = String(searchQuery || '').toLowerCase();
    return pName.includes(q);
  });

  const partner = activeConv ? getPartner(activeConv) : getPartner(null);
  const partnerId = String(partner?.userId || partner?.id || '').toLowerCase();
  const partnerEmail = String(partner?.email || '').toLowerCase();
  const isRecipientOnline = Array.isArray(onlineUsers) && onlineUsers.some((u) => {
    const strU = String(u).toLowerCase();
    return (partnerId && strU === partnerId) || (partnerEmail && strU === partnerEmail);
  });

  return (
    <div className="relative pt-28 sm:pt-32 pb-4 h-screen min-h-screen max-h-screen flex flex-col font-mono text-xs overflow-hidden">
      <div className="max-w-[1700px] mx-auto w-full px-2 sm:px-4 lg:px-6 flex-1 flex flex-col h-full relative z-10 min-h-0 overflow-hidden">

        {/* DIRECT CHAT MAIN CONTAINER (EXACT WHATSAPP WEB FRAME) */}
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-12 rounded-2xl bg-[#0b141a] border border-[#202c33] shadow-2xl min-h-0 overflow-hidden">

          {/* ============================================================ */}
          {/* LEFT: WHATSAPP CHAT LIST SIDEBAR */}
          {/* ============================================================ */}
          <div className={`md:col-span-4 border-r border-[#202c33] flex flex-col h-full min-h-0 bg-[#111b21] ${activeConv ? 'hidden md:flex' : 'flex'}`}>

            {/* Sidebar Header */}
            <div className="p-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#202c33]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-[#00a884] bg-gray-900"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs text-white truncate max-w-[140px]">
                    {user?.name || 'Verified Innovator'}
                  </h3>
                  <span className="text-[10px] text-[#00a884] block font-mono">WhatsApp Web Direct</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[#8696a0]">
                <button
                  type="button"
                  title="New Direct Chat"
                  onClick={() => fetchConversations()}
                  className="p-2 rounded-full hover:bg-[#374248] hover:text-white transition-colors cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-[#00a884] bg-[#00a884]/15 px-2.5 py-1 rounded-full border border-[#00a884]/30 font-bold">
                  ✓ Encrypted
                </span>
              </div>
            </div>

            {/* Search Box & WhatsApp Filter Chips */}
            <div className="p-3 border-b border-[#202c33] space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8696a0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or start new chat..."
                  className="w-full bg-[#202c33] border-none rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>

              {/* WhatsApp Web Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
                {['All', 'Unread', 'Favorites', 'Groups'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      activeFilter === filter
                        ? 'bg-[#00a884]/20 border-[#00a884] text-[#00a884] font-bold'
                        : 'bg-[#202c33]/50 border-transparent text-[#8696a0] hover:bg-[#202c33] hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/50 p-1.5 space-y-1 min-h-0">
              {filteredConversations.map((conv) => {
                const p = getPartner(conv);
                const isSelected = activeConv?._id === conv._id;

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      playClick();
                      setActiveConv(conv);
                    }}
                    className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 group relative ${
                      isSelected
                        ? 'bg-[#2a3942] border border-[#00a884]/40 shadow-lg'
                        : 'hover:bg-[#202c33] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#00a884]/30 bg-gray-900"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-display font-bold text-xs text-[#e9edef] truncate group-hover:text-[#00a884] transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-[10px] text-[#8696a0] font-mono shrink-0">
                            {new Date(conv.lastMessage?.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#8696a0] truncate mt-0.5">
                          {conv.lastMessage?.text || 'Tap to chat with seller'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all cursor-pointer"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="py-12 text-center text-[#8696a0] font-mono text-xs px-4">
                  No active seller conversations found.
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: ACTIVE CHAT MESSAGES WINDOW */}
          {/* ============================================================ */}
          <div className={`md:col-span-8 flex flex-col h-full min-h-0 bg-[#0b141a] relative ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
            {activeConv ? (
              <>
                {/* CHAT HEADER */}
                <div className="p-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#202c33] relative z-20">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveConv(null)}
                      className="md:hidden px-2 py-1 rounded-xl bg-[#111b21] hover:bg-[#374248] text-[#00a884] font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      ← Chats
                    </button>
                    <div className="relative">
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#00a884]"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#e9edef]">
                        {partner.name}
                      </h3>
                      <p className="text-[10px] font-mono text-[#00a884] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                        <span>{isTyping ? `${typingUser} is typing...` : isRecipientOnline ? 'Online • Project Creator' : 'Online'}</span>
                      </p>
                    </div>
                  </div>

                  {/* MENU & CALL BUTTONS */}
                  <div className="flex items-center gap-1.5 text-[#8696a0]">
                    <button
                      type="button"
                      onClick={() => alert('📞 Voice Calling feature is connected via WebRTC node.')}
                      className="p-2.5 rounded-full hover:bg-[#374248] hover:text-white transition-colors cursor-pointer"
                      title="Start Voice Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('📹 Video Calling feature is connected via WebRTC node.')}
                      className="p-2.5 rounded-full hover:bg-[#374248] hover:text-white transition-colors cursor-pointer"
                      title="Start Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>

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
                  className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs relative min-h-0"
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
                            <WhatsAppVoicePlayer
                              mediaUrl={msg.mediaUrl}
                              audioDuration={msg.audioDuration}
                              isMe={isMe}
                            />
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
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" title="Read by recipient (Double Blue Ticks)" />
                              ) : isRecipientOnline ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" title="Delivered to recipient (Double Grey Ticks)" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-[#8696a0]" title="Sent (Single Grey Tick - Recipient Offline)" />
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

                {/* WHATSAPP INPUT BAR & ACTIVE RECORDING HUD */}
                {isRecording ? (
                  <div className="p-3 bg-[#202c33] flex items-center justify-between gap-3 border-t border-[#202c33] relative z-20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 transition-colors cursor-pointer shrink-0"
                        title="Cancel Recording"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs shrink-0">
                        <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                        <span>Recording... {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
                      </div>

                      {/* Animated Real-time Audio Frequency Waves */}
                      <div className="hidden sm:flex items-center gap-0.5 h-5 flex-1 max-w-xs px-2">
                        {audioLevels.map((lvl, idx) => (
                          <div
                            key={idx}
                            className="flex-1 bg-rose-500/80 rounded-full transition-all duration-75"
                            style={{ height: `${lvl}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      className="px-4 py-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Voice Note</span>
                    </button>
                  </div>
                ) : (
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
                      onClick={startRecording}
                      disabled={isSending}
                      className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
                      title="Record Voice Note"
                    >
                      <Mic className="w-5 h-5 text-[#00a884]" />
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
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#8696a0] font-mono text-xs space-y-3 p-6 text-center">
                <Shield className="w-12 h-12 text-[#00a884] animate-pulse" />
                <p>Select a project seller on the left to start direct real-time messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;
