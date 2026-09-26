import {
  AlertCircle,
  Check,
  CheckCheck,
  CheckCircle2,
  FileText,
  Headphones,
  Image,
  Lock,
  LogOut,
  MessageSquare,
  Package,
  Paperclip,
  Send,
  User,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface TicketMessage {
  id: string;
  sender: 'user' | 'admin' | 'bot';
  senderName: string;
  text: string;
  time: string;
  status?: 'sent' | 'read';
  attachment?: {
    name: string;
    url: string;
    type: 'image' | 'pdf';
    size?: string;
  };
}

interface PharmacyTicket {
  id: string;
  pharmacyName: string;
  pharmacistName: string;
  gln: string;
  city: string;
  unreadCount: number;
  status: 'pending' | 'active' | 'resolved';
  lastMessage: string;
  lastTime: string;
  messages: TicketMessage[];
}

interface PendingListing {
  id: string;
  title: string;
  category: string;
  pharmacyName: string;
  gln: string;
  price: number;
  stock: number;
  expiry: string;
  mf: string;
  barcode: string;
  date: string;
}

const INITIAL_TICKETS: PharmacyTicket[] = [
  {
    id: 'ticket-1',
    pharmacyName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
    pharmacistName: 'Ecz. Demo Eczacı',
    gln: '3245676600002',
    city: 'İstanbul / Kadıköy',
    unreadCount: 0,
    status: 'active',
    lastMessage: 'Canlı destek bağlantısı hazır. Test mesajınızı yazabilirsiniz.',
    lastTime: 'Şimdi',
    messages: [
      {
        id: 'm1',
        sender: 'bot',
        senderName: 'Eczacıdan AI Bot 🤖',
        text: 'Eczacıdan.com B2B Canlı Destek Masasına hoş geldiniz. Temsilcimiz yayında.',
        time: 'Şimdi',
      },
    ],
  },
];

const INITIAL_PENDING_LISTINGS: PendingListing[] = [];

const CANNED_RESPONSES = [
  '📦 Siparişiniz hazırlanmış olup kargo takip numaranız YURT-10029384 olarak güncellenmiştir.',
  '✅ GLN numaranız ve eczane ruhsatınız başarıyla onaylandı. İlan açabilirsiniz.',
  '💳 e-Faturanız GİB sistemine iletilmiş olup e-posta adresinize gönderilmiştir.',
  '🔄 İade ve takas işleminiz onaylanmıştır. Bakiyeniz hesabınıza yansıtılmıştır.',
];

export default function AdminPanel() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('isAdminAuth') === 'true'
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab: 'chat' | 'gln_approvals' | 'listings_approval'
  const [activeTab, setActiveTab] = useState<'chat' | 'gln_approvals' | 'listings_approval'>('chat');

  // Chat State
  const [tickets, setTickets] = useState<PharmacyTicket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('ticket-1');
  const [replyInput, setReplyInput] = useState('');

  // Attachment State
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    url: string;
    type: 'image' | 'pdf';
    size: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Typing State & Ref
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // GLN Approval Queue State
  const [pendingGlns, setPendingGlns] = useState<Array<{ id: string; name: string; gln: string; pharmacist: string; city: string; date: string }>>([]);

  // Pending Listings Approval Queue State
  const [pendingListings, setPendingListings] = useState<PendingListing[]>(INITIAL_PENDING_LISTINGS);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Auto-scroll chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tickets, isUserTyping, selectedTicketId]);

  // File Select Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isImage && !isPdf) {
      alert('Lütfen sadece Görsel (PNG, JPG) veya PDF belge formatında dosya yükleyin.');
      return;
    }

    const url = URL.createObjectURL(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeKB = Math.round(file.size / 1024);
    const formattedSize = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

    setSelectedFile({
      file,
      name: file.name,
      url,
      type: isImage ? 'image' : 'pdf',
      size: formattedSize,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Real-time inter-tab sync with User Live Chat & New Listings
  useEffect(() => {
    let chatChannel: BroadcastChannel | null = null;
    let listingChannel: BroadcastChannel | null = null;

    try {
      chatChannel = new BroadcastChannel('eczacidan_live_chat_sync');
      chatChannel.onmessage = (e) => {
        if (e.data && e.data.type === 'USER_MESSAGE') {
          setIsUserTyping(false);
          const now = e.data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const userMsg: TicketMessage = {
            id: `u-${Date.now()}`,
            sender: 'user',
            senderName: e.data.pharmacyName || 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
            text: e.data.text || '',
            time: now,
            status: 'sent',
            attachment: e.data.attachment,
          };

          setTickets((prev) =>
            prev.map((t) => {
              if (t.id === 'ticket-1') {
                return {
                  ...t,
                  unreadCount: t.unreadCount + 1,
                  status: 'pending',
                  lastMessage: e.data.text || (e.data.attachment ? `📎 ${e.data.attachment.name}` : ''),
                  lastTime: now,
                  messages: [
                    ...t.messages.map((m) => (m.sender === 'admin' ? { ...m, status: 'read' as const } : m)),
                    userMsg,
                  ],
                };
              }
              return t;
            })
          );
        } else if (e.data && e.data.type === 'USER_TYPING') {
          setIsUserTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsUserTyping(false);
          }, 3000);
        } else if (e.data && e.data.type === 'USER_READ_RECEIPT') {
          setTickets((prev) =>
            prev.map((t) => ({
              ...t,
              messages: t.messages.map((m) => (m.sender === 'admin' ? { ...m, status: 'read' as const } : m)),
            }))
          );
        }
      };

      listingChannel = new BroadcastChannel('eczacidan_listings_sync');
      listingChannel.onmessage = (e) => {
        if (e.data && e.data.type === 'NEW_LISTING_PENDING') {
          const item = e.data.listing;
          setPendingListings((prev) => [
            {
              id: item.id || `list-${Date.now()}`,
              title: item.productName || item.title || 'Yeni İlaç İlanı',
              category: item.category || 'Reçeteli İlaç',
              pharmacyName: item.sellerName || 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
              gln: item.gln || '3245676600002',
              price: item.unitPrice || item.price || 50.0,
              stock: item.stock || 10,
              expiry: item.skt || item.expiry || '12/2027',
              mf: item.mfRatio || item.mf || 'Yok',
              barcode: item.barcode || '8699525010019',
              date: 'Şimdi',
            },
            ...prev,
          ]);
        }
      };
    } catch {
      // Fallback
    }

    return () => {
      chatChannel?.close();
      listingChannel?.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Handle Admin Input Change & Typing Event
  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyInput(e.target.value);
    try {
      const channel = new BroadcastChannel('eczacidan_live_chat_sync');
      channel.postMessage({ type: 'ADMIN_TYPING' });
      channel.close();
    } catch {
      // Fallback
    }
  };

  // LOGIN HANDLER
  // Kimlik bilgileri YALNIZCA build zamanında env'den gelir.
  // .env.local dosyasına VITE_ADMIN_USER ve VITE_ADMIN_PASS ekleyin.
  // Bu değişkenler bundle'a derlenir; dolayısıyla güçlü, benzersiz değerler kullanın
  // ve .env.local dosyasını .gitignore'da tutun.
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const ADMIN_USER = import.meta.env.VITE_ADMIN_USER as string | undefined;
    const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS as string | undefined;

    // Her iki env değişkeni de tanımlı değilse panel tamamen erişilemez olur.
    if (!ADMIN_USER || !ADMIN_PASS) {
      setLoginError(
        'Yönetici paneli yapılandırılmamış. ' +
        'Lütfen VITE_ADMIN_USER ve VITE_ADMIN_PASS ortam değişkenlerini tanımlayın.'
      );
      return;
    }

    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    if (u === ADMIN_USER.toLowerCase() && p === ADMIN_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuth', 'true');
      setLoginError('');
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAdminAuth');
  };

  // SEND ADMIN REPLY
  const handleSendAdminReply = (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : replyInput.trim();
    if (!text && !selectedFile) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: TicketMessage = {
      id: `admin-${Date.now()}`,
      sender: 'admin',
      senderName: 'Sistem Admin (Siz)',
      text: text,
      time: now,
      status: 'sent',
      ...(selectedFile
        ? {
            attachment: {
              name: selectedFile.name,
              url: selectedFile.url,
              type: selectedFile.type,
              size: selectedFile.size,
            },
          }
        : {}),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            unreadCount: 0,
            status: 'active',
            lastMessage: text || (selectedFile ? `📎 ${selectedFile.name}` : ''),
            lastTime: now,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    try {
      const channel = new BroadcastChannel('eczacidan_live_chat_sync');
      channel.postMessage({
        type: 'ADMIN_REPLY',
        text: text,
        senderName: 'Meltem Hanım (Canlı Temsilci)',
        time: now,
        attachment: selectedFile
          ? {
              name: selectedFile.name,
              url: selectedFile.url,
              type: selectedFile.type,
              size: selectedFile.size,
            }
          : undefined,
      });
      channel.close();
    } catch {
      // Fallback
    }

    if (textToSend === undefined) setReplyInput('');
    setSelectedFile(null);
  };

  const handleApproveGln = (id: string) => {
    setPendingGlns((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApproveListing = (id: string) => {
    const listingToApprove = pendingListings.find((item) => item.id === id);
    setPendingListings((prev) => prev.filter((item) => item.id !== id));

    try {
      const channel = new BroadcastChannel('eczacidan_listings_sync');
      channel.postMessage({
        type: 'LISTING_APPROVED',
        listingId: id,
        listing: listingToApprove,
      });
      channel.close();
    } catch {
      // Fallback
    }
  };

  const handleRejectListing = (id: string) => {
    const listingToReject = pendingListings.find((item) => item.id === id);
    setPendingListings((prev) => prev.filter((item) => item.id !== id));

    try {
      const channel = new BroadcastChannel('eczacidan_listings_sync');
      channel.postMessage({
        type: 'LISTING_REJECTED',
        listingId: id,
        listing: listingToReject,
      });
      channel.close();
    } catch {
      // Fallback
    }
  };

  // SECRET LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-orange-500 selection:text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white font-black shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10">
              <Lock size={30} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-black">
                Eczacıdan<span className="text-orange-500">.com</span>
              </span>
              <span className="block text-[11px] font-extrabold text-orange-400/90 tracking-widest uppercase mt-1">
                Yönetici & Canlı Destek Portalı
              </span>
            </div>
          </div>

          {loginError && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs font-extrabold text-red-400 flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-orange-400" />
                Yönetici Kullanıcı Adı
              </label>
              <input
                type="text"
                required
                placeholder="Örn: admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock size={14} className="text-orange-400" />
                Yönetici Şifresi
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 py-3.5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition active:scale-[0.99]"
            >
              Yönetici Paneline Giriş Yap 🚀
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs font-extrabold text-slate-400 hover:text-orange-400 transition">
              ← Pazaryeri Ana Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD MAIN INTERFACE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* ADMIN HEADER BAR */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white tracking-tight">
              Eczacıdan<span className="text-orange-500">.com</span>
            </span>
            <span className="rounded-md bg-orange-500/20 px-2 py-0.5 text-[10px] font-extrabold text-orange-400 border border-orange-500/30">
              ADMİN PANELİ
            </span>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === 'chat'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Headphones size={14} />
              <span>Canlı Destek ({tickets.filter((t) => t.status === 'pending').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('listings_approval')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === 'listings_approval'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Package size={14} />
              <span>İlan Onayları ({pendingListings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gln_approvals')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === 'gln_approvals'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <UserCheck size={14} />
              <span>GLN Onayları ({pendingGlns.length})</span>
            </button>
          </div>

          {/* LOGOUT */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-bold text-emerald-400">
              🟢 FastAPI Online
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              <LogOut size={14} />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {activeTab === 'chat' ? (
          /* TAB 1: CANLI DESTEK SOHBET MASASI */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-[calc(100vh-120px)]">
            {/* LEFT: PHARMACY CHAT ROOMS LIST */}
            <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-orange-500" />
                  Eczane Sohbet Odaları
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  {tickets.length} Odadan {tickets.filter((t) => t.unreadCount > 0).length} Bekleyen
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1">
                {tickets.map((t) => {
                  const isSelected = t.id === selectedTicket.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setTickets((prev) =>
                          prev.map((item) => (item.id === t.id ? { ...item, unreadCount: 0 } : item))
                        );
                      }}
                      className={`w-full text-left rounded-2xl p-3.5 border transition ${isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-xs text-white truncate max-w-[170px]">
                          {t.pharmacyName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{t.lastTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 font-medium mb-2">
                        {t.lastMessage}
                      </p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-bold">{t.city}</span>
                        {t.status === 'pending' ? (
                          <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 font-bold">
                            🔴 Bekliyor
                          </span>
                        ) : t.status === 'active' ? (
                          <span className="rounded-full bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 font-bold">
                            🟢 Canlı
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-800 text-slate-400 px-2 py-0.5 font-bold">
                            ✅ Çözüldü
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MIDDLE: CHAT MESSAGES WINDOW */}
            <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
              {/* CHAT HEADER */}
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <span>{selectedTicket.pharmacyName}</span>
                    <span className="rounded-full bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 border border-orange-500/30">
                      GLN: {selectedTicket.gln}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Sorumlu Eczacı: <strong>{selectedTicket.pharmacistName}</strong> ({selectedTicket.city})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setTickets((prev) =>
                        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t))
                      )
                    }
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-700 transition"
                  >
                    ✅ Bileti Kapat
                  </button>
                </div>
              </div>

              {/* MESSAGES LIST */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/70">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[75%] space-y-1">
                      <div className="flex items-center justify-between gap-2 px-1 text-[10px]">
                        <span className="font-bold text-slate-400">
                          {msg.senderName} • {msg.time}
                        </span>
                        {msg.sender === 'admin' && (
                          <span
                            className="flex items-center gap-0.5"
                            title={msg.status === 'read' ? 'Okundu' : 'Gönderildi'}
                          >
                            {msg.status === 'read' ? (
                              <CheckCheck size={14} className="text-sky-400" />
                            ) : (
                              <Check size={14} className="text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl p-4 text-xs font-medium leading-relaxed shadow-md ${
                          msg.sender === 'admin'
                            ? 'bg-orange-500 text-white rounded-tr-none'
                            : msg.sender === 'bot'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'
                            : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none'
                        }`}
                      >
                        {msg.text ? <p className="whitespace-pre-line">{msg.text}</p> : null}

                        {/* ATTACHMENT DISPLAY */}
                        {msg.attachment && (
                          <div className="mt-2.5">
                            {msg.attachment.type === 'image' ? (
                              <div className="relative overflow-hidden rounded-xl border border-white/20 bg-black/40 max-w-sm">
                                <a
                                  href={msg.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group"
                                >
                                  <img
                                    src={msg.attachment.url}
                                    alt={msg.attachment.name}
                                    className="max-h-60 w-full object-cover transition group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-extrabold gap-1.5 backdrop-blur-xs">
                                    <Image size={16} />
                                    <span>Görseli Büyüt</span>
                                  </div>
                                </a>
                                <div className="p-2 bg-slate-900/90 text-[10px] text-slate-300 font-medium flex items-center justify-between border-t border-slate-800">
                                  <span className="truncate max-w-[170px] font-bold text-white">
                                    {msg.attachment.name}
                                  </span>
                                  <span className="text-slate-400 font-mono">{msg.attachment.size}</span>
                                </div>
                              </div>
                            ) : (
                              <a
                                href={msg.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={msg.attachment.name}
                                className="flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900/90 p-3 hover:bg-slate-800 transition text-slate-100 group shadow-sm"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 group-hover:scale-105 transition">
                                  <FileText size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="block text-xs font-extrabold text-white truncate group-hover:text-orange-400 transition">
                                    {msg.attachment.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    PDF Belgesi • {msg.attachment.size} • İndirmek için tıklayın 📄
                                  </span>
                                </div>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {isUserTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-300 shadow-lg">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                      </span>
                      <span className="font-extrabold text-white">
                        {selectedTicket.pharmacistName} yazıyor
                      </span>
                      <div className="flex items-center gap-1 text-orange-400 font-black text-sm">
                        <span className="animate-bounce inline-block">.</span>
                        <span className="animate-bounce inline-block [animation-delay:0.2s]">.</span>
                        <span className="animate-bounce inline-block [animation-delay:0.4s]">.</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* CANNED RESPONSES */}
              <div className="border-t border-slate-800 p-3 bg-slate-900/90 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ⚡ Hızlı Şablon Yanıtlar:
                </span>
                <div className="flex flex-wrap gap-2">
                  {CANNED_RESPONSES.map((resp, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendAdminReply(resp)}
                      className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition text-left cursor-pointer"
                    >
                      {resp.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* ATTACHMENT PREVIEW BOX */}
              {selectedFile && (
                <div className="border-t border-slate-800 bg-slate-900/95 p-3">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 p-2.5 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      {selectedFile.type === 'image' ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-600 bg-slate-950">
                          <img src={selectedFile.url} alt="Önizleme" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                          <FileText size={22} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-white truncate max-w-[220px]">
                            {selectedFile.name}
                          </span>
                          <span className="rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 border border-orange-500/30 uppercase">
                            {selectedFile.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-medium block">
                          {selectedFile.size} • Gönderilmeye Hazır 📎
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-red-500 hover:text-white transition cursor-pointer"
                      title="Eki İptal Et"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ADMIN INPUT FORM WITH PAPERCLIP ATTACHMENT BUTTON */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAdminReply();
                }}
                className="flex items-center gap-2 p-4 bg-slate-900 border-t border-slate-800"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-orange-400 transition cursor-pointer"
                  title="Dosya veya Görsel Ekle (PNG, JPG, PDF)"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  placeholder="Eczacıya canlı yanıtınızı yazın..."
                  value={replyInput}
                  onChange={handleReplyInputChange}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-3 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  <span>Yanıtla</span>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : activeTab === 'listings_approval' ? (
          /* TAB 2: URUN İLAN ONAY MASASI */
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Package className="text-orange-500" size={20} />
                    Onay Bekleyen Eczacı İlaç & Ürün İlanları
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Satıcı eczanelerin pazaryerine eklediği ürün ilanları İTS ve Miad kontrolünden geçerek burada listelenir.
                  </p>
                </div>
                <span className="rounded-full bg-orange-500/20 text-orange-400 px-3 py-1 text-xs font-bold border border-orange-500/30">
                  {pendingListings.length} Bekleyen İlan
                </span>
              </div>

              {pendingListings.length === 0 ? (
                <div className="p-10 text-center text-xs font-bold text-slate-500 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-white">🎉 Harika! Onay Bekleyen Hiçbir Ürün İlanı Kalmadı.</p>
                  <p className="text-slate-400">Tüm ilanlar incelendi ve pazaryerinde yayına alındı.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingListings.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-md bg-orange-500/10 text-orange-400 px-2.5 py-0.5 text-[10px] font-extrabold border border-orange-500/20">
                            {item.category}
                          </span>
                          <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Satıcı Eczane</span>
                            <span className="font-bold text-slate-200">{item.pharmacyName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Fiyat & Stok</span>
                            <span className="font-bold text-orange-400">
                              {item.price.toFixed(2)} ₺ <span className="text-slate-400">({item.stock} Adet)</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Miad & MF</span>
                            <span className="font-bold text-emerald-400">SKT: {item.expiry}</span>{' '}
                            <span className="text-slate-400 text-[10px]">({item.mf})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Barkod / İTS</span>
                            <span className="font-mono text-slate-300">{item.barcode}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-500 block">Ekleme Tarihi: {item.date}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => handleRejectListing(item.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-extrabold text-red-400 transition flex items-center gap-1.5"
                        >
                          <XCircle size={14} />
                          <span>Reddet</span>
                        </button>
                        <button
                          onClick={() => handleApproveListing(item.id)}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-black text-white shadow transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>İlanı Onayla ve Yayına Al</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 3: GLN ONAY BEKLEYENLER TABI */
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <UserCheck className="text-orange-500" size={20} />
                Sağlık Bakanlığı & GLN Onay Bekleyen Eczane Üyelikleri
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Yeni üye olan eczanelerin GLN veritabanı kayıtları aşağıda listelenmiştir. Kontrol edip onaylayabilirsiniz.
              </p>

              {pendingGlns.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  🎉 Bekleyen GLN Onay Başvurusu Bulunmamaktadır. Tüm Eczaneler Onaylı!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingGlns.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white">{item.name}</h4>
                          <span className="rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 border border-amber-500/30">
                            Bekliyor
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {item.pharmacist} • {item.city} • <strong className="text-orange-400">GLN: {item.gln}</strong>
                        </p>
                        <span className="text-[10px] text-slate-500">{item.date} başvurdu</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveGln(item.id)}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow transition flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>GLN Onayla</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
