@extends('layouts.admin')

@section('title', 'Kategori Lomba')
@section('page_title', 'Master Data Kategori Lomba')

@section('content')
<div class="space-y-6 max-w-5xl">

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <!-- Form Tambah Kategori (Kiri) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                <i data-lucide="plus-circle" class="w-4 h-4 text-orange-500"></i>
                <span>Tambah Kategori Baru</span>
            </h3>

            <form action="{{ route('admin.categories.store') }}" method="POST" class="space-y-3">
                @csrf
                <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Nama Kategori *</label>
                    <input type="text" name="name" required placeholder="Contoh: Desain & Multimedia"
                           class="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
                    @error('name')
                        <p class="text-xs text-rose-400 mt-1">{{ $message }}</p>
                    @enderror
                </div>
                <button type="submit" class="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shadow-xs">
                    Simpan Kategori
                </button>
            </form>
        </div>

        <!-- Tabel Daftar Kategori (Kanan - 2 Kolom) -->
        <div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 class="font-bold text-sm text-white">Daftar Kategori Lomba</h3>
                <span class="text-xs text-slate-400">Total: {{ $categories->total() }}</span>
            </div>

            <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                        <th class="px-5 py-3">Nama Kategori</th>
                        <th class="px-4 py-3">Slug</th>
                        <th class="px-4 py-3 text-center">Jumlah Lomba</th>
                        <th class="px-5 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80">
                    @forelse($categories as $cat)
                        <tr class="hover:bg-slate-800/30">
                            <td class="px-5 py-3 font-semibold text-slate-200">
                                {{ $cat->name }}
                            </td>
                            <td class="px-4 py-3 text-slate-500 font-mono text-[11px]">
                                {{ $cat->slug }}
                            </td>
                            <td class="px-4 py-3 text-center">
                                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
                                    {{ $cat->competitions_count }} lomba
                                </span>
                            </td>
                            <td class="px-5 py-3 text-right whitespace-nowrap">
                                <div class="flex items-center justify-end gap-1.5">
                                    <!-- Edit Trigger -->
                                    <button type="button" 
                                            onclick="openEditCatModal({{ $cat->id }}, '{{ addslashes($cat->name) }}')"
                                            class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                                    </button>

                                    <!-- Delete jika lomba = 0 -->
                                    @if($cat->competitions_count == 0)
                                        <form action="{{ route('admin.categories.destroy', $cat->id) }}" method="POST" class="inline"
                                              onsubmit="return confirm('Hapus kategori ini?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg">
                                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                                            </button>
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-5 py-8 text-center text-slate-500">
                                Belum ada kategori yang dibuat.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            @if($categories->hasPages())
                <div class="p-3 border-t border-slate-800 bg-slate-950/40">
                    {{ $categories->links() }}
                </div>
            @endif
        </div>
    </div>

</div>

<!-- Modal Edit Kategori -->
<div id="editCatModal" class="fixed inset-0 z-50 items-center justify-center p-4 bg-black/75 backdrop-blur-xs hidden">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 class="font-bold text-white text-base">Edit Nama Kategori</h3>
        <form id="editCatForm" method="POST" action="" class="space-y-4">
            @csrf
            @method('PUT')
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Nama Kategori *</label>
                <input type="text" id="editCatName" name="name" required
                       class="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100">
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onclick="closeEditCatModal()" class="px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300">
                    Batal
                </button>
                <button type="submit" class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs">
                    Simpan Perubahan
                </button>
            </div>
        </form>
    </div>
</div>

@push('scripts')
<script>
    function openEditCatModal(id, name) {
        document.getElementById('editCatName').value = name;
        document.getElementById('editCatForm').action = "/admin/categories/" + id;
        const modal = document.getElementById('editCatModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    function closeEditCatModal() {
        const modal = document.getElementById('editCatModal');
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
</script>
@endpush
@endsection

