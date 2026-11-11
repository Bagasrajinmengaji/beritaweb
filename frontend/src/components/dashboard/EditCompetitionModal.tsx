'use client';

import { useState } from 'react';
import {
  Edit3,
  X,
  AlertTriangle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CompetitionDetail, Category } from '@/types/competition';

interface EditCompetitionModalProps {
  isOpen: boolean;
  competition: CompetitionDetail | null;
  categories: Category[];
  token: string | null;
  apiBaseUrl: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function EditCompetitionModalContent({
  competition,
  categories,
  token,
  apiBaseUrl,
  onClose,
  onSuccess,
}: {
  competition: CompetitionDetail;
  categories: Category[];
  token: string | null;
  apiBaseUrl: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [formData, setFormData] = useState({
    title: competition.title || '',
    category_id: competition.category?.id ? competition.category.id.toString() : '',
    organizer: competition.organizer || '',
    description: competition.description || '',
    requirements: competition.requirements || '',
    registration_deadline: competition.registration_deadline || '',
    registration_url: competition.registration_url || '',
    registration_fee: competition.registration_fee || '',
    contact: competition.contact || '',
    source_url: competition.source_url || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.title.trim()) {
      setError('Judul lomba wajib diisi.');
      return;
    }
    if (!formData.registration_url.trim()) {
      setError('Tautan pendaftaran resmi wajib diisi.');
      return;
    }

    const sanitizeUrl = (url: string) => {
      const trimmed = url.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      return `https://${trimmed}`;
    };

    const payload = {
      ...formData,
      registration_url: sanitizeUrl(formData.registration_url),
      source_url: formData.source_url ? sanitizeUrl(formData.source_url) : '',
    };

    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/competitions/${competition.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal menyimpan perubahan.');
      }

      onSuccess('Perubahan berhasil dikirimkan kembali ke Admin untuk diverifikasi ulang.');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan perbaikan.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header (Sticky) */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 px-5 py-4 bg-stone-50/50 dark:bg-zinc-950/40 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Edit3 size={18} className="text-orange-600" />
              <span>{competition.status === 'rejected' ? 'Perbaiki Pengajuan Lomba' : 'Edit Informasi Lomba'}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Perubahan akan otomatis dikirimkan kembali ke admin untuk verifikasi ulang.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Tutup form edit"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form id="editCompForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Highlight Catatan Penolakan jika ada */}
          {competition.status === 'rejected' && competition.rejection_reason && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                <AlertTriangle size={16} />
                <span>Catatan Verifikator yang Perlu Diperbaiki:</span>
              </div>
              <p className="leading-relaxed pl-5 font-medium">{competition.rejection_reason}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 pl-5 pt-0.5">
                Silakan sesuaikan kolom yang bersangkutan di bawah ini, lalu klik &ldquo;Kirim Ulang Verifikasi&rdquo;.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Judul */}
          <div>
            <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
              Judul Kompetisi / Lomba *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              required
            />
          </div>

          {/* Kategori & Penyelenggara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                Kategori Bidang *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full min-h-11 px-3 text-xs rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                Penyelenggara *
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* Biaya & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                Biaya Pendaftaran
              </label>
              <input
                type="text"
                value={formData.registration_fee}
                onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                placeholder="Gratis atau Rp 50.000"
                className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                Batas Akhir Pendaftaran (Deadline) *
              </label>
              <input
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
              Deskripsi Lengkap *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Persyaratan & Ketentuan */}
          <div>
            <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
              Persyaratan & Ketentuan Peserta
            </label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="Contoh: Mahasiswa aktif S1/D3, KTM aktif, maksimal 3 orang per tim..."
              className="w-full p-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Link Pendaftaran & Kontak */}
          <div>
            <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
              Link Formulir Pendaftaran Resmi *
            </label>
            <input
              type="text"
              value={formData.registration_url}
              onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
              placeholder="https://bit.ly/daftar-lomba atau link resmi"
              className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                Kontak Narahubung
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                placeholder="0812-xxxx-xxxx (WA)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-zinc-900 dark:text-zinc-100">
                Sumber Informasi / Web Penyelenggara
              </label>
              <input
                type="text"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </form>

        {/* Modal Footer (Sticky) */}
        <div className="p-4 sm:px-6 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-950/80 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4 rounded-xl border border-stone-300 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="editCompForm"
            disabled={isUpdating}
            className="min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
            <span>Kirim Ulang Verifikasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditCompetitionModal({
  isOpen,
  competition,
  categories,
  token,
  apiBaseUrl,
  onClose,
  onSuccess,
}: EditCompetitionModalProps) {
  if (!isOpen || !competition) return null;

  return (
    <EditCompetitionModalContent
      key={competition.id}
      competition={competition}
      categories={categories}
      token={token}
      apiBaseUrl={apiBaseUrl}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
