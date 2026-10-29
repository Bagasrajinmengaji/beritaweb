@extends('layouts.admin')

@section('title', 'Kelola Berita')
@section('page_title', 'Kelola Berita')

@section('content')
<div class="space-y-6">

    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Search Bar -->
        <form action="{{ route('admin.news.index') }}" method="GET" class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <i data-lucide="search" class="w-4 h-4"></i>
            </div>
            <input type="text" name="search" value="{{ request('search') }}" 
                   placeholder="Cari judul artikel atau nama penulis..."
                   class="w-full pl-10 pr-20 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors">
            @if(request('search'))
                <a href="{{ route('admin.news.index') }}" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-white">
                    Reset
                </a>
            @endif
        </form>

        <!-- Tambah Berita Button -->
        <a href="{{ route('admin.news.create') }}" 
           class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-600/20 transition-colors">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Tambah Berita Baru
        </a>
    </div>

    <!-- Table Container -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-300">
                <thead class="bg-slate-950/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                    <tr>
                        <th class="px-6 py-4">Artikel Berita</th>
                        <th class="px-6 py-4">Penulis</th>
                        <th class="px-6 py-4">Tanggal Dibuat</th>
                        <th class="px-6 py-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80">
                    @forelse($news as $item)
                        <tr class="hover:bg-slate-800/40 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3.5">
                                    @if($item->image)
                                        <img src="{{ $item->image }}" alt="" class="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-800 border border-slate-700/60">
                                    @else
                                        <div class="w-14 h-14 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 border border-slate-700/60">
                                            <i data-lucide="image" class="w-6 h-6"></i>
                                        </div>
                                    @endif
                                    <div class="min-w-0 max-w-md">
                                        <p class="font-semibold text-white truncate text-sm" title="{{ $item->title }}">
                                            {{ $item->title }}
                                        </p>
                                        <p class="text-xs text-slate-500 truncate mt-0.5">
                                            {{ Str::limit(strip_tags($item->content), 80) }}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-xs font-medium text-slate-300">
                                <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                                    {{ $item->author ?? 'Redaksi' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-xs text-slate-400">
                                {{ $item->created_at->translatedFormat('d M Y, H:i') }}
                            </td>
                            <td class="px-6 py-4 text-right space-x-1">
                                <a href="{{ route('admin.news.edit', $item->id) }}" 
                                   class="inline-flex p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                   title="Edit Berita">
                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </a>

                                <form action="{{ route('admin.news.destroy', $item->id) }}" method="POST" class="inline-block"
                                      onsubmit="return confirm('Apakah Anda yakin ingin menghapus berita ini secara permanen?')">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" 
                                            class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            title="Hapus Berita">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-16 text-center text-slate-500">
                                <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-3 opacity-30"></i>
                                <p class="text-base font-semibold text-slate-400">Tidak ada berita yang ditemukan</p>
                                <p class="text-xs text-slate-500 mt-1">
                                    @if(request('search'))
                                        Coba gunakan kata kunci pencarian yang lain.
                                    @else
                                        Mulai dengan membuat artikel berita baru pertama Anda.
                                    @endif
                                </p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($news->hasPages())
            <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/40">
                {{ $news->links() }}
            </div>
        @endif
    </div>

</div>
@endsection

