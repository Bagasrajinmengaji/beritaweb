'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building2,
  GraduationCap,
  Tag,
  Link as LinkIcon,
  Phone,
  Globe,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Category, StudyProgram, CompetitionLevel } from '@/types/competition';

interface FormData {
  // Langkah 1
  title: string;
  category_id: string;
  organizer: string;
  competition_level: CompetitionLevel;

  // Langkah 2
  description: string;
  requirements: string;
  registration_deadline: string;
  study_program_ids: number[];
  selectAllPrograms: boolean;
  registration_fee: string;

  // Langkah 3
  posterFile: File | null;
  posterPreview: string | null;
  registration_url: string;
  contact: string;
  source_url: string;
}

export default function TambahLombaPage() {
  const router = useRouter();

  // State Auth
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // State Stepper (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Master Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);

  // Form State
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category_id: '',
    organizer: '',
    competition_level: 'Nasional',
    description: '',
    requirements: '',
    registration_deadline: '',
    study_program_ids: [],
    selectAllPrograms: false,
    registration_fee: '',
    posterFile: null,
    posterPreview: null,
    registration_url: '',
    contact: '',
    source_url: '',
  });

  // State Validasi & Pengiriman
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // 1. Cek autentikasi & ambil master data
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!savedToken) {
      setIsLoggedIn(false);
      return;
    }
    setToken(savedToken);
    setIsLoggedIn(true);

    // Ambil master kategori & prodi
    Promise.all([
      fetch(`${API}/categories`).then((r) => (r.ok ? r.json() : { data: [] })),
      fetch(`${API}/study-programs`).then((r) => (r.ok ? r.json() : { data: [] })),
    ])
      .then(([catRes, prodiRes]) => {
        setCategories(catRes.data || []);
        setStudyPrograms(prodiRes.data || []);
      })
      .catch((err) => console.error('Error fetching master data:', err));
  }, [API]);

  // Handle Input Perubahan Teks
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error field jika sudah diisi
    if (stepErrors[name]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Handle Checkbox Program Studi
  const handleToggleProdi = (id: number) => {
    setFormData((prev) => {
      const exists = prev.study_program_ids.includes(id);
      const nextIds = exists
        ? prev.study_program_ids.filter((item) => item !== id)
        : [...prev.study_program_ids, id];

      return {
        ...prev,
        study_program_ids: nextIds,
        selectAllPrograms: nextIds.length === studyPrograms.length,
      };
    });

    if (stepErrors.study_program_ids) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next.study_program_ids;
        return next;
      });
    }
  };

  // Handle "Pilih Semua Program Studi"
  const handleToggleSelectAll = () => {
    setFormData((prev) => {
      if (prev.selectAllPrograms) {
        return {
          ...prev,
          selectAllPrograms: false,
          study_program_ids: [],
        };
      } else {
        return {
          ...prev,
          selectAllPrograms: true,
          study_program_ids: studyPrograms.map((p) => p.id),
        };
      }
    });

    if (stepErrors.study_program_ids) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next.study_program_ids;
        return next;
      });
    }
  };

  // Handle Upload Poster
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStepErrors((prev) => ({ ...prev, posterFile: 'File harus berupa gambar (JPG, PNG, atau WebP).' }));
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setStepErrors((prev) => ({ ...prev, posterFile: 'Ukuran file gambar maksimal 3 MB.' }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      posterFile: file,
      posterPreview: previewUrl,
    }));

    setStepErrors((prev) => {
      const next = { ...prev };
      delete next.posterFile;
      return next;
    });
  };

  const handleRemovePoster = () => {
    setFormData((prev) => ({
      ...prev,
      posterFile: null,
      posterPreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validasi Step 1
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Judul lomba wajib diisi.';
    if (!formData.category_id) errors.category_id = 'Pilih salah satu kategori lomba.';
    if (!formData.organizer.trim()) errors.organizer = 'Nama penyelenggara wajib diisi.';
    if (!formData.competition_level) errors.competition_level = 'Pilih tingkat kompetisi.';

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validasi Step 2
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.description.trim()) {
      errors.description = 'Deskripsi lomba wajib diisi.';
    } else if (formData.description.trim().length < 20) {
      errors.description = 'Deskripsi minimal 20 karakter agar jelas bagi mahasiswa.';
    }

    if (!formData.registration_deadline) {
      errors.registration_deadline = 'Batas akhir pendaftaran (deadline) wajib diisi.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(formData.registration_deadline);
      if (selected < today) {
        errors.registration_deadline = 'Batas akhir pendaftaran tidak boleh tanggal yang sudah lewat.';
      }
    }

    if (formData.study_program_ids.length === 0) {
      errors.study_program_ids = 'Pilih minimal satu program studi yang sesuai.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validasi Step 3
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.registration_url.trim()) {
      errors.registration_url = 'Tautan pendaftaran resmi wajib diisi.';
    } else if (!/^https?:\/\/.+/i.test(formData.registration_url.trim())) {
      errors.registration_url = 'Tautan harus diawali dengan http:// atau https://';
    }

    if (formData.source_url.trim() && !/^https?:\/\/.+/i.test(formData.source_url.trim())) {
      errors.source_url = 'Tautan sumber informasi harus diawali dengan http:// atau https://';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Tombol Lanjut
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tombol Kembali
  const handlePrevStep = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Form ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setServerError(null);

    const postPayload = new window.FormData();
    postPayload.append('title', formData.title.trim());
    postPayload.append('category_id', formData.category_id);
    postPayload.append('organizer', formData.organizer.trim());
    postPayload.append('competition_level', formData.competition_level);
    postPayload.append('description', formData.description.trim());
    if (formData.requirements.trim()) {
      postPayload.append('requirements', formData.requirements.trim());
    }
    postPayload.append('registration_deadline', formData.registration_deadline);
    postPayload.append('registration_url', formData.registration_url.trim());
    if (formData.registration_fee.trim()) {
      postPayload.append('registration_fee', formData.registration_fee.trim());
    } else {
      postPayload.append('registration_fee', 'Gratis');
    }
    if (formData.contact.trim()) {
      postPayload.append('contact', formData.contact.trim());
    }
    if (formData.source_url.trim()) {
      postPayload.append('source_url', formData.source_url.trim());
    }
    if (formData.posterFile) {
      postPayload.append('poster', formData.posterFile);
    }

    formData.study_program_ids.forEach((id) => {
      postPayload.append('study_program_ids[]', id.toString());
    });

    try {
      const res = await fetch(`${API}/competitions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: postPayload,
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.errors) {
          const firstError = Object.values(json.errors)[0] as string[];
          throw new Error(firstError[0] || 'Validasi pengajuan gagal.');
        }
        throw new Error(json.message || 'Gagal mengirim informasi lomba.');
      }

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setServerError(err instanceof Error ? err.message : 'Terjadi kendala saat mengirim informasi lomba.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Tampilan Jika Belum Login ───
  if (isLoggedIn === false) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Masuk Diperlukan
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Untuk menjaga keaslian dan kredibilitas informasi lomba kampus, Anda harus masuk ke akun mahasiswa sebelum mengajukan lomba baru.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/login"
              className="min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Masuk Akun</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/register"
              className="min-h-11 px-5 rounded-xl border border-stone-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:border-orange-500 transition-colors flex items-center justify-center"
            >
              <span>Daftar Akun Baru</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Tampilan Sukses Pengiriman ───
  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-5 p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold">
              <Sparkles size={13} />
              <span>Status: Menunggu Verifikasi Admin</span>
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Pengajuan Lomba Berhasil Terkirim!
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Terima kasih telah berkontribusi membagikan peluang lomba untuk mahasiswa UMPKU Surakarta. Informasi ini akan diverifikasi oleh admin sebelum tampil ke publik.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="min-h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Pantau di Dashboard Saya</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/lomba"
              className="min-h-11 px-5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:border-orange-500 transition-colors flex items-center justify-center"
            >
              <span>Kembali ke Katalog</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ─── Tampilan Form Multi-Step ───
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 py-10 pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header Form */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-semibold">
            <Trophy size={14} />
            <span>Form Pengajuan Lomba Mahasiswa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Bagikan Informasi Kompetisi
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Lengkapi formulir 3 langkah di bawah ini dengan informasi yang valid dan jelas.
          </p>
        </div>

        {/* ── Stepper Indicator ── */}
        <nav aria-label="Progres Formulir" className="mb-10">
          <ol className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { step: 1, title: 'Informasi Dasar', icon: Trophy },
              { step: 2, title: 'Ketentuan & Sasaran', icon: GraduationCap },
              { step: 3, title: 'Poster & Pendaftaran', icon: Upload },
            ].map((s) => {
              const isCompleted = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              const Icon = s.icon;

              return (
                <li
                  key={s.step}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    isCurrent
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 shadow-xs'
                      : isCompleted
                      ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-400'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-orange-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : s.step}
                  </span>
                  <div className="hidden sm:block truncate">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Langkah {s.step}
                    </p>
                    <p className="text-xs font-bold truncate">{s.title}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Error Server */}
        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">Gagal Mengirim Formulir</p>
              <p className="text-xs mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* ── Form Body Card ── */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* ══════════════════════════════════════════════════════════════════
              LANGKAH 1 — INFORMASI DASAR
             ══════════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Langkah 1: Informasi Dasar Lomba
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Masukkan identitas utama dan tingkat kompetisi.
                </p>
              </div>

              {/* Judul Lomba */}
              <div>
                <label htmlFor="input-title" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Judul Lomba <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: National UI/UX Design Competition 2026"
                  className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                {stepErrors.title && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.title}</span>
                  </p>
                )}
              </div>

              {/* Kategori Lomba & Tingkat Kompetisi (Grid 2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kategori */}
                <div>
                  <label htmlFor="select-category" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Kategori Lomba <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-category"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {stepErrors.category_id && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{stepErrors.category_id}</span>
                    </p>
                  )}
                </div>

                {/* Tingkat */}
                <div>
                  <label htmlFor="select-level" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Tingkat Kompetisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-level"
                    name="competition_level"
                    value={formData.competition_level}
                    onChange={handleChange}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="Internasional">Internasional</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Regional">Regional</option>
                    <option value="Internal Kampus">Internal Kampus</option>
                  </select>
                </div>
              </div>

              {/* Nama Penyelenggara */}
              <div>
                <label htmlFor="input-organizer" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Penyelenggara Lomba <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-organizer"
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Gadjah Mada / BEM UMPKU"
                  className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                {stepErrors.organizer && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.organizer}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              LANGKAH 2 — KETENTUAN DAN SASARAN
             ══════════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Langkah 2: Ketentuan & Sasaran Peserta
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Jelaskan deskripsi, batas deadline, dan jurusan program studi sasaran.
                </p>
              </div>

              {/* Deskripsi Lomba */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-desc" className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Deskripsi Lomba <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-500">
                    {formData.description.length} karakter (min. 20)
                  </span>
                </div>
                <textarea
                  id="input-desc"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Jelaskan mengenai lomba, tema, tahapan lomba, dan hadiah secara ringkas..."
                  className="w-full p-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                {stepErrors.description && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.description}</span>
                  </p>
                )}
              </div>

              {/* Persyaratan Peserta */}
              <div>
                <label htmlFor="input-req" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Persyaratan Peserta <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  id="input-req"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Contoh: Mahasiswa aktif D3/S1, melampirkan KTM, 1 tim beranggotakan 2-3 orang..."
                  className="w-full p-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Batas Akhir & Biaya (Grid 2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Batas Akhir Pendaftaran */}
                <div>
                  <label htmlFor="input-deadline" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Batas Akhir Pendaftaran (Deadline) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-deadline"
                    type="date"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleChange}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                  {stepErrors.registration_deadline && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{stepErrors.registration_deadline}</span>
                    </p>
                  )}
                </div>

                {/* Biaya Pendaftaran */}
                <div>
                  <label htmlFor="input-fee" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Biaya Pendaftaran <span className="text-stone-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    id="input-fee"
                    type="text"
                    name="registration_fee"
                    value={formData.registration_fee}
                    onChange={handleChange}
                    placeholder="Contoh: Gratis atau Rp 50.000"
                    className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Program Studi Sasaran (Pilihan Checkbox) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Program Studi yang Sesuai (UMPKU Surakarta) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    {formData.selectAllPrograms ? 'Batal Pilih Semua' : 'Pilih Semua Jurusan'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 max-h-56 overflow-y-auto">
                  {studyPrograms.map((prodi) => {
                    const isChecked = formData.study_program_ids.includes(prodi.id);
                    return (
                      <label
                        key={prodi.id}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-orange-100/70 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 font-semibold'
                            : 'hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProdi(prodi.id)}
                          className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                        />
                        <span>{prodi.name}</span>
                      </label>
                    );
                  })}
                </div>
                {stepErrors.study_program_ids && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.study_program_ids}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              LANGKAH 3 — POSTER DAN PENDAFTARAN
             ══════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Langkah 3: Poster & Tautan Pendaftaran
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Unggah poster resmi dan lampirkan link pendaftaran sebelum mengirim.
                </p>
              </div>

              {/* Upload Poster Lomba */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Poster Lomba <span className="text-stone-400 font-normal">(Opsional, Disarankan)</span>
                </label>

                {formData.posterPreview ? (
                  <div className="relative aspect-16/10 max-w-sm rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 shadow-xs">
                    <Image
                      src={formData.posterPreview}
                      alt="Preview poster lomba"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePoster}
                      className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-colors"
                      title="Hapus poster"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-stone-50/50 dark:bg-zinc-800/30"
                  >
                    <Upload size={28} className="mx-auto text-orange-500 mb-2" />
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Klik atau seret file gambar poster ke sini
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Format JPG, JPEG, PNG, atau WebP (Maksimal 3 MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
                {stepErrors.posterFile && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.posterFile}</span>
                  </p>
                )}
              </div>

              {/* Tautan Pendaftaran Resmi */}
              <div>
                <label htmlFor="input-reg-url" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Link Pendaftaran Resmi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-reg-url"
                    type="url"
                    name="registration_url"
                    value={formData.registration_url}
                    onChange={handleChange}
                    placeholder="https://docs.google.com/forms/... atau https://lomba.com/daftar"
                    className="w-full min-h-11 pl-10 pr-4 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
                {stepErrors.registration_url && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.registration_url}</span>
                  </p>
                )}
              </div>

              {/* Kontak & Sumber Informasi (Grid 2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="input-contact" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Kontak Narahubung Panitia <span className="text-stone-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    id="input-contact"
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Contoh: 0812-3456-7890 (WA) / info@lomba.com"
                    className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-source" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Tautan Sumber Informasi <span className="text-stone-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    id="input-source"
                    type="url"
                    name="source_url"
                    value={formData.source_url}
                    onChange={handleChange}
                    placeholder="https://instagram.com/p/..."
                    className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                  />
                  {stepErrors.source_url && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{stepErrors.source_url}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Ringkasan Sebelum Kirim (Review Card Sesuai Superprompt) ── */}
              <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-zinc-800/60 border border-orange-200/80 dark:border-zinc-700 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">
                  Ringkasan Pengajuan:
                </p>
                <div className="text-xs space-y-1 text-stone-700 dark:text-stone-300">
                  <p>
                    <strong>Judul:</strong> {formData.title || '-'}
                  </p>
                  <p>
                    <strong>Penyelenggara:</strong> {formData.organizer || '-'} ({formData.competition_level})
                  </p>
                  <p>
                    <strong>Deadline:</strong> {formData.registration_deadline || '-'}
                  </p>
                  <p>
                    <strong>Jumlah Prodi Sasaran:</strong> {formData.study_program_ids.length} program studi dipilih
                  </p>
                  <p className="pt-1 font-semibold text-amber-700 dark:text-amber-400">
                    Status awal: Menunggu Verifikasi Admin
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed italic text-center">
                Informasi lomba akan diperiksa dan dimoderasi oleh admin sebelum ditampilkan secara resmi kepada pengunjung.
              </p>
            </div>
          )}

          {/* ── Navigasi Tombol Stepper ── */}
          <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="min-h-11 px-5 rounded-xl border border-stone-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft size={14} />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="min-h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Lanjut ke Langkah {currentStep + 1}</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 px-7 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim untuk Diperiksa</span>
                    <CheckCircle2 size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}

