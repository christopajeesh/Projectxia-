import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  Paperclip,
  Mic,
  Smile,
  Search,
  CheckCheck,
  Shield,
  Circle,
  Phone,
  Video,
  FileCode,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Check,
  Play,
  Volume2,
} from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
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

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      if (socket) {
        socket.emit('join_conversation', activeConv._id);
      }
    }
  }, [activeConv]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      playSuccess();
      scrollToBottom();
    });

    socket.on('user_typing', ({ userName, isTyping }) => {
      setIsTyping(isTyping);
      setTypingUser(userName || 'Seller');
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      let convList = res.data.conversations || [];

      // If arriving from a project with creator context, select or initialize conversation
      if (location.state?.creatorId) {
        let existing = convList.find((c) =>
          c.participants?.some((p) => p.userId === location.state.creatorId)
        );

        if (!existing) {
          existing = {
            _id: `conv_new_${Date.now()}`,
            participants: [
              {
                userId: user?._id || user?.id || 'user_001_buyer',
                name: user?.name || 'Rohan Sharma',
                avatar: user?.avatar,
                role: 'user',
              },
              {
                userId: location.state.creatorId,
                name: location.state.creatorName || 'Dr. Priya Venkatesh',
                avatar: location.state.creatorAvatar,
                role: 'creator',
              },
            ],
            projectContext: location.state.projectContext,
            lastMessage: {
              text: `Inquiring about ${location.state.projectContext?.title || 'project'}`,
              createdAt: new Date(),
            },
          };
          convList = [existing, ...convList];
        }
        setConversations(convList);
        setActiveConv(existing);
      } else {
        setConversations(convList);
        if (convList.length > 0) {
          setActiveConv(convList[0]);
        }
      }
    } catch (e) {}
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/chat/messages/${convId}`);
      setMessages(res.data.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (e) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeConv) return;
    playClick();

    const payload = {
      conversationId: activeConv._id,
      receiverId: activeConv.participants?.find((p) => p.userId !== (user?._id || user?.id))?.userId || 'user_002_creator',
      text: inputMsg,
      messageType: 'text',
      projectData: activeConv.projectContext,
    };

    try {
      const res = await api.post('/chat/messages', payload);
      setMessages((prev) => [...prev, res.data.message]);
      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConv._id,
          message: res.data.message,
        });
      }
      setInputMsg('');
      scrollToBottom();
    } catch (e) {}
  };

  const sendVoiceNote = async () => {
    playClick();
    if (!activeConv) return;

    const payload = {
      conversationId: activeConv._id,
      receiverId: activeConv.participants?.find((p) => p.userId !== (user?._id || user?.id))?.userId || 'user_002_creator',
      text: 'Voice note (0:18s)',
      messageType: 'voice',
      audioDuration: 18,
      projectData: activeConv.projectContext,
    };

    try {
      const res = await api.post('/chat/messages', payload);
      setMessages((prev) => [...prev, res.data.message]);
      if (socket) {
        socket.emit('send_message', { conversationId: activeConv._id, message: res.data.message });
      }
      playSuccess();
      scrollToBottom();
    } catch (e) {}
  };

  const getPartner = (conv) => {
    if (!conv) return { name: 'Dr. Priya Venkatesh', avatar: '' };
    const myId = user?._id || user?.id || 'user_001_buyer';
    const partner = conv.participants?.find((p) => p.userId !== myId) || conv.participants?.[0];
    return partner || { name: 'Verified Creator', avatar: '' };
  };

  const filteredConversations = conversations.filter((c) => {
    const partner = getPartner(c);
    return partner.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col pt-4 pb-12">
      <AuroraBackground />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col relative z-10">
        {/* WhatsApp Cyber Chat Interface */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-[#0b141a]/95 border border-[#00a884]/30 backdrop-blur-2xl overflow-hidden shadow-2xl min-h-[640px]">
          
          {/* LEFT: WhatsApp Sidebar */}
          <div className="md:col-span-4 border-r border-[#202c33] flex flex-col bg-[#111b21]">
            {/* Header */}
            <div className="p-3.5 bg-[#202c33] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-[#00a884] bg-gray-900"
                />
                <span className="font-display font-bold text-xs text-white">Direct Seller Chats</span>
              </div>
              <span className="text-[10px] font-mono text-[#00a884] bg-[#00a884]/15 px-2 py-0.5 rounded-full border border-[#00a884]/30">
                P2P Encrypted
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
                  placeholder="Search chats, sellers, projects..."
                  className="w-full bg-[#202c33] border-none rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]/60 p-1.5 space-y-1">
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
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#2a3942] border border-[#00a884]/40'
                        : 'hover:bg-[#202c33]/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={partner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.name || 'Seller')}&backgroundColor=111b21,202c33&textColor=00a884`}
                        alt={partner.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#00a884]/40 bg-gray-900"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-xs text-[#e9edef] truncate">{partner.name}</h4>
                        <span className="text-[10px] font-mono text-[#8696a0]">Live</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#8696a0] truncate mt-0.5">
                        {conv.lastMessage?.text || 'Direct project inquiry active'}
                      </p>
                      {conv.projectContext && (
                        <span className="inline-block text-[9px] font-mono text-[#00a884] bg-[#00a884]/15 px-1.5 py-0.2 rounded mt-1">
                          {conv.projectContext.title?.substring(0, 24)}...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active WhatsApp Chat Conversation Room */}
          <div className="md:col-span-8 flex flex-col bg-[#0b141a]">
            {activeConv ? (
              <>
                {/* Chat Room Top Bar */}
                <div className="p-3.5 bg-[#202c33] flex items-center justify-between border-b border-[#202c33]">
                  <div className="flex items-center gap-3">
                    <img
                      src={getPartner(activeConv).avatar}
                      alt={getPartner(activeConv).name}
                      className="w-10 h-10 rounded-full object-cover border border-[#00a884]"
                    />
                    <div>
                      <h3 className="font-display font-bold text-sm text-[#e9edef]">
                        {getPartner(activeConv).name}
                      </h3>
                      <p className="text-[10px] font-mono text-[#00a884] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]" />
                        <span>Online • Direct Creator Node</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-[#8696a0]">
                    <span className="hidden sm:inline bg-[#111b21] px-2.5 py-1 rounded-lg border border-[#202c33]">
                      End-to-End Verified
                    </span>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                  {/* Pinned Project Card Header */}
                  {activeConv.projectContext && (
                    <div className="p-3 rounded-2xl bg-[#1f2c34] border border-[#00a884]/40 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#00a884] uppercase font-bold">Project Inquiry:</span>
                        <p className="font-bold text-[#e9edef] font-display">{activeConv.projectContext.title}</p>
                      </div>
                      <span className="text-[#00a884] font-bold font-display text-sm">
                        ₹{activeConv.projectContext.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isMe = msg.sender?.id === (user?._id || user?.id || 'user_001_buyer');

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-2xl ${
                            isMe
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                              : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                          }`}
                        >
                          {msg.messageType === 'voice' ? (
                            <div className="flex items-center gap-3 py-1">
                              <button
                                type="button"
                                className="w-8 h-8 rounded-full bg-[#00a884] text-black flex items-center justify-center shrink-0"
                              >
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              </button>
                              <div className="flex-1">
                                <div className="h-1.5 bg-[#8696a0]/30 rounded-full overflow-hidden">
                                  <div className="w-2/3 h-full bg-[#00a884]" />
                                </div>
                                <span className="text-[10px] text-[#8696a0] mt-1 block">0:18s Voice Note</span>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8696a0]">
                            <span>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div className="text-[10px] font-mono text-[#00a884] animate-pulse">
                      {typingUser} is typing...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#202c33] flex items-center gap-2 border-t border-[#202c33]"
                >
                  <button
                    type="button"
                    onClick={sendVoiceNote}
                    title="Send Voice Note"
                    className="p-2.5 rounded-full hover:bg-[#374248] text-[#8696a0] hover:text-[#00a884] transition-colors"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => {
                      setInputMsg(e.target.value);
                      if (socket && activeConv) {
                        socket.emit('typing_start', {
                          conversationId: activeConv._id,
                          userName: user?.name,
                        });
                        setTimeout(
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
                    className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#02906f] text-black font-bold shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[#8696a0] font-mono text-xs">
                Select a project seller to begin real-time messaging.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
