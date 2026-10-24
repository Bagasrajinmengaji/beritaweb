'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ShieldCheck,
  Phone,
  Trash2,
  Bell,
  CheckCheck,
  User as UserIcon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export interface NewsItemForChat {
  id: number;
  title: string;
  author?: string | null;
}

interface DBMessage {
  id: number;
  user_id?: number | null;
  session_id?: string | null;
  user_name: string;
  user_email?: string | null;
  news_id?: number | null;
  news_title?: string | null;
  message: string;
  sender: 'user' | 'admin' | 'bot';
  is_read_by_admin: boolean;
  is_read_by_user: boolean;
  created_at: string;
}

interface CustomerServiceChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  targetNews?: NewsItemForChat | null;
  initialSessionId?: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

function getOrCreateSessionId(userId?: number): string {
  if (typeof window === 'undefined') return 'sess_default';
  if (userId) return `usr_${userId}`;
  let sid = localStorage.getItem('portalberita_cs_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('portalberita_cs_session_id', sid);
  }
  return sid;
}

export function CustomerServiceChat({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  targetNews: controlledTargetNews,
  initialSessionId,
}: CustomerServiceChatProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [targetNews, setTargetNews] = useState<NewsItemForChat | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id?: number; name?: string; email?: string; role?: string | null } | null>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin view state: jika user adalah admin, bisa melihat list sesi user
  const [allSessions, setAllSessions] = useState<{ sessionId: string; userName: string; lastMessage: string; newsTitle?: string; unread: boolean; time: string }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WA ?? '6281234567890';
  const isAdmin = currentUser?.role === 'admin';

  // Sinkronisasi data user dari localStorage
  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem('user') || localStorage.getItem('auth_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
          setActiveSessionId(initialSessionId || getOrCreateSessionId(parsed.id));
        } else {
          setCurrentUser(null);
          setActiveSessionId(initialSessionId || getOrCreateSessionId());
        }
      } catch {
        setActiveSessionId(initialSessionId || getOrCreateSessionId());
      }
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('authChange', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('authChange', syncUser);
    };
  }, [initialSessionId]);

  // Listener event global 'openCSChat'
  useEffect(() => {
    const handleGlobalOpen = (e: Event) => {
      const customEvt = e as CustomEvent<{ targetNews?: NewsItemForChat; sessionId?: string }>;
      if (customEvt.detail?.targetNews) {
        setTargetNews(customEvt.detail.targetNews);
      }
      if (customEvt.detail?.sessionId) {
        setActiveSessionId(customEvt.detail.sessionId);
      }
      if (isControlled && controlledOnClose) {
        // controlled
      } else {
        setInternalIsOpen(true);
      }
    };

    window.addEventListener('openCSChat', handleGlobalOpen as EventListener);
    return () => {
      window.removeEventListener('openCSChat', handleGlobalOpen as EventListener);
    };
  }, [isControlled, controlledOnClose]);

  useEffect(() => {
    if (controlledTargetNews !== undefined) {
      setTargetNews(controlledTargetNews);
    }
  }, [controlledTargetNews]);

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // ─── Fetch Messages from Backend API ──────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!activeSessionId && !isAdmin) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let url = `${API}/cs/messages`;
      if (activeSessionId) {
        url += `?session_id=${encodeURIComponent(activeSessionId)}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) return;

      const data = await res.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);

        // Jika admin, ekstrak daftar sesi unik dari pesan masuk
        if (isAdmin) {
          const sessionMap = new Map<string, { sessionId: string; userName: string; lastMessage: string; newsTitle?: string; unread: boolean; time: string }>();
          data.messages.forEach((m: DBMessage) => {
            const sid = m.session_id || 'general';
            const existing = sessionMap.get(sid);
            const isUnread = !m.is_read_by_admin && m.sender === 'user';
            if (!existing || new Date(m.created_at) > new Date(existing.time)) {
              sessionMap.set(sid, {
                sessionId: sid,
                userName: m.user_name || 'Pengguna',
                lastMessage: m.message,
                newsTitle: m.news_title || undefined,
                unread: isUnread || Boolean(existing?.unread),
                time: m.created_at,
              });
            }
          });
          setAllSessions(Array.from(sessionMap.values()));
        }
      }
    } catch {
      // ignore
    }
  }, [activeSessionId, isAdmin]);

  // Load awal dan polling tiap 3.5 detik saat chat terbuka
  useEffect(() => {
    if (!isOpen) return;

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [isOpen, fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Kirim permohonan hapus otomatis saat dibuka dengan targetNews pertama kali
  useEffect(() => {
    if (!isOpen || !targetNews || !activeSessionId || isAdmin) return;

    const autoSendDeleteRequest = async () => {
      // Cek apakah di daftar pesan sudah ada permohonan untuk berita ini
      const alreadyHas = messages.some((m) => m.news_id === targetNews.id && m.sender === 'user');
      if (alreadyHas) return;

      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const text = `Halo Admin CS, saya ${currentUser?.name || 'Penulis'} ingin mengajukan permohonan penghapusan artikel berita: "${targetNews.title}" (ID: #${targetNews.id}). Mohon bantuannya untuk diproses. Terima kasih.`;

      try {
        await fetch(`${API}/cs/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: text,
            news_id: targetNews.id,
            news_title: targetNews.title,
            session_id: activeSessionId,
            user_name: currentUser?.name || 'Penulis Portal',
            user_email: currentUser?.email || null,
          }),
        });
        fetchMessages();
      } catch {
        // ignore
      }
    };

    autoSendDeleteRequest();
  }, [isOpen, targetNews, activeSessionId, isAdmin, messages, currentUser, fetchMessages]);

  // ─── Handle Send Message (User / Admin) ──────────────────────────────────────
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = {
      message: inputText.trim(),
      news_id: targetNews?.id || null,
      news_title: targetNews?.title || null,
      session_id: activeSessionId || getOrCreateSessionId(currentUser?.id),
      user_name: isAdmin ? 'Admin Redaksi' : (currentUser?.name || 'Pengguna'),
      user_email: currentUser?.email || null,
      as_admin: isAdmin,
    };

    try {
      const res = await fetch(`${API}/cs/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setInputText('');
        await fetchMessages();
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleOpenWhatsApp = () => {
    const defaultMsg = targetNews
      ? `Halo Admin, saya ${currentUser?.name || 'Penulis'} ingin mengajukan penghapusan berita: '${targetNews.title}' (ID: ${targetNews.id}). Mohon konfirmasinya.`
      : `Halo Admin Redaksi Portal Berita, saya ${currentUser?.name || 'Pengguna'} membutuhkan bantuan terkait artikel berita.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* ── Floating Action Button (Sudut Kanan Bawah) ── */}
      <button
        id="btn-floating-customer-service"
        type="button"
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setInternalIsOpen(true);
          }
        }}
        aria-expanded={isOpen}
        aria-controls="cs-chat-panel"
        aria-label="Buka Chat Customer Service Admin"
        className={[
          'fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full px-4 py-3 shadow-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50 cursor-pointer',
          'bg-orange-600 hover:bg-orange-700 text-white active:scale-95',
          isOpen ? 'ring-4 ring-orange-500/40 scale-105' : 'hover:scale-105',
        ].join(' ')}
      >
        <div className="relative">
          <MessageCircle size={20} />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>
        <span className="font-semibold text-xs tracking-wide">
          {isAdmin ? 'CS Admin Support' : 'Customer Service'}
        </span>
      </button>

      {/* ── Popover Panel Chat CS ── */}
      {isOpen && (
        <div
          id="cs-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cs-chat-title"
          className="fixed bottom-22 right-6 z-50 w-88 sm:w-105 h-[80vh] sm:h-[580px] max-h-[85vh] flex flex-col rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-sm shadow-sm">
                <ShieldCheck size={18} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 id="cs-chat-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {isAdmin ? 'Panel Chat CS (Admin Redaksi)' : 'Customer Service Redaksi'}
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {isAdmin
                    ? 'Anda dapat membalas pesan dan menindaklanjuti permohonan user'
                    : 'Terhubung langsung dengan Admin & Redaktur'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={async () => {
                  setIsRefreshing(true);
                  await fetchMessages();
                  setIsRefreshing(false);
                }}
                title="Segarkan Pesan"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                title="Buka WhatsApp Web"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <Phone size={15} />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Tutup chat customer service"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Banner Topik Berita / Target Permohonan */}
          {targetNews && (
            <div className="px-4 py-2 border-b border-orange-200 dark:border-orange-900/40 bg-orange-50/70 dark:bg-orange-950/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span className="font-bold text-orange-700 dark:text-orange-400 shrink-0">
                  Topik Berita:
                </span>
                <span className="text-zinc-800 dark:text-zinc-200 truncate">
                  #{targetNews.id} &bull; {targetNews.title}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-orange-200 dark:border-zinc-700 shrink-0">
                <Trash2 size={10} />
                Minta Hapus
              </span>
            </div>
          )}

          {/* Area Pesan Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/40 dark:bg-zinc-950/30 text-xs sm:text-sm">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-stone-400 p-6">
                <MessageCircle size={32} className="mb-2 text-stone-300 dark:text-zinc-700" />
                <p className="font-medium text-xs">Belum ada percakapan</p>
                <p className="text-[11px] mt-1 text-stone-400">
                  Kirim pesan atau ajukan permohonan penghapusan artikel di form bawah.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUserMessage = msg.sender === 'user';
                const isBot = msg.sender === 'bot';
                const isAdminMessage = msg.sender === 'admin';

                // Posisi: jika Admin yang sedang melihat, maka pesan admin ada di kanan, pesan user ada di kiri.
                // Jika User yang sedang melihat, maka pesan user ada di kanan, pesan admin/bot ada di kiri.
                const isMe = isAdmin ? isAdminMessage : isUserMessage;

                const timeStr = new Date(msg.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-medium text-stone-400 dark:text-stone-500 mb-1 px-1">
                      <span>{msg.user_name}</span>
                      {isAdminMessage && (
                        <span className="px-1 py-0.2 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-[9px] font-bold">
                          Admin Redaksi
                        </span>
                      )}
                      {isBot && (
                        <span className="px-1 py-0.2 rounded bg-stone-200 text-stone-700 dark:bg-zinc-800 dark:text-stone-300 text-[9px] font-bold">
                          Bot CS
                        </span>
                      )}
                      <span>&bull; {timeStr}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                        isMe
                          ? 'bg-orange-600 text-white rounded-tr-none'
                          : isBot
                          ? 'bg-orange-50/80 dark:bg-orange-950/40 text-zinc-900 dark:text-zinc-100 border border-orange-200 dark:border-orange-900/50 rounded-tl-none'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700 rounded-tl-none'
                      }`}
                    >
                      {msg.news_id && (
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold mb-1 pb-1 border-b ${isMe ? 'text-orange-200 border-orange-400/40' : 'text-orange-700 dark:text-orange-400 border-stone-200 dark:border-zinc-700'}`}>
                          <Trash2 size={12} />
                          <span>Artikel #{msg.news_id}: {msg.news_title || 'Terkait Berita'}</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons untuk Pengguna */}
          {!isAdmin && (
            <div className="px-3 py-1.5 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setInputText('Berapa lama permohonan hapus diproses oleh redaksi?');
                  inputRef.current?.focus();
                }}
                className="shrink-0 px-2.5 py-1 rounded-full border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/80 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                ⏱ Estimasi Waktu?
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText('Mohon konfirmasi status artikel berita saya');
                  inputRef.current?.focus();
                }}
                className="shrink-0 px-2.5 py-1 rounded-full border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/80 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                📌 Cek Status Berita
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="shrink-0 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <Phone size={10} />
                WhatsApp
              </button>
            </div>
          )}

          {/* Input Form Balasan (Bisa dijawab oleh Admin maupun User) */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAdmin
                  ? 'Ketik balasan resmi dari Admin Redaksi...'
                  : 'Tulis pesan untuk Admin CS...'
              }
              className="flex-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
              title={isAdmin ? 'Kirim Balasan Admin' : 'Kirim Pesan'}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
