@extends('layouts.admin')

@section('title', 'Edit Lomba: ' . $competition->title)
@section('page_title', 'Edit & Koreksi Data Lomba')

@section('content')
<div class="space-y-6 max-w-4xl">

    <div class="flex items-center justify-between">
        <a href="{{ route('admin.competitions.index') }}" 
           class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Daftar Lomba</span>
        </a>
    </div>

    <form action="{{ route('admin.competitions.update', $competition->id) }}" method="POST" enctype="multipart/form-data"
          class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        @csrf
        @method('PUT')

        <div class="border-b border-slate-800 pb-4">
            <h2 class="text-base font-bold text-white">Form Koreksi Informasi Lomba</h2>
            <p class="text-xs text-slate-400">Admin dapat mengoreksi data atau mengubah status secara manual.</p>
        </div>

        <!-- Judul -->
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Judul Lomba *</label>
            <input type="text" name="title" value="{{ old('title', $competition->title) }}" required
                   class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
            @error('title')
                <p class="text-xs text-rose-400 mt-1">{{ $message }}</p>
            @enderror
        </div>

        <!-- Kategori & Tingkat -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Kategori Lomba *</label>
                <select name="category_id" required class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
                    @foreach($categories as $cat)
                        <option value="{{ $cat->id }}" {{ old('category_id', $competition->category_id) == $cat->id ? 'selected' : '' }}>
                            {{ $cat->name }}
                        </option>
                    @endforeach
                </select>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Tingkat Kompetisi *</label>
                <select name="competition_level" required class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
                    @foreach(['Internasional', 'Nasional', 'Provinsi', 'Regional', 'Internal Kampus'] as $lvl)
                        <option value="{{ $lvl }}" {{ old('competition_level', $competition->competition_level) == $lvl ? 'selected' : '' }}>
                            {{ $lvl }}
                        </option>
                    @endforeach
                </select>
            </div>
        </div>

        <!-- Penyelenggara & Biaya -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Penyelenggara *</label>
                <input type="text" name="organizer" value="{{ old('organizer', $competition->organizer) }}" required
                       class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Biaya Pendaftaran</label>
                <input type="text" name="registration_fee" value="{{ old('registration_fee', $competition->registration_fee) }}"
                       class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500" placeholder="Gratis / Rp 50.000">
            </div>
        </div>

        <!-- Deadline & Link Pendaftaran -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Batas Akhir Pendaftaran (Deadline) *</label>
                <input type="date" name="registration_deadline" 
                       value="{{ old('registration_deadline', $competition->registration_deadline?->format('Y-m-d')) }}" required
                       class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Link Pendaftaran Resmi *</label>
                <input type="url" name="registration_url" value="{{ old('registration_url', $competition->registration_url) }}" required
                       class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
            </div>
        </div>

        <!-- Deskripsi -->
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Lomba *</label>
            <textarea name="description" rows="4" required
                      class="w-full p-3.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">{{ old('description', $competition->description) }}</textarea>
        </div>

        <!-- Persyaratan -->
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Persyaratan Peserta</label>
            <textarea name="requirements" rows="3"
                      class="w-full p-3.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">{{ old('requirements', $competition->requirements) }}</textarea>
        </div>

        <!-- Program Studi Sasaran (Checkboxes) -->
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Program Studi Sasaran (UMPKU Surakarta) *</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 bg-slate-950 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                @php
                    $selectedProdis = old('study_program_ids', $competition->studyPrograms->pluck('id')->toArray());
                @endphp
                @foreach($studyPrograms as $prodi)
                    <label class="flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer hover:bg-slate-900 text-slate-300">
                        <input type="checkbox" name="study_program_ids[]" value="{{ $prodi->id }}"
                               {{ in_array($prodi->id, $selectedProdis) ? 'checked' : '' }}
                               class="rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900">
                        <span>{{ $prodi->name }}</span>
                    </label>
                @endforeach
            </div>
        </div>

        <!-- Status Moderasi & Catatan Penolakan -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Status Moderasi *</label>
                <select name="status" class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">
                    <option value="pending" {{ old('status', $competition->status) == 'pending' ? 'selected' : '' }}>Pending (Menunggu)</option>
                    <option value="approved" {{ old('status', $competition->status) == 'approved' ? 'selected' : '' }}>Approved (Disetujui/Tayang)</option>
                    <option value="rejected" {{ old('status', $competition->status) == 'rejected' ? 'selected' : '' }}>Rejected (Ditolak/Revisi)</option>
                </select>
            </div>

            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">Ganti Poster (Maks 3MB)</label>
                <input type="file" name="poster" accept="image/*"
                       class="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white">
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Catatan Alasan Penolakan (Jika ditolak)</label>
            <textarea name="rejection_reason" rows="2"
                      placeholder="Tulis alasan jika status diubah menjadi rejected..."
                      class="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500">{{ old('rejection_reason', $competition->rejection_reason) }}</textarea>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <a href="{{ route('admin.competitions.index') }}" class="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                Batal
            </a>
            <button type="submit" class="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md transition-colors">
                Simpan Perubahan
            </button>
        </div>
    </form>

</div>
@endsection

