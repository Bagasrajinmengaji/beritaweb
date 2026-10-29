@extends('layouts.admin')

@section('title', 'Dashboard Ringkasan')
@section('page_title', 'Ringkasan & Statistik')

@section('content')
<div class="space-y-6">

    <!-- STATS CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Berita -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Berita</p>
                <h3 class="text-2xl font-bold text-white mt-1">{{ number_format($totalNews) }}</h3>
                <a href="{{ route('admin.news.index') }}" class="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium mt-2">
                    Kelola Berita <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </a>
            </div>
            <div class="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                <i data-lucide="newspaper" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Total User -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengguna Terdaftar</p>
                <h3 class="text-2xl font-bold text-white mt-1">{{ number_format($totalUsers) }}</h3>
                <span class="text-xs text-slate-500 font-medium mt-2 block">
                    {{ $totalAdmins }} Administrator
                </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                <i data-lucide="users" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- CS Belum Terbaca -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pesan CS Menunggu</p>
                <h3 class="text-2xl font-bold {{ $unreadCS > 0 ? 'text-rose-400' : 'text-white' }} mt-1">
                    {{ number_format($unreadCS) }}
                </h3>
                <a href="{{ route('admin.cs.index') }}" class="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium mt-2">
                    Buka CS Inbox <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </a>
            </div>
            <div class="w-12 h-12 rounded-xl {{ $unreadCS > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400' }} border flex items-center justify-center">
                <i data-lucide="message-square" class="w-6 h-6"></i>
            </div>
        </div>

        <!-- Server / System -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Backend</p>
                <h3 class="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Online
                </h3>
                <span class="text-xs text-slate-500 font-medium mt-2 block">
                    Laravel v{{ app()->version() }}
                </span>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <i data-lucide="server" class="w-6 h-6"></i>
            </div>
        </div>
    </div>

    <!-- MAIN TWO COLUMNS GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Kiri: Berita Terbaru (2 Kolom) -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
                <div>
                    <h3 class="text-base font-bold text-white">Berita Terbaru</h3>
                    <p class="text-xs text-slate-400">Daftar publikasi artikel teranyar di portal berita</p>
                </div>
                <a href="{{ route('admin.news.create') }}" 
                   class="inline-flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20 transition-colors">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    Tambah Berita
                </a>
            </div>

            @if($latestNews->isEmpty())
                <div class="text-center py-12 text-slate-500 text-sm">
                    <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
                    Belum ada berita yang diterbitkan.
                </div>
            @else
                <div class="divide-y divide-slate-800/80">
                    @foreach($latestNews as $item)
                        <div class="py-3.5 flex items-center justify-between gap-4">
                            <div class="flex items-center gap-3.5 min-w-0">
                                @if($item->image)
                                    <img src="{{ $item->image }}" alt="" class="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-800">
                                @else
                                    <div class="w-12 h-12 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                                        <i data-lucide="image" class="w-5 h-5"></i>
                                    </div>
                                @endif
                                <div class="min-w-0">
                                    <a href="{{ route('admin.news.edit', $item->id) }}" class="text-sm font-semibold text-slate-200 hover:text-orange-400 truncate block transition-colors">
                                        {{ $item->title }}
                                    </a>
                                    <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                        <span>Oleh: <strong class="text-slate-400">{{ $item->author ?? 'Redaksi' }}</strong></span>
                                        <span>•</span>
                                        <span>{{ $item->created_at->translatedFormat('d M Y') }}</span>
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center gap-1.5 shrink-0">
                                <a href="{{ route('admin.news.edit', $item->id) }}" 
                                   class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                   title="Edit Berita">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </a>
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="mt-4 pt-4 border-t border-slate-800 text-center">
                    <a href="{{ route('admin.news.index') }}" class="text-xs text-orange-400 hover:text-orange-300 font-semibold inline-flex items-center gap-1">
                        Lihat Seluruh Berita ({{ $totalNews }}) <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </a>
                </div>
            @endif
        </div>

        <!-- Kanan: Pesan CS Terbaru (1 Kolom) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-5">
                <div>
                    <h3 class="text-base font-bold text-white">Chat User Terbaru</h3>
                    <p class="text-xs text-slate-400">Pertanyaan dan masukan dari pembaca</p>
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

