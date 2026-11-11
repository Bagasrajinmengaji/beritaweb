'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Users,
  User,
  Coins,
  HelpCircle,
  Edit2,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Category, StudyProgram, CompetitionLevel } from '@/types/competition';

type ParticipationType = 'Individu' | 'Tim' | 'Individu & Tim';

interface FormData {
  // Langkah 1
  title: string;
  category_id: string;
  organizer: string;
  competition_level: CompetitionLevel | '';
  participation_type: ParticipationType;

  // Langkah 2
  description: string;
  requirements: string;
  registration_deadline: string;
  study_program_ids: number[];
  selectAllPrograms: boolean;
  is_free: boolean;
  fee_amount: string;
  registration_fee: string;

  // Langkah 3
  posterFile: File | null;
  posterPreview: string | null;
  registration_url: string;
  contact: string;
  source_url: string;
}

const DRAFT_STORAGE_KEY = 'umpku_lomba_form_draft_v2';

const INITIAL_FORM_DATA: FormData = {
  title: '',
  category_id: '',
  organizer: '',
  competition_level: '',
  participation_type: 'Individu & Tim',
  description: '',
  requirements: '',
  registration_deadline: '',
  study_program_ids: [],
  selectAllPrograms: false,
  is_free: true,
  fee_amount: '',
  registration_fee: 'Gratis',
  posterFile: null,
  posterPreview: null,
  registration_url: '',
  contact: '',
  source_url: '',
};

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
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
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [hasDraftRestored, setHasDraftRestored] = useState<boolean>(false);

  // State Validasi & Pengiriman
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

  // 1. Cek autentikasi & ambil master data + cek draft lokal
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!savedToken) {
      setIsLoggedIn(false);
      return;
    }
    setToken(savedToken);
    setIsLoggedIn(true);

    // Ambil master data Kategori dan Program Studi UMPKU
    Promise.all([
      fetch(`${API}/categories`).then((r) => (r.ok ? r.json() : { data: [] })),
      fetch(`${API}/study-programs`).then((r) => (r.ok ? r.json() : { data: [] })),
    ])
      .then(([catRes, prodiRes]) => {
        setCategories(catRes.data || []);
        setStudyPrograms(prodiRes.data || []);
      })
      .catch((err) => console.error('Error fetching master data:', err));

    // Periksa apakah ada draft tersimpan
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // Validasi struktur minimal draft
        if (parsed && (parsed.title || parsed.description || parsed.organizer)) {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            posterFile: null,
            posterPreview: null, // File objek tidak disimpan di localStorage
          }));
          setHasDraftRestored(true);
        }
      }
    } catch {
      // Abaikan jika draft corrupt
    }
  }, [API]);

  // 2. Auto-save draft ke localStorage setiap ada perubahan form (kecuali poster file)
  useEffect(() => {
    if (!isLoggedIn || submitSuccess) return;

    // Cek apakah ada data yang sudah diisi sebelum menyimpan
    const isDirty = Boolean(
      formData.title ||
      formData.organizer ||
      formData.category_id ||
      formData.description ||
      formData.requirements ||
      formData.registration_deadline ||
      formData.registration_url ||
      formData.study_program_ids.length > 0
    );

    if (isDirty) {
      const draftToSave = {
        title: formData.title,
        category_id: formData.category_id,
        organizer: formData.organizer,
        competition_level: formData.competition_level,
        participation_type: formData.participation_type,
        description: formData.description,
        requirements: formData.requirements,
        registration_deadline: formData.registration_deadline,
        study_program_ids: formData.study_program_ids,
        selectAllPrograms: formData.selectAllPrograms,
        is_free: formData.is_free,
        fee_amount: formData.fee_amount,
        registration_fee: formData.registration_fee,
        registration_url: formData.registration_url,
        contact: formData.contact,
        source_url: formData.source_url,
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftToSave));
      } catch {
        // Kuota storage penuh
      }
    }
  }, [formData, isLoggedIn, submitSuccess]);

  // 3. Peringatan beforeunload jika form belum dikirim
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasContent = Boolean(formData.title.trim() || formData.description.trim());
      if (hasContent && !submitSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData.title, formData.description, submitSuccess]);

  // Reset Draft secara manual
  const handleResetDraft = () => {
    if (confirm('Apakah Anda yakin ingin menghapus draft yang tersimpan dan memulai formulir dari awal?')) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setFormData(INITIAL_FORM_DATA);
      setHasDraftRestored(false);
      setStepErrors({});
      setCurrentStep(1);
    }
  };

  // Handle Input Perubahan Field Biasa
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus pesan error field yang bersangkutan
    if (stepErrors[name]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Handle Toggle Program Studi
  const handleToggleProdi = (id: number) => {
    setFormData((prev) => {
      const exists = prev.study_program_ids.includes(id);
      const nextIds = exists
        ? prev.study_program_ids.filter((item) => item !== id)
        : [...prev.study_program_ids, id];

      return {
        ...prev,
        study_program_ids: nextIds,
        selectAllPrograms: studyPrograms.length > 0 && nextIds.length === studyPrograms.length,
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

  // Handle Toggle Biaya (Gratis vs Berbayar)
  const handleToggleIsFree = (isFree: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_free: isFree,
      registration_fee: isFree ? 'Gratis' : prev.fee_amount.trim() ? `Rp ${prev.fee_amount.trim()}` : 'Berbayar',
    }));
  };

  const handleFeeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fee_amount: val,
      registration_fee: prev.is_free ? 'Gratis' : val.trim() ? `Rp ${val.trim()}` : 'Berbayar',
    }));
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
    if (!formData.title.trim()) {
      errors.title = 'Judul lomba wajib diisi.';
    } else if (formData.title.trim().length < 5) {
      errors.title = 'Judul lomba terlalu pendek (minimal 5 karakter).';
    }

    if (!formData.category_id) {
      errors.category_id = 'Pilih salah satu kategori lomba yang sesuai.';
    }

    if (!formData.competition_level) {
      errors.competition_level = 'Pilih tingkat kompetisi (Internasional, Nasional, dll).';
    }

    if (!formData.organizer.trim()) {
      errors.organizer = 'Nama penyelenggara lomba wajib diisi.';
    }

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
      errors.study_program_ids = 'Pilih minimal satu program studi sasaran.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validasi Step 3
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    const sanitizedRegUrl = sanitizeUrl(formData.registration_url);

    if (!sanitizedRegUrl) {
      errors.registration_url = 'Tautan pendaftaran resmi wajib diisi.';
    } else if (!/^https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/i.test(sanitizedRegUrl)) {
      errors.registration_url = 'Format tautan pendaftaran tidak valid (contoh: https://umpku.ac.id/daftar).';
    }

    if (formData.source_url.trim()) {
      const sanitizedSourceUrl = sanitizeUrl(formData.source_url);
      if (!/^https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/i.test(sanitizedSourceUrl)) {
        errors.source_url = 'Format tautan sumber informasi tidak valid.';
      }
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

    const cleanRegUrl = sanitizeUrl(formData.registration_url);
    const cleanSourceUrl = formData.source_url.trim() ? sanitizeUrl(formData.source_url) : '';

    // Gabungkan tipe kepesertaan ke dalam requirements jika ada
    let finalRequirements = formData.requirements.trim();
    if (formData.participation_type) {
      const prefix = `[Format Peserta: ${formData.participation_type}]`;
      if (!finalRequirements.includes(prefix)) {
        finalRequirements = finalRequirements ? `${prefix}\n${finalRequirements}` : prefix;
      }
    }

    const postPayload = new window.FormData();
    postPayload.append('title', formData.title.trim());
    postPayload.append('category_id', formData.category_id);
    postPayload.append('organizer', formData.organizer.trim());
    postPayload.append('competition_level', formData.competition_level);
    postPayload.append('description', formData.description.trim());
    if (finalRequirements) {
      postPayload.append('requirements', finalRequirements);
    }
    postPayload.append('registration_deadline', formData.registration_deadline);
    postPayload.append('registration_url', cleanRegUrl);

    // Biaya pendaftaran
    if (formData.is_free) {
      postPayload.append('registration_fee', 'Gratis');
    } else if (formData.fee_amount.trim()) {
      postPayload.append('registration_fee', `Rp ${formData.fee_amount.trim()}`);
    } else {
      postPayload.append('registration_fee', 'Berbayar');
    }

    if (formData.contact.trim()) {
      postPayload.append('contact', formData.contact.trim());
    }
    if (cleanSourceUrl) {
      postPayload.append('source_url', cleanSourceUrl);
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

      // Bersihkan draft setelah sukses submit
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setServerError(err instanceof Error ? err.message : 'Terjadi kendala saat mengirim informasi lomba.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper untuk mendapatkan nama kategori
  const selectedCategoryName = categories.find((c) => c.id.toString() === formData.category_id)?.name || '-';
  // Helper untuk mendapatkan nama-nama prodi terpilih
  const selectedProdiNames = studyPrograms.filter((p) => formData.study_program_ids.includes(p.id));

  // ─── Tampilan Jika Belum Login ───
  if (isLoggedIn === false) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Masuk Akun Diperlukan
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Untuk menjaga keaslian dan kredibilitas informasi lomba kampus, Anda harus masuk ke akun mahasiswa sebelum mengajukan informasi lomba.
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
              Terima kasih telah berkontribusi membagikan peluang lomba untuk mahasiswa UMPKU Surakarta. Informasi lomba Anda telah dicatat dan akan ditinjau oleh tim kurator admin.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 text-left text-xs space-y-2 text-stone-600 dark:text-stone-300">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Info size={14} className="text-orange-500" />
              <span>Tahapan Selanjutnya:</span>
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Admin Kemahasiswaan akan memeriksa kejelasan informasi, tanggal, dan tautan pendaftaran dalam 1x24 jam kerja.</li>
              <li>Jika disetujui, lomba langsung tampil di katalog publik website.</li>
              <li>Jika memerlukan revisi, Anda akan menerima catatan perbaikan dan dapat langsung memperbaikinya dari dashboard.</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
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
            Lengkapi formulir 3 langkah di bawah ini dengan informasi yang akurat dan jelas untuk mahasiswa UMPKU.
          </p>
        </div>

        {/* ── Banner Pemulihan Draft Tersimpan ── */}
        {hasDraftRestored && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Draft tersimpan dimuat otomatis.</strong> Data isian Anda yang belum sempat dikirim telah dipulihkan.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetDraft}
              className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Formulir</span>
            </button>
          </div>
        )}

        {/* ── Stepper Indicator ── */}
        <nav aria-label="Progres Formulir" className="mb-8">
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
                  onClick={() => {
                    // Izinkan navigasi mundur langsung jika sudah pernah dilewati
                    if (s.step < currentStep) {
                      setCurrentStep(s.step);
                    }
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    s.step < currentStep ? 'cursor-pointer hover:border-orange-400' : ''
                  } ${
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
                  Tentukan judul lengkap, bidang kategori, dan tingkat kompetisi.
                </p>
              </div>

              {/* Judul Lomba */}
              <div>
                <label htmlFor="input-title" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Judul Lengkap Lomba <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Lomba Karya Tulis Ilmiah Nasional (LKTIN) Medika 2026"
                  className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Tips: Cantumkan nama resmi kompetisi beserta tahun pelaksanaannya.
                </p>
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
                    Kategori Bidang Lomba <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-category"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full min-h-11 px-3 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">-- Pilih Kategori Bidang --</option>
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

                {/* Tingkat Kompetisi (Dengan Placeholder Wajib) */}
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
                    <option value="">-- Pilih Tingkat Kompetisi --</option>
                    <option value="Internasional">Internasional (Global)</option>
                    <option value="Nasional">Nasional (Antar Perguruan Tinggi)</option>
                    <option value="Provinsi">Provinsi / Wilayah</option>
                    <option value="Regional">Regional (Jawa Tengah / Soloraya)</option>
                    <option value="Internal Kampus">Internal Kampus (Khusus UMPKU)</option>
                  </select>
                  {stepErrors.competition_level && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{stepErrors.competition_level}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Nama Penyelenggara */}
              <div>
                <label htmlFor="input-organizer" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Institusi / Penyelenggara Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-organizer"
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Gadjah Mada / BEM KM UMPKU Surakarta"
                  className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Tips: Tuliskan nama universitas, kementerian, BUMN, atau organisasi penyelenggara.
                </p>
                {stepErrors.organizer && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{stepErrors.organizer}</span>
                  </p>
                )}
              </div>

              {/* Tipe Kepesertaan (Individu vs Tim) */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                  Format Kepesertaan Lomba
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { type: 'Individu', label: 'Individu', desc: 'Perorangan', icon: User },
                    { type: 'Tim', label: 'Tim / Kelompok', desc: 'Regu / Grup', icon: Users },
                    { type: 'Individu & Tim', label: 'Keduanya', desc: 'Bisa Solo / Tim', icon: Sparkles },
                  ].map((item) => {
                    const isSelected = formData.participation_type === item.type;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, participation_type: item.type as ParticipationType }))}
                        className={`min-h-12 p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 font-bold ring-1 ring-orange-500'
                            : 'border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-stone-400'} />
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] text-stone-500 font-normal">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
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
                  Rincikan deskripsi, batas deadline pendaftaran, biaya, dan jurusan sasaran.
                </p>
              </div>

              {/* Deskripsi Lomba */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-desc" className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    Deskripsi Lengkap Lomba <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-500">
                    {formData.description.length} karakter (min. 20)
                  </span>
                </div>

                {/* Tips Deskripsi */}
                <div className="mb-2 p-2.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 text-[11px] text-orange-800 dark:text-orange-300 flex items-start gap-2">
                  <HelpCircle size={14} className="shrink-0 text-orange-600 mt-0.5" />
                  <span>
                    <strong>Tips Penulisan:</strong> Sebutkan tema kompetisi, tahapan babak (penyisihan & final), benefit sertifikat/uang tunai, serta gambaran teknis karya yang dilombakan.
                  </span>
                </div>

                <textarea
                  id="input-desc"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Contoh: Kompetisi ini mengajak mahasiswa untuk mengemukakan inovasi teknologi medis berbasis Internet of Things (IoT). Terdiri dari babak pengumpulan karya, penilaian juri, dan presentasi final dengan total hadiah Rp 25.000.000..."
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
                  Persyaratan & Ketentuan Peserta <span className="text-stone-400 font-normal">(Disarankan)</span>
                </label>
                <textarea
                  id="input-req"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Contoh:&#10;1. Mahasiswa aktif D3/D4/S1 dibuktikan dengan Kartu Tanda Mahasiswa (KTM).&#10;2. Satu tim terdiri dari 2-3 orang (boleh lintas jurusan).&#10;3. Karya orisinal dan belum pernah memenangkan kompetisi serupa."
                  className="w-full p-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Batas Akhir & Biaya (Grid 2 Kolom) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
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
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pastikan tanggal deadline belum terlewati hari ini.
                  </p>
                  {stepErrors.registration_deadline && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{stepErrors.registration_deadline}</span>
                    </p>
                  )}
                </div>

                {/* Biaya Pendaftaran (Gratis vs Berbayar) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Biaya Pendaftaran Lomba <span className="text-red-500">*</span>
                  </label>
                  {/* Selector Gratis / Berbayar */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => handleToggleIsFree(true)}
                      className={`min-h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        formData.is_free
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      <span>Gratis (Free)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleIsFree(false)}
                      className={`min-h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        !formData.is_free
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <Coins size={14} />
                      <span>Berbayar</span>
                    </button>
                  </div>

                  {/* Input Nominal Jika Berbayar */}
                  {!formData.is_free && (
                    <div className="relative animate-in fade-in duration-200">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                        Rp
                      </span>
                      <input
                        id="input-fee-amount"
                        type="text"
                        name="fee_amount"
                        value={formData.fee_amount}
                        onChange={handleFeeAmountChange}
                        placeholder="Contoh: 50.000 atau 100.000 / tim"
                        className="w-full min-h-11 pl-10 pr-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Program Studi Sasaran (Pilihan Tanpa Scroll Internal) */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      Program Studi yang Sesuai (UMPKU Surakarta) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Pilih jurusan yang cocok atau centang semua jika lomba terbuka umum.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border border-orange-300 dark:border-orange-800 bg-orange-50/70 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors cursor-pointer"
                  >
                    {formData.selectAllPrograms ? 'Batal Pilih Semua' : '✓ Pilih Semua Program Studi (9 Prodi)'}
                  </button>
                </div>

                {/* Grid 9 Program Studi Lega Tanpa Scroll Internal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  {studyPrograms.map((prodi) => {
                    const isChecked = formData.study_program_ids.includes(prodi.id);
                    return (
                      <label
                        key={prodi.id}
                        className={`min-h-11 flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                          isChecked
                            ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-900 dark:text-orange-200 border-orange-400 dark:border-orange-600 font-semibold shadow-2xs'
                            : 'bg-stone-50/70 dark:bg-zinc-800/60 border-stone-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProdi(prodi.id)}
                          className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                        />
                        <span className="leading-tight">{prodi.name}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span>
                    Status: <strong>{formData.study_program_ids.length}</strong> dari {studyPrograms.length} prodi terpilih.
                  </span>
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
              LANGKAH 3 — POSTER, PENDAFTARAN & REVIEW RINGKASAN
             ══════════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-stone-100 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Langkah 3: Poster & Tautan Pendaftaran Resmi
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Lengkapi poster, link pendaftaran, dan periksa kembali seluruh ringkasan sebelum mengirim.
                </p>
              </div>

              {/* Upload Poster Lomba */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Poster Resmi Lomba <span className="text-stone-400 font-normal">(Disarankan)</span>
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
                      className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
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
                      Format JPG, JPEG, PNG, atau WebP (Ukuran maksimal 3 MB)
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
                  Link Tautan Pendaftaran Resmi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-reg-url"
                    type="text"
                    name="registration_url"
                    value={formData.registration_url}
                    onChange={handleChange}
                    placeholder="https://docs.google.com/forms/... atau bit.ly/daftar-lomba"
                    className="w-full min-h-11 pl-10 pr-4 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Tautan formulir Google Form, website lomba, atau portal registrasi panitia.
                </p>
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
                    placeholder="Contoh: 0812-3456-7890 (WA Panitia)"
                    className="w-full min-h-11 px-3.5 text-sm rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="input-source" className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Tautan Sumber Informasi <span className="text-stone-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    id="input-source"
                    type="text"
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

              {/* ── 4. REVIEW KOMPREHENSIF SELURUH INFORMASI PENTING (SESUAI SUPERPROMPT) ── */}
              <div className="rounded-2xl border border-orange-200 dark:border-zinc-700 bg-orange-50/40 dark:bg-zinc-800/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-orange-200/80 dark:border-zinc-700 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                    <CheckCircle2 size={15} />
                    <span>Periksa Kembali Ringkasan Informasi Lomba:</span>
                  </span>
                </div>

                {/* Bagian 1: Ringkasan Info Dasar */}
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-stone-200/70 dark:border-zinc-800 space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-100 dark:border-zinc-800">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Informasi Dasar Lomba</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Edit2 size={11} />
                      <span>Ubah</span>
                    </button>
                  </div>
                  <p><strong>Judul:</strong> {formData.title || <span className="text-stone-400">Belum diisi</span>}</p>
                  <p><strong>Penyelenggara:</strong> {formData.organizer || '-'} ({formData.competition_level || '-'})</p>
                  <p><strong>Kategori:</strong> {selectedCategoryName} | <strong>Format:</strong> {formData.participation_type}</p>
                </div>

                {/* Bagian 2: Ringkasan Ketentuan & Sasaran */}
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-stone-200/70 dark:border-zinc-800 space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-100 dark:border-zinc-800">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Ketentuan & Sasaran Jurusan</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Edit2 size={11} />
                      <span>Ubah</span>
                    </button>
                  </div>
                  <p><strong>Batas Deadline:</strong> {formData.registration_deadline || <span className="text-stone-400">Belum diisi</span>}</p>
                  <p><strong>Biaya:</strong> {formData.is_free ? 'Gratis' : formData.fee_amount ? `Rp ${formData.fee_amount}` : 'Berbayar'}</p>
                  <div>
                    <strong className="block mb-1">Target Program Studi ({selectedProdiNames.length} prodi):</strong>
                    <div className="flex flex-wrap gap-1">
                      {selectedProdiNames.length > 0 ? (
                        selectedProdiNames.map((p) => (
                          <span
                            key={p.id}
                            className="inline-block px-2 py-0.5 rounded bg-orange-100/70 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] font-medium"
                          >
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-400 italic">Belum ada prodi dipilih</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bagian 3: Ringkasan Pendaftaran & Kontak */}
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-stone-200/70 dark:border-zinc-800 space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block pb-1 border-b border-stone-100 dark:border-zinc-800">
                    3. Tautan & Narahubung
                  </span>
                  <p className="truncate"><strong>Link Pendaftaran:</strong> {formData.registration_url || <span className="text-stone-400">Belum diisi</span>}</p>
                  <p><strong>Kontak Panitia:</strong> {formData.contact || '-'}</p>
                  <p><strong>Poster:</strong> {formData.posterFile ? `${formData.posterFile.name} (${(formData.posterFile.size / 1024).toFixed(0)} KB)` : 'Tidak ada gambar diunggah'}</p>
                </div>
              </div>

              {/* ── Callout: Apa yang Terjadi Setelah Submit ── */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700 text-xs space-y-1.5 text-stone-600 dark:text-stone-300">
                <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Info size={14} className="text-orange-500" />
                  <span>Apa yang terjadi setelah Anda mengirim formulir?</span>
                </p>
                <p className="leading-relaxed">
                  Informasi lomba akan otomatis berstatus <strong>Menunggu Verifikasi (Pending)</strong> dan masuk ke antrean kurasi tim Kemahasiswaan UMPKU Surakarta. Admin akan memverifikasi keabsahan tautan dan poster sebelum ditampilkan ke publik. Anda dapat memantau status persetujuan secara live melalui menu <strong>Dashboard Saya</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigasi Tombol Stepper ── */}
          <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="min-h-11 px-5 rounded-xl border border-stone-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
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
                className="min-h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Lanjut ke Langkah {currentStep + 1}</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 px-7 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Mengirim Formulir...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim untuk Verifikasi</span>
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
