@extends('layouts.admin')

@section('title', 'Kelola & Moderasi Lomba')
@section('page_title', 'Manajemen & Moderasi Lomba Mahasiswa')

@section('content')
<div class="space-y-6">

    <!-- ── Filter Tabs & Pencarian ── -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <a href="{{ route('admin.competitions.index') }}" 
               class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors {{ !request('status') ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800' }}">
                Semua ({{ $competitions->total() }})
            </a>
            <a href="{{ route('admin.competitions.index', ['status' => 'pending']) }}" 
               class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 {{ request('status') === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800' }}">
                <span>Menunggu Verifikasi</span>
                @if($pendingCount > 0)
                    <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                        {{ $pendingCount }}
                    </span>
                @endif
            </a>
            <a href="{{ route('admin.competitions.index', ['status' => 'approved']) }}" 
               class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors {{ request('status') === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800' }}">
                Disetujui ({{ $approvedCount }})
            </a>
            <a href="{{ route('admin.competitions.index', ['status' => 'rejected']) }}" 
               class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors {{ request('status') === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800' }}">
                Ditolak ({{ $rejectedCount }})
            </a>
        </div>

        <!-- Search Bar -->
        <form action="{{ route('admin.competitions.index') }}" method="GET" class="flex gap-2">
            @if(request('status'))
                <input type="hidden" name="status" value="{{ request('status') }}">
            @endif
            <div class="relative flex-1 sm:w-64">
                <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input type="text" name="search" value="{{ request('search') }}" 
                       placeholder="Cari judul, pengirim..."
                       class="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500">
            </div>
            <button type="submit" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors">
                Cari
            </button>
            @if(request('search'))
                <a href="{{ route('admin.competitions.index', request('status') ? ['status' => request('status')] : []) }}" 
                   class="px-3 py-2 text-slate-400 hover:text-white rounded-xl text-xs flex items-center">
                    Reset
                </a>
            @endif
        </form>
    </div>

    <!-- ── Tabel Antrean Lomba ── -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                        <th class="px-5 py-3.5">Informasi Lomba</th>
                        <th class="px-4 py-3.5">Kategori & Tingkat</th>
                        <th class="px-4 py-3.5">Penyelenggara / Pengirim</th>
                        <th class="px-4 py-3.5">Batas Deadline</th>
                        <th class="px-4 py-3.5">Status</th>
                        <th class="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80">
                    @forelse($competitions as $item)
                        <tr class="hover:bg-slate-800/30 transition-colors {{ $item->status === 'pending' ? 'bg-amber-500/5' : '' }}">
                            <!-- Kolom 1: Poster & Judul -->
                            <td class="px-5 py-4">
                                <div class="flex items-center gap-3 max-w-md">
                                    @if($item->poster)
                                        <img src="{{ asset($item->poster_url) }}" alt="" class="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-800 border border-slate-700">
                                    @else
                                        <div class="w-12 h-12 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 border border-slate-700">
                                            <i data-lucide="image" class="w-5 h-5"></i>
                                        </div>
                                    @endif
                                    <div class="min-w-0">
                                        <a href="{{ route('admin.competitions.show', $item->id) }}" class="font-bold text-slate-200 hover:text-orange-400 truncate block text-sm transition-colors">
                                            {{ $item->title }}
                                        </a>
                                        <span class="text-[11px] text-slate-500 mt-0.5 block">
                                            Diajukan: {{ $item->created_at->translatedFormat('d M Y, H:i') }}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            <!-- Kolom 2: Kategori & Tingkat -->
                            <td class="px-4 py-4 whitespace-nowrap">
                                <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 block w-fit mb-1 border border-slate-700/60">
                                    {{ $item->category->name ?? '-' }}
                                </span>
                                <span class="text-[11px] text-slate-400 font-medium">
                                    {{ $item->competition_level }}
                                </span>
                            </td>

                            <!-- Kolom 3: Penyelenggara & Pengirim -->
                            <td class="px-4 py-4">
                                <p class="font-semibold text-slate-200 truncate max-w-44">{{ $item->organizer }}</p>
                                <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <i data-lucide="user" class="w-3 h-3 text-orange-400"></i>
                                    <span>{{ $item->user->name ?? 'Mahasiswa' }}</span>
                                </p>
                            </td>

                            <!-- Kolom 4: Batas Deadline -->
                            <td class="px-4 py-4 whitespace-nowrap">
                                <p class="font-semibold text-slate-200">
                                    {{ $item->registration_deadline ? $item->registration_deadline->translatedFormat('d M Y') : '-' }}
                                </p>
                                <span class="text-[11px] text-slate-500">
                                    {{ $item->registration_status }}
                                </span>
                            </td>

                            <!-- Kolom 5: Status Moderasi -->
                            <td class="px-4 py-4 whitespace-nowrap">
                                @if($item->status === 'approved')
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        <i data-lucide="check-circle" class="w-3 h-3"></i>
                                        <span>Disetujui</span>
                                    </span>
                                @elseif($item->status === 'pending')
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                        <i data-lucide="clock" class="w-3 h-3"></i>
                                        <span>Pending Review</span>
                                    </span>
                                @elseif($item->status === 'rejected')
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                        <i data-lucide="x-circle" class="w-3 h-3"></i>
                                        <span>Ditolak</span>
                                    </span>
                                @else
                                    <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400">
                                        {{ $item->status }}
                                    </span>
                                @endif
                            </td>

                            <!-- Kolom 6: Aksi Cepat -->
                            <td class="px-5 py-4 whitespace-nowrap text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    <!-- Review Detail -->
                                    <a href="{{ route('admin.competitions.show', $item->id) }}" 
                                       class="p-2 bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                                       title="Review & Moderasi">
                                        <i data-lucide="eye" class="w-4 h-4"></i>
                                    </a>

                                    <!-- Quick Approve jika pending -->
                                    @if($item->status !== 'approved')
                                        <form action="{{ route('admin.competitions.approve', $item->id) }}" method="POST" class="inline">
                                            @csrf
                                            <button type="submit" 
                                                    onclick="return confirm('Setujui informasi lomba ini untuk langsung ditampilkan kepada publik?')"
                                                    class="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors"
                                                    title="Setujui (Approve)">
                                                <i data-lucide="check" class="w-4 h-4"></i>
                                            </button>
                                        </form>
                                    @endif

                                    <!-- Quick Reject Modal Trigger jika belum ditolak -->
                                    @if($item->status !== 'rejected')
                                        <button type="button" 
                                                onclick="openRejectModal({{ $item->id }}, '{{ addslashes($item->title) }}')"
                                                class="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors"
                                                title="Tolak Pengajuan">
                                            <i data-lucide="x" class="w-4 h-4"></i>
                                        </button>
                                    @endif

                                    <!-- Edit -->
                                    <a href="{{ route('admin.competitions.edit', $item->id) }}" 
                                       class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                                       title="Edit Koreksi">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </a>

                                    <!-- Hapus -->
                                    <form action="{{ route('admin.competitions.destroy', $item->id) }}" method="POST" class="inline"
                                          onsubmit="return confirm('Hapus permanen informasi lomba ini?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Hapus">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                                <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
                                Belum ada data informasi lomba pada filter ini.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        @if($competitions->hasPages())
            <div class="p-4 border-t border-slate-800 bg-slate-950/40">
                {{ $competitions->links() }}
            </div>
        @endif
    </div>

</div>

<!-- ── MODAL TOLAK PENGAJUAN (REJECT MODAL) ── -->
<div id="rejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs hidden">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-bold text-white text-base flex items-center gap-2 text-rose-400">
                <i data-lucide="x-circle" class="w-5 h-5"></i>
                <span>Tolak Pengajuan Lomba</span>
            </h3>
            <button type="button" onclick="closeRejectModal()" class="text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <p class="text-xs text-slate-400">
            Lomba: <strong id="modalCompTitle" class="text-slate-200"></strong>
        </p>

        <form id="rejectForm" method="POST" action="" class="space-y-4">
            @csrf
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                    Catatan / Alasan Penolakan <span class="text-rose-400">*</span>
                </label>
                <textarea name="rejection_reason" rows="4" required
                          placeholder="Jelaskan alasan penolakan atau bagian yang harus diperbaiki oleh mahasiswa (contoh: Tautan pendaftaran rusak / poster buram)..."
                          class="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"></textarea>
                <p class="text-[11px] text-slate-500 mt-1">
                    Catatan ini akan langsung tampil di Dashboard pengaju agar dapat diperbaiki.
                </p>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onclick="closeRejectModal()" class="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
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
    function openRejectModal(id, title) {
        document.getElementById('modalCompTitle').innerText = title;
        document.getElementById('rejectForm').action = "/admin/competitions/" + id + "/reject";
        document.getElementById('rejectModal').classList.remove('hidden');
    }
    function closeRejectModal() {
        document.getElementById('rejectModal').classList.add('hidden');
    }
</script>
@endpush
@endsection

