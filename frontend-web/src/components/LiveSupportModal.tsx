import { Bot, FileText, Headphones, Send, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface LiveSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'agent' | 'user';
  senderName: string;
  text: string;
  time: string;
  showOptions?: boolean;
  status?: 'sent' | 'read';
  attachment?: {
    name: string;
    url: string;
    type: 'image' | 'pdf';
    size?: string;
  };
}

const QUICK_OPTIONS = [
  { id: 'orders', label: '📦 Siparişlerim & Kargo Durumu' },
  { id: 'listings', label: '📋 İlan Vermek & İlanlarım' },
  { id: 'invoice', label: '💳 Ödeme & e-Fatura İşlemleri' },
  { id: 'returns', label: '🔄 İade & Takas Koşulları' },
  { id: 'live_agent', label: '🎧 Canlı Temsilciye Bağlan' },
];

export function LiveSupportModal({ isOpen, onClose }: LiveSupportModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      senderName: 'Eczacıdan AI Bot 🤖',
      text: 'Merhaba Sayın Eczacım! 🤖 Eczacıdan.com B2B Akıllı Asistanına hoş geldiniz. Size nasıl yardımcı olabilirim?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showOptions: true,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isConnectedToAgent, setIsConnectedToAgent] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const adminTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isAdminTyping]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('eczacidan_live_chat_sync');

      // Send read receipt when modal opens
      channel.postMessage({ type: 'USER_READ_RECEIPT' });

      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'ADMIN_REPLY') {
          setIsAdminTyping(false);
          setIsConnectedToAgent(true);
          setMessages((prev) => [
            ...prev,
            {
              id: `admin-${Date.now()}`,
              sender: 'agent',
              senderName: e.data.senderName || 'Meltem Hanım (Canlı Temsilci)',
              text: e.data.text || '',
              time: e.data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              attachment: e.data.attachment,
            },
          ]);
        } else if (e.data && e.data.type === 'ADMIN_TYPING') {
          setIsAdminTyping(true);
          if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
          adminTypingTimeoutRef.current = setTimeout(() => {
            setIsAdminTyping(false);
          }, 3000);
        }
      };
    } catch {
      // Fallback
    }

    return () => {
      channel?.close();
      if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleOptionClick = (optionId: string, optionLabel: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Hide options from previous bot messages
    setMessages((prev) =>
      prev.map((m) => ({ ...m, showOptions: false }))
    );

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderName: 'Siz',
      text: optionLabel,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const channel = new BroadcastChannel('eczacidan_live_chat_sync');
      channel.postMessage({
        type: 'USER_MESSAGE',
        pharmacyName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
        text: optionLabel,
        time: now,
      });
      channel.close();
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      let connectAgent = false;

      switch (optionId) {
        case 'orders':
          replyText =
            '📦 Son siparişiniz (ECZ-20260807-001) kargoya verildi! Kargo Takip No: YURT-10029384. 24 saat içinde eczanenize teslim edilecektir. Başka bir sorunuz var mı?';
          break;
        case 'listings':
          replyText =
            '📋 Hesabınızda 1 aktif demo ilanınız bulunmaktadır. "Ücretsiz İlan Ekle" butonunu kullanarak yeni ilaç veya takviye ilanı ekleyip admin onayına gönderebilirsiniz.';
          break;
        case 'invoice':
          replyText =
            '💳 Hesabım -> e-Fatura sekmesinden tüm GİB onaylı e-faturalarınızı PDF/XML veya ZIP arşivi olarak tek tıkla indirebilirsiniz.';
          break;
        case 'returns':
          replyText =
            '🔄 Eczacılar arası B2B ilaç takas ve iade işlemleri 3 iş günü içerisinde platform güvencesiyle yapılmaktadır.';
          break;
        case 'live_agent':
          replyText =
            '🎧 Talebiniz alındı! Sizi Eczacıdan.com B2B Müşteri Temsilcimize canlı bağlıyorum...';
          connectAgent = true;
          break;
        default:
          replyText = 'Size nasıl yardımcı olabilirim?';
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: connectAgent ? 'agent' : 'bot',
        senderName: connectAgent ? 'Meltem Hanım (B2B Temsilci)' : 'Eczacıdan AI Bot 🤖',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (connectAgent) {
        setIsConnectedToAgent(true);
      }
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, showOptions: false })),
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        senderName: 'Siz',
        text: userText,
        time: now,
      },
    ]);

    try {
      const channel = new BroadcastChannel('eczacidan_live_chat_sync');
      channel.postMessage({
        type: 'USER_MESSAGE',
        pharmacyName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
        text: userText,
        time: now,
      });
      channel.close();
    } catch {
      // Fallback
    }

    setInputMessage('');
    setIsConnectedToAgent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl overflow-hidden border-l border-gray-200 animate-in slide-in-from-right duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-orange-950 px-4 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold shadow-md">
              {isConnectedToAgent ? <Headphones size={20} /> : <Bot size={22} />}
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                {isConnectedToAgent ? 'Canlı Müşteri Temsilcisi' : 'Eczacıdan AI Akıllı Asistan'}
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-gray-300 font-medium">
                {isConnectedToAgent ? '🟢 Meltem Hanım Bağlandı' : '🤖 7/24 Otomatik Destek & Yönlendirme'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* TOP BANNER STATUS */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 border-b border-orange-100 flex items-center justify-between text-xs font-semibold text-orange-950">
          <span className="flex items-center gap-1.5">
            <span className="text-orange-500">✨</span>
            {isConnectedToAgent ? 'Sohbet Canlı Temsilciye Aktarıldı' : 'Hızlı İşlem & Sıkça Sorulan Sorular'}
          </span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-800 font-bold">
            {isConnectedToAgent ? 'Canlı Bağlantı' : 'Robot Aktif'}
          </span>
        </div>

        {/* CHAT MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/70">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* AVATAR */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-white'
                        : msg.sender === 'agent'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <User size={14} />
                    ) : msg.sender === 'agent' ? (
                      <Headphones size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>

                  {/* BUBBLE */}
                  <div>
                    <span className="mb-1 block text-[10px] font-bold text-gray-500">
                      {msg.senderName}
                    </span>
                    <div
                      className={`rounded-2xl p-3 text-xs shadow-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-orange-500 text-white rounded-tr-none font-medium'
                          : msg.sender === 'agent'
                          ? 'bg-purple-50 text-purple-950 border border-purple-200 rounded-tl-none font-medium'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text ? <p className="whitespace-pre-line">{msg.text}</p> : null}

                      {/* ATTACHMENT DISPLAY */}
                      {msg.attachment && (
                        <div className="mt-2">
                          {msg.attachment.type === 'image' ? (
                            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-black/10">
                              <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={msg.attachment.url}
                                  alt={msg.attachment.name}
                                  className="max-h-48 w-full object-cover"
                                />
                              </a>
                            </div>
                          ) : (
                            <a
                              href={msg.attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={msg.attachment.name}
                              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white p-2.5 text-purple-950 hover:bg-purple-50 transition"
                            >
                              <FileText size={18} className="text-red-500 shrink-0" />
                              <span className="text-xs font-bold truncate max-w-[160px]">{msg.attachment.name}</span>
                            </a>
                          )}
                        </div>
                      )}

                      <span
                        className={`block text-[9px] mt-1.5 font-mono ${
                          msg.sender === 'user' ? 'text-orange-100 text-right' : 'text-gray-400'
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK OPTIONS BUTTONS UNDER BOT MESSAGE */}
              {msg.showOptions && (
                <div className="ml-9 flex flex-wrap gap-1.5 pt-1">
                  {QUICK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.id, opt.label)}
                      className="rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-900 shadow-sm transition hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="ml-9 rounded-full bg-gray-200 px-3 py-1.5 text-xs text-gray-500 animate-pulse flex items-center gap-1 font-semibold">
                <span>🤖 Yanıt hazırlanıyor</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}

          {/* ADMIN TYPING INDICATOR */}
          {isAdminTyping && (
            <div className="flex justify-start">
              <div className="ml-9 rounded-2xl bg-purple-100 border border-purple-200 px-3.5 py-2 text-xs text-purple-900 flex items-center gap-2 font-bold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                </span>
                <span>🎧 Meltem Hanım (Canlı Temsilci) yazıyor</span>
                <div className="flex items-center gap-0.5 text-purple-600 font-black">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">.</span>
                  <span className="animate-bounce [animation-delay:0.4s]">.</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-200 p-3 bg-white">
          <input
            type="text"
            placeholder={
              isConnectedToAgent
                ? 'Canlı temsilciye mesajınızı yazın...'
                : 'Bir soru yazın veya yukarıdaki butonlara basın...'
            }
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              try {
                const channel = new BroadcastChannel('eczacidan_live_chat_sync');
                channel.postMessage({ type: 'USER_TYPING' });
                channel.close();
              } catch {
                // Fallback
              }
            }}
            className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
          />
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-white font-bold hover:bg-orange-600 transition shadow flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
