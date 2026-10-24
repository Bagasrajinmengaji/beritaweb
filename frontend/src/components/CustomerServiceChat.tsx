'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ShieldCheck,
  Phone,
  Trash2,
} from 'lucide-react';

export interface NewsItemForChat {
  id: number;
  title: string;
  author?: string | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  time: string;
  isDeleteRequest?: boolean;
  newsId?: number;
}

interface CustomerServiceChatProps {
  isOpen?: boolean;
  onClose?: () => void;
  targetNews?: NewsItemForChat | null;
}

const STORAGE_CHAT_KEY = 'portalberita_cs_chat_messages';

export function CustomerServiceChat({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  targetNews: controlledTargetNews,
}: CustomerServiceChatProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [targetNews, setTargetNews] = useState<NewsItemForChat | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string; role?: string | null } | null>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WA ?? '6281234567890';

  // Sinkronisasi data user dari localStorage
  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem('user') || localStorage.getItem('auth_user');
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        } else {
          setCurrentUser(null);
        }
      } catch {
        // ignore
      }
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('authChange', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('authChange', syncUser);
    };
  }, []);

  const userName = currentUser?.name || 'Penulis Portal';

  // Listener event global 'openCSChat' agar bisa dipicu dari tombol mana pun (misal tombol "Minta Hapus" di tabel)
  useEffect(() => {
    const handleGlobalOpen = (e: Event) => {
      const customEvt = e as CustomEvent<{ targetNews?: NewsItemForChat }>;
      if (customEvt.detail?.targetNews) {
        setTargetNews(customEvt.detail.targetNews);
      }
      if (isControlled && controlledOnClose) {
        // if controlled, still set state
      } else {
        setInternalIsOpen(true);
      }
    };

    window.addEventListener('openCSChat', handleGlobalOpen as EventListener);
    return () => {
      window.removeEventListener('openCSChat', handleGlobalOpen as EventListener);
    };
  }, [isControlled, controlledOnClose]);

  // Update targetNews saat prop controlled berubah
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

  // Muat riwayat chat dari sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
        return;
      }
    } catch {
      // ignore
    }

    // Sambutan awal otomatis dari CS Admin
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const initialGreeting: ChatMessage = {
      id: 'msg-welcome',
      sender: 'admin',
      senderName: 'Admin CS Redaksi',
      text: 'Halo! Selamat datang di Customer Service Redaksi Portal Berita. Ada yang bisa kami bantu mengenai publikasi atau permohonan penghapusan artikel Anda?',
      time: now,
    };
    setMessages([initialGreeting]);
  }, []);

  const saveMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    try {
      sessionStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isTyping]);

  // Otomatis kirim pesan template pengajuan hapus ketika dibuka dengan targetNews
  useEffect(() => {
    if (isOpen && targetNews) {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const requestText = `Halo Admin CS, saya ${userName} ingin mengajukan penghapusan artikel berita dengan Judul: "${targetNews.title}" (ID: #${targetNews.id}). Mohon bantuannya untuk ditinjau dan dihapus. Terima kasih.`;

      setMessages((prev) => {
        const alreadySent = prev.some(
          (m) => m.isDeleteRequest && m.newsId === targetNews.id
        );
        if (alreadySent) return prev;

        const userMsg: ChatMessage = {
          id: `req-${Date.now()}`,
          sender: 'user',
          senderName: userName,
          text: requestText,
          time: now,
          isDeleteRequest: true,
          newsId: targetNews.id,
        };

        const updated = [...prev, userMsg];

        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          const adminReply: ChatMessage = {
            id: `reply-${Date.now()}`,
            sender: 'admin',
            senderName: 'Admin CS Redaksi',
            text: `Baik kak ${userName}, permohonan penghapusan artikel "${targetNews.title}" (ID: #${targetNews.id}) telah kami terima. Tim redaksi akan memverifikasi dan memprosesnya dalam 1x24 jam.`,
            time: replyTime,
          };
          saveMessages([...updated, adminReply]);
        }, 1200);

        saveMessages(updated);
        return updated;
      });
    }
  }, [isOpen, targetNews, userName]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      senderName: userName,
      text: inputText.trim(),
      time: now,
    };

    const updated = [...messages, userMsg];
    saveMessages(updated);
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      let replyText = 'Terima kasih telah menghubungi Customer Service. Tim redaksi kami sedang meninjau pesan Anda.';

      const lower = userMsg.text.toLowerCase();
      if (lower.includes('hapus')) {
        replyText = 'Permohonan penghapusan berita Anda telah kami catat. Redaktur kami akan segera mengevaluasi artikel tersebut.';
      } else if (lower.includes('lama') || lower.includes('kapan') || lower.includes('waktu')) {
        replyText = 'Proses verifikasi dan penghapusan artikel biasanya memakan waktu antara 10 menit hingga maksimal 1x24 jam pada hari kerja.';
      }

      const adminReply: ChatMessage = {
        id: `adm-${Date.now()}`,
        sender: 'admin',
        senderName: 'Admin CS Redaksi',
        text: replyText,
        time: replyTime,
      };
      saveMessages([...updated, adminReply]);
    }, 1000);
  };

  const handleOpenWhatsApp = () => {
    const defaultMsg = targetNews
      ? `Halo Admin, saya ${userName} ingin mengajukan penghapusan berita dengan Judul: '${targetNews.title}' (ID: ${targetNews.id}). Mohon konfirmasinya.`
      : `Halo Admin Redaksi Portal Berita, saya ${userName} membutuhkan bantuan terkait pengelolaan artikel berita.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* ── Floating Action Button (Sudut Kanan Bawah, Mengambang Seperti Aksesibilitas) ── */}
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
          Customer Service
        </span>
      </button>

      {/* ── Popover Panel Chat CS ── */}
      {isOpen && (
        <div
          id="cs-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cs-chat-title"
          className="fixed bottom-22 right-6 z-50 w-88 sm:w-96 h-[80vh] sm:h-[550px] max-h-[85vh] flex flex-col rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
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
                    CS Redaksi
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Konsultasi & Permohonan Hapus Berita
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
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

          {/* Banner Topik Berita jika ada target */}
          {targetNews && (
            <div className="px-4 py-2 border-b border-orange-200 dark:border-orange-900/40 bg-orange-50/70 dark:bg-orange-950/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span className="font-bold text-orange-700 dark:text-orange-400 shrink-0">
                  Topik:
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
            {messages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 mb-1 px-1">
                    {msg.senderName} &bull; {msg.time}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                      isMe
                        ? 'bg-orange-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700 rounded-tl-none'
                    }`}
                  >
                    {msg.isDeleteRequest && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-200 mb-1 pb-1 border-b border-orange-400/40">
                        <Trash2 size={12} />
                        <span>Pengajuan Hapus Artikel #{msg.newsId}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-stone-400 text-xs px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce delay-100" />
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce delay-200" />
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 ml-1">
                  Admin sedang mengetik...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons */}
          <div className="px-3 py-1.5 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setInputText('Berapa lama permohonan hapus diproses?');
                inputRef.current?.focus();
              }}
              className="shrink-0 px-2.5 py-1 rounded-full border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/80 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              ⏱ Estimasi Waktu?
            </button>
            <button
              type="button"
              onClick={() => {
                setInputText('Mohon konfirmasi status artikel saya');
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

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan untuk Admin CS..."
              className="flex-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
              title="Kirim Pesan"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
