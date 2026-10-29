@extends('layouts.admin')

@section('title', 'Customer Service Chat')
@section('page_title', 'Customer Service & Chat Pembaca')

@section('content')
<div class="h-[calc(100vh-140px)] flex flex-col space-y-4">

    <!-- Top Action Bar -->
    <div class="flex items-center justify-between shrink-0">
        <div>
            <h3 class="text-base font-bold text-white">Inbox Customer Service</h3>
            <p class="text-xs text-slate-400">Tanggapi pertanyaan, kendala, atau pesan dari pembaca secara langsung</p>
        </div>

        @if($sessions->isNotEmpty())
            <form action="{{ route('admin.cs.clear-all') }}" method="POST" 
                  onsubmit="return confirm('PERINGATAN: Apakah Anda yakin ingin membersihkan SELURUH riwayat pesan Customer Service?')">
                @csrf
                @method('DELETE')
                <button type="submit" 
                        class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    Bersihkan Seluruh Chat
                </button>
            </form>
        @endif
    </div>

    <!-- Main Chat Workspace: 2 Columns -->
    <div class="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex shadow-xl">

        <!-- KOLOM KIRI: Daftar Sesi Percakapan -->
        <div class="w-80 shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/40">
            <div class="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Daftar Sesi ({{ $sessions->count() }})</span>
            </div>

            <div class="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                @forelse($sessions as $s)
                    @php
                        $isActive = ($activeSessionId === $s->session_id);
                    @endphp
                    <a href="{{ route('admin.cs.index', ['session_id' => $s->session_id]) }}" 
                       class="block p-3.5 transition-colors {{ $isActive ? 'bg-orange-600/15 border-l-4 border-orange-500 text-white' : 'hover:bg-slate-800/40 text-slate-300' }}">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-semibold text-xs truncate max-w-[160px] {{ $isActive ? 'text-orange-400 font-bold' : 'text-slate-200' }}">
                                {{ $s->user_name ?: 'Pengunjung' }}
                            </span>
                            <span class="text-[10px] text-slate-500">
                                {{ \Carbon\Carbon::parse($s->last_activity)->diffForHumans(null, true) }}
                            </span>
                        </div>

                        <p class="text-[11px] text-slate-400 truncate">
                            {{ $s->user_email ?: 'Tanpa email terdaftar' }}
                        </p>

                        @if($s->news_title)
                            <div class="mt-1 flex items-center gap-1 text-[10px] text-slate-500 truncate">
                                <i data-lucide="newspaper" class="w-2.5 h-2.5 shrink-0"></i>
                                <span class="truncate">{{ $s->news_title }}</span>
                            </div>
                        @endif

                        @if($s->unread_count > 0)
                            <span class="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-extrabold bg-rose-500 text-white rounded-full">
                                {{ $s->unread_count }} baru
                            </span>
                        @endif
                    </a>
                @empty
                    <div class="p-8 text-center text-slate-500 text-xs">
                        <i data-lucide="message-square-off" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                        Belum ada percakapan masuk dari pembaca.
                    </div>
                @endforelse
            </div>
        </div>

        <!-- KOLOM KANAN: Ruang Chat Aktif -->
        <div class="flex-1 flex flex-col min-w-0 bg-slate-900/60">
            @if($activeSessionId && $activeSessionInfo)
                <!-- Chat Header -->
                <div class="h-14 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
                    <div class="flex items-center gap-3 truncate">
                        <div class="w-8 h-8 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold text-xs uppercase border border-orange-500/30">
                            {{ substr($activeSessionInfo->user_name ?: 'U', 0, 1) }}
                        </div>
                        <div class="truncate text-xs">
                            <p class="font-bold text-white truncate">{{ $activeSessionInfo->user_name ?: 'Pengunjung' }}</p>
                            <p class="text-[11px] text-slate-400 truncate">
                                {{ $activeSessionInfo->user_email ?: 'Sesi: ' . substr($activeSessionId, 0, 14) . '...' }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        @if($activeSessionInfo->news_title)
                            <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 max-w-xs truncate border border-slate-700/50">
                                <i data-lucide="newspaper" class="w-3 h-3 shrink-0 text-orange-400"></i>
                                <span class="truncate">{{ $activeSessionInfo->news_title }}</span>
                            </div>
                        @endif

                        <form action="{{ route('admin.cs.destroy-session', $activeSessionId) }}" method="POST"
                              onsubmit="return confirm('Hapus seluruh pesan pada sesi ini?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" 
                                    class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Hapus Sesi Ini">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Chat Message List (Scrollable) -->
                <div id="messages-container" class="flex-1 p-5 overflow-y-auto space-y-3">
                    @forelse($activeMessages as $m)
                        @php
                            $isAdmin = ($m->sender === 'admin');
                        @endphp
                        <div class="flex {{ $isAdmin ? 'justify-end' : 'justify-start' }}">
                            <div class="max-w-md {{ $isAdmin ? 'bg-orange-600 text-white rounded-2xl rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-none border border-slate-700/60' }} p-3.5 shadow-md">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[10px] font-bold uppercase tracking-wider {{ $isAdmin ? 'text-orange-200' : 'text-slate-400' }}">
                                        {{ $isAdmin ? 'Admin (Anda)' : ($m->user_name ?: 'Pengunjung') }}
                                    </span>
                                    <span class="text-[10px] {{ $isAdmin ? 'text-orange-200/80' : 'text-slate-500' }}">
                                        {{ $m->created_at->format('H:i') }}
                                    </span>
                                </div>
                                <p class="text-xs whitespace-pre-wrap leading-relaxed">{{ $m->message }}</p>
                            </div>
                        </div>
                    @empty
                        <div class="text-center py-12 text-slate-500 text-xs">
                            Tidak ada pesan dalam sesi ini.
                        </div>
                    @endforelse
                </div>

                <!-- Chat Reply Input -->
                <div class="p-3.5 border-t border-slate-800 bg-slate-900 shrink-0">
                    <form action="{{ route('admin.cs.reply') }}" method="POST" class="flex gap-2">
                        @csrf
                        <input type="hidden" name="session_id" value="{{ $activeSessionId }}">
                        <textarea name="message" rows="2" required
                                  placeholder="Ketik balasan Anda untuk pembaca..."
                                  class="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"></textarea>
                        <button type="submit"
                                class="px-5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition-colors flex items-center justify-center gap-1.5 self-end py-3">
                            <i data-lucide="send" class="w-3.5 h-3.5"></i>
                            Kirim
                        </button>
                    </form>
                </div>
            @else
                <div class="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <div class="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-3">
                        <i data-lucide="messages-square" class="w-8 h-8 opacity-40"></i>
                    </div>
                    <h4 class="text-sm font-semibold text-slate-400">Tidak ada sesi yang dipilih</h4>
                    <p class="text-xs text-slate-500 mt-1 max-w-sm">
                        Silakan klik salah satu sesi pembaca di kolom sebelah kiri untuk membaca dan membalas pesan.
                    </p>
                </div>
            @endif
        </div>

    </div>

</div>
@endsection

@push('scripts')
<script>
    // Auto scroll chat to bottom
    const msgContainer = document.getElementById('messages-container');
    if (msgContainer) {
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
</script>
@endpush

