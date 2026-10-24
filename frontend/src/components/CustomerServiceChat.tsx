'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  User,
  ShieldCheck,
  Phone,
  CheckCheck,
  Trash2,
  HelpCircle,
  Clock,
  Sparkles,
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
  isOpen: boolean;
  onClose: () => void;
  targetNews?: NewsItemForChat | null;
  currentUser?: {
    name?: string;
    email?: string;
    role?: string | null;
  } | null;
}

const STORAGE_CHAT_KEY = 'portalberita_cs_chat_messages';

export function CustomerServiceChat({
  isOpen,
  onClose,
  targetNews,
  currentUser,
}: CustomerServiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WA ?? '6281234567890';
  const userName = currentUser?.name || 'Penulis Portal';

  // Load chat history or create greeting
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

    // Default welcome message
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const initialGreeting: ChatMessage = {
      id: 'msg-welcome',
      sender: 'admin',
      senderName: 'Admin CS Redaksi',
      text: 'Halo! Selamat datang di Customer Service Redaksi Portal Berita. Ada yang bisa kami bantu mengenai pengelolaan atau permohonan penghapusan artikel Anda?',
      time: now,
    };
    setMessages([initialGreeting]);
  }, []);

  // Simpan pesan ke session
  const saveMessages = (msgs: ChatMessage[]) => {
    setMessages(msgs);
    try {
      sessionStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs));
    } catch {
      // ignore
    }
  };

  // Scroll to bottom saat ada pesan baru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isTyping]);

  // Jika dibuka karena targetNews baru, kirim tiket permohonan hapus otomatis jika belum pernah ada
  useEffect(() => {
    if (isOpen && targetNews) {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const requestText = `Halo Admin CS, saya ${userName} ingin mengajukan penghapusan artikel berita dengan Judul: "${targetNews.title}" (ID: #${targetNews.id}). Mohon bantuannya untuk ditinjau dan dihapus. Terima kasih.`;

      // Cek apakah pesan serupa sudah pernah dikirim baru-baru ini
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

        // Trigger bot auto reply
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          const adminReply: ChatMessage = {
            id: `reply-${Date.now()}`,
            sender: 'admin',
            senderName: 'Admin CS Redaksi',
            text: `Baik kak ${userName}, permohonan penghapusan berita "${targetNews.title}" (ID: #${targetNews.id}) telah dicatat oleh sistem Redaksi. Admin kami akan segera memverifikasi dan menghapus artikel tersebut dalam waktu maksimal 1x24 jam.`,
            time: replyTime,
          };
          saveMessages([...updated, adminReply]);
        }, 1200);

        saveMessages(updated);
        return updated;
      });
    }
  }, [isOpen, targetNews, userName]);

  // Handle kirim pesan manual
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

    // Simulasi respons admin
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      let replyText = 'Terima kasih telah menghubungi Customer Service. Tim redaksi kami sedang meninjau pesan Anda.';

      if (userMsg.text.toLowerCase().includes('hapus')) {
        replyText = 'Permohonan penghapusan berita Anda telah kami teruskan ke Redaktur Pelaksana. Anda akan menerima notifikasi segera setelah artikel diproses.';
      } else if (userMsg.text.toLowerCase().includes('lama') || userMsg.text.toLowerCase().includes('kapan')) {
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

  // Quick Action: Buka WhatsApp
  const handleOpenWhatsApp = () => {
    const defaultMsg = targetNews
      ? `Halo Admin, saya ${userName} ingin mengajukan penghapusan berita dengan Judul: '${targetNews.title}' (ID: ${targetNews.id}). Mohon konfirmasinya.`
      : `Halo Admin Redaksi Portal Berita, saya ${userName} membutuhkan bantuan terkait pengelolaan artikel berita.`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cs-chat-title"
    >
      <div className="relative w-full sm:max-w-md h-[88vh] sm:h-[600px] flex flex-col rounded-t-2xl sm:rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header CS Chat */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white font-bold text-sm shadow-sm">
              <ShieldCheck size={20} />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="cs-chat-title" className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Customer Service Redaksi
                </h3>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Layanan Bantuan & Permohonan Hapus Berita
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              title="Hubungi via WhatsApp Web"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <Phone size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Target Article Banner if available */}
        {targetNews && (
          <div className="px-4 py-2 border-b border-orange-200 dark:border-orange-900/40 bg-orange-50/70 dark:bg-orange-950/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="flex-shrink-0 font-bold text-orange-700 dark:text-orange-300">
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

        {/* Message Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-50/50 dark:bg-zinc-950/40 text-xs sm:text-sm">
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 mb-1 px-1">
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
                      <span>Pengajuan Penghapusan Berita #{msg.newsId}</span>
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

        {/* Quick Action Suggestions */}
        <div className="px-3 py-2 border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
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
            Hubungi WhatsApp
          </button>
        </div>

        {/* Input Bar */}
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
            className="flex-1 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 shrink-0"
            title="Kirim Pesan"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
