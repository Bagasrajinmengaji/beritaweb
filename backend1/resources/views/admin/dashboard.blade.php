@extends('layouts.admin')

@section('title', 'Dashboard Administrator')
@section('page_title', 'Ringkasan & Moderasi Lomba')

@section('content')
<div class="space-y-6">

    <!-- ── STATS CARDS MODERASI LOMBA ── -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Lomba -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Lomba</p>
                <h3 class="text-2xl font-bold text-white mt-1">{{ number_format($totalCompetitions) }}</h3>
                <a href="{{ route('admin.competitions.index') }}" class="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium mt-2">
                    Kelola Lomba <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </a>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                <i data-lucide="trophy" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Menunggu Verifikasi (Pending) -->
        <div class="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 flex items-center justify-between {{ $pendingCompetitions > 0 ? 'ring-1 ring-amber-500/30' : '' }}">
            <div>
                <p class="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-400 {{ $pendingCompetitions > 0 ? 'animate-pulse' : '' }}"></span>
                    Menunggu Verifikasi
                </p>
                <h3 class="text-2xl font-bold text-amber-400 mt-1">{{ number_format($pendingCompetitions) }}</h3>
                <a href="{{ route('admin.competitions.index', ['status' => 'pending']) }}" class="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium mt-2">
                    Kurasi Sekarang <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </a>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <i data-lucide="clock" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Lomba Disetujui (Approved) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Disetujui & Tayang</p>
                <h3 class="text-2xl font-bold text-emerald-400 mt-1">{{ number_format($approvedCompetitions) }}</h3>
                <a href="{{ route('admin.competitions.index', ['status' => 'approved']) }}" class="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2">
                    Lihat Lomba Aktif <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </a>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Lomba Ditolak (Rejected) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-rose-400 uppercase tracking-wider">Ditolak / Revisi</p>
                <h3 class="text-2xl font-bold text-rose-400 mt-1">{{ number_format($rejectedCompetitions) }}</h3>
                <a href="{{ route('admin.competitions.index', ['status' => 'rejected']) }}" class="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium mt-2">
                    Lihat Catatan <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </a>
            </div>
            <div class="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
                <i data-lucide="x-circle" class="w-6 h-6"></i>
            </div>
        </div>
    </div>

    <!-- ── SECONDARY STATS (Kategori, Prodi, CS, User) ── -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <a href="{{ route('admin.categories.index') }}" class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
                <i data-lucide="tags" class="w-3.5 h-3.5 text-orange-400"></i> Kategori Lomba
            </span>
            <p class="text-lg font-bold text-white mt-1">{{ $totalCategories }} Kategori</p>
        </a>

        <a href="{{ route('admin.study-programs.index') }}" class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
                <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-orange-400"></i> Program Studi
            </span>
            <p class="text-lg font-bold text-white mt-1">{{ $totalPrograms }} Prodi UMPKU</p>
        </a>

        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
                <i data-lucide="users" class="w-3.5 h-3.5 text-blue-400"></i> Mahasiswa / User
            </span>
            <p class="text-lg font-bold text-white mt-1">{{ $totalUsers }} Terdaftar</p>
        </div>

        <a href="{{ route('admin.cs.index') }}" class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
                <i data-lucide="message-square" class="w-3.5 h-3.5 text-purple-400"></i> Pesan CS Menunggu
            </span>
            <p class="text-lg font-bold text-white mt-1">{{ $unreadCS }} Belum Dibaca</p>
        </a>
    </div>

    <!-- ── MAIN TWO COLUMNS GRID ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Kiri: Antrean Verifikasi Lomba (2 Kolom) -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
                <div>
                    <h3 class="text-base font-bold text-white flex items-center gap-2">
                        <i data-lucide="inbox" class="w-4 h-4 text-orange-500"></i>
                        <span>Antrean Lomba Perlu Kurasi</span>
                    </h3>
                    <p class="text-xs text-slate-400">Informasi lomba yang baru dikirimkan mahasiswa dan menunggu verifikasi admin</p>
                </div>
                <a href="{{ route('admin.competitions.index', ['status' => 'pending']) }}" 
                   class="text-xs text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1">
                    Semua Antrean ({{ $pendingCompetitions }}) <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </a>
            </div>

            @if($pendingList->isEmpty())
                <div class="text-center py-12 text-slate-500 text-sm">
                    <i data-lucide="check-circle-2" class="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60"></i>
                    Semua antrean bersih! Tidak ada pengajuan lomba yang menunggu verifikasi.
                </div>
            @else
                <div class="divide-y divide-slate-800/80">
                    @foreach($pendingList as $item)
                        <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div class="flex items-start gap-3.5 min-w-0">
                                @if($item->poster)
                                    <img src="{{ asset($item->poster_url) }}" alt="" class="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-800 border border-slate-700">
                                @else
                                    <div class="w-14 h-14 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 border border-slate-700">
                                        <i data-lucide="image" class="w-5 h-5"></i>
                                    </div>
                                @endif
                                <div class="min-w-0 space-y-1">
                                    <div class="flex items-center gap-2">
                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            Pending
                                        </span>
                                        <span class="text-[11px] text-slate-400 font-medium">
                                            {{ $item->competition_level }}
                                        </span>
                                    </div>
                                    <a href="{{ route('admin.competitions.show', $item->id) }}" class="text-sm font-bold text-slate-200 hover:text-orange-400 truncate block transition-colors">
                                        {{ $item->title }}
                                    </a>
                                    <p class="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                        <span>Penyelenggara: <strong class="text-slate-300">{{ $item->organizer }}</strong></span>
                                        <span>•</span>
                                        <span>Pengirim: {{ $item->user->name ?? 'Mahasiswa' }}</span>
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <a href="{{ route('admin.competitions.show', $item->id) }}" 
                                   class="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20 transition-colors inline-flex items-center gap-1.5">
                                    <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                                    <span>Review & Moderasi</span>
                                </a>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        <!-- Kanan: Chat CS Mahasiswa Terbaru (1 Kolom) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
                <div>
                    <h3 class="text-base font-bold text-white flex items-center gap-2">
                        <i data-lucide="message-square" class="w-4 h-4 text-purple-400"></i>
                        <span>Chat Pengguna Terbaru</span>
                    </h3>
                    <p class="text-xs text-slate-400">Pertanyaan dan konsultasi mahasiswa</p>
                </div>
                <a href="{{ route('admin.cs.index') }}" class="text-xs text-orange-400 hover:text-orange-300 font-semibold">
                    Semua
                </a>
            </div>

            @if($recentMessages->isEmpty())
                <div class="text-center py-12 text-slate-500 text-sm">
                    <i data-lucide="message-square-off" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
                    Belum ada pesan customer service.
                </div>
            @else
                <div class="space-y-3">
                    @foreach($recentMessages as $msg)
                        <a href="{{ route('admin.cs.index', ['session_id' => $msg->session_id]) }}" 
                           class="block p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-orange-500/40 transition-colors">
                            <div class="flex items-center justify-between text-xs mb-1">
                                <span class="font-semibold text-slate-200">{{ $msg->user_name }}</span>
                                <span class="text-slate-500 text-[10px]">{{ $msg->created_at->diffForHumans() }}</span>
                            </div>
                            <p class="text-xs text-slate-400 line-clamp-2">
                                {{ $msg->message }}
                            </p>
                            @if(!$msg->is_read_by_admin)
                                <span class="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                                    Belum dibaca
                                </span>
                            @endif
                        </a>
                    @endforeach
                </div>
            @endif
        </div>

    </div>

</div>
@endsection
