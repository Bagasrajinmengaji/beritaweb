@extends('layouts.admin')

@section('title', 'Review Lomba: ' . $competition->title)
@section('page_title', 'Review & Moderasi Pengajuan Lomba')

@section('content')
<div class="space-y-6 max-w-5xl">

    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <a href="{{ route('admin.competitions.index') }}" 
           class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Daftar Lomba</span>
        </a>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
            @if($competition->status !== 'approved')
                <form action="{{ route('admin.competitions.approve', $competition->id) }}" method="POST" class="inline">
                    @csrf
                    <button type="submit" 
                            onclick="return confirm('Setujui informasi lomba ini? Lomba akan langsung tampil kepada pengunjung publik.')"
                            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5">
                        <i data-lucide="check-circle" class="w-4 h-4"></i>
                        <span>Setujui (Approve)</span>
                    </button>
                </form>
            @endif

            @if($competition->status !== 'rejected')
                <button type="button" 
                        onclick="openRejectModal({{ $competition->id }}, '{{ addslashes($competition->title) }}')"
                        class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5">
                    <i data-lucide="x-circle" class="w-4 h-4"></i>
                    <span>Tolak & Beri Catatan</span>
                </button>
            @endif

            <a href="{{ route('admin.competitions.edit', $competition->id) }}" 
               class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
                <span>Edit Koreksi</span>
            </a>
        </div>
    </div>

    <!-- Status Banner -->
    <div class="p-4 rounded-2xl border {{ $competition->status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : ($competition->status === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300') }} flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
            @if($competition->status === 'approved')
                <i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>
                <div>
                    <span class="font-bold text-sm block">Status: Disetujui (Tayang ke Publik)</span>
                    <span>Diverifikasi oleh {{ $competition->reviewer->name ?? 'Admin' }} pada {{ $competition->reviewed_at?->translatedFormat('d M Y, H:i') }}</span>
                </div>
            @elseif($competition->status === 'pending')
                <i data-lucide="clock" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <span class="font-bold text-sm block">Status: Menunggu Kurasi Admin</span>
                    <span>Diajukan oleh {{ $competition->user->name ?? 'Mahasiswa' }} pada {{ $competition->created_at->translatedFormat('d M Y, H:i') }}</span>
                </div>
            @else
                <i data-lucide="x-circle" class="w-5 h-5 text-rose-400"></i>
                <div>
                    <span class="font-bold text-sm block">Status: Ditolak / Perlu Perbaikan</span>
                    <span>Alasan: {{ $competition->rejection_reason }}</span>
                </div>
            @endif
        </div>
    </div>

    <!-- Content 2 Kolom -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Kolom Kiri: Detail Informasi -->
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {{ $competition->competition_level }}
                    </span>
                    @if($competition->category)
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            {{ $competition->category->name }}
                        </span>
                    @endif
                </div>

                <h1 class="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {{ $competition->title }}
                </h1>

                <div class="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Penyelenggara: <strong class="text-slate-200">{{ $competition->organizer }}</strong></span>
                    <span>•</span>
                    <span>Deadline: <strong class="text-slate-200">{{ $competition->registration_deadline?->translatedFormat('d F Y') }}</strong></span>
                    <span>•</span>
                    <span>Biaya: <strong class="text-orange-400">{{ $competition->registration_fee ?: 'Gratis' }}</strong></span>
                </div>

                <!-- Poster -->
                <div class="pt-2">
                    <span class="text-xs font-semibold text-slate-400 block mb-2">Poster Lomba:</span>
                    @if($competition->poster)
                        <img src="{{ asset($competition->poster_url) }}" alt="" class="w-full max-h-96 object-contain rounded-xl bg-slate-950 border border-slate-800">
                    @else
                        <div class="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-500 text-xs">
                            Tidak melampirkan poster gambar.
                        </div>
                    @endif
                </div>

                <!-- Deskripsi -->
                <div class="pt-4 border-t border-slate-800">
                    <h3 class="text-sm font-bold text-white mb-2">Deskripsi Lomba</h3>
                    <div class="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                        {{ $competition->description }}
                    </div>
                </div>

                <!-- Persyaratan -->
                @if($competition->requirements)
                    <div class="pt-2">
                        <h3 class="text-sm font-bold text-white mb-2">Persyaratan Peserta</h3>
                        <div class="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                            {{ $competition->requirements }}
                        </div>
                    </div>
                @endif

                <!-- Prodi Sasaran -->
                <div class="pt-2">
                    <h3 class="text-sm font-bold text-white mb-2">Program Studi Sasaran (UMPKU Surakarta)</h3>
                    <div class="flex flex-wrap gap-2">
                        @forelse($competition->studyPrograms as $prodi)
                            <span class="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                {{ $prodi->name }}
                            </span>
                        @empty
                            <span class="text-xs text-slate-500">Terbuka untuk semua program studi.</span>
                        @endforelse
                    </div>
                </div>
            </div>
        </div>

        <!-- Kolom Kanan: Verifikasi Tautan & Kontak -->
        <div class="space-y-6">
            <!-- Box Verifikasi Tautan -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 class="text-sm font-bold text-white border-b border-slate-800 pb-2">
                    Verifikasi Tautan Resmi
                </h3>

                <div>
                    <span class="text-xs text-slate-400 block mb-1">Tautan Pendaftaran Resmi:</span>
                    <a href="{{ $competition->registration_url }}" target="_blank" rel="noopener noreferrer"
                       class="text-xs text-orange-400 hover:text-orange-300 underline break-all flex items-center gap-1 font-semibold">
                        <span>Buka Link Pendaftaran</span>
                        <i data-lucide="external-link" class="w-3.5 h-3.5 shrink-0"></i>
                    </a>
                </div>

                @if($competition->source_url)
                    <div class="border-t border-slate-800 pt-3">
                        <span class="text-xs text-slate-400 block mb-1">Tautan Sumber Informasi Asli:</span>
                        <a href="{{ $competition->source_url }}" target="_blank" rel="noopener noreferrer"
                           class="text-xs text-slate-300 hover:text-white underline break-all flex items-center gap-1">
                            <span>Buka Halaman Sumber</span>
                            <i data-lucide="external-link" class="w-3.5 h-3.5 shrink-0"></i>
                        </a>
                    </div>
                @endif

                @if($competition->contact)
                    <div class="border-t border-slate-800 pt-3">
                        <span class="text-xs text-slate-400 block mb-1">Kontak Narahubung Panitia:</span>
                        <p class="text-xs font-semibold text-slate-200 select-all">{{ $competition->contact }}</p>
                    </div>
                @endif
            </div>

            <!-- Box Identitas Pengaju -->
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                <h3 class="font-bold text-white border-b border-slate-800 pb-2">
                    Identitas Mahasiswa Pengaju
                </h3>
                <div class="space-y-1 text-slate-400">
                    <p>Nama: <strong class="text-slate-200">{{ $competition->user->name ?? 'Mahasiswa' }}</strong></p>
                    <p>Username: {{ $competition->user->username ?? '-' }}</p>
                    <p>Email: {{ $competition->user->email ?? '-' }}</p>
                    <p>Waktu Kirim: {{ $competition->created_at->translatedFormat('d F Y, H:i') }} WIB</p>
                </div>
            </div>
        </div>
    </div>

</div>

<!-- Reject Modal -->
<div id="rejectModal" class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/75 backdrop-blur-xs hidden">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-bold text-base text-rose-400">Tolak Pengajuan Lomba</h3>
            <button type="button" onclick="closeRejectModal()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <form id="rejectForm" method="POST" action="{{ route('admin.competitions.reject', $competition->id) }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                    Catatan Alasan Penolakan <span class="text-rose-400">*</span>
                </label>
                <textarea name="rejection_reason" rows="4" required
                          placeholder="Jelaskan bagian yang perlu diperbaiki (contoh: Tautan pendaftaran rusak / batas tanggal salah)..."
                          class="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onclick="closeRejectModal()" class="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300">
                    Batal
                </button>
                <button type="submit" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors">
                    Tolak & Kirim Catatan
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
    function openRejectModal() {
        const modal = document.getElementById('rejectModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    function closeRejectModal() {
        const modal = document.getElementById('rejectModal');
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
</script>
@endpush
@endsection

