@extends('layouts.admin')

@section('title', 'Tambah Berita Baru')
@section('page_title', 'Tambah Berita Baru')

@push('styles')
    <!-- Quill.js CSS -->
    <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet" />
    <style>
        .ql-toolbar {
            background-color: #0f172a;
            border-color: #334155 !important;
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
        }
        .ql-container {
            background-color: #020617;
            border-color: #334155 !important;
            border-bottom-left-radius: 0.75rem;
            border-bottom-right-radius: 0.75rem;
            color: #f1f5f9;
            font-size: 0.95rem;
            min-height: 250px;
        }
        .ql-snow .ql-stroke { stroke: #94a3b8; }
        .ql-snow .ql-fill { fill: #94a3b8; }
        .ql-snow .ql-picker { color: #94a3b8; }
    </style>
@endpush

@section('content')
<div class="max-w-4xl mx-auto space-y-6">

    <div class="flex items-center justify-between">
        <div>
            <h3 class="text-lg font-bold text-white">Formulir Penerbitan Berita</h3>
            <p class="text-xs text-slate-400">Tulis naskah dan unggah foto cover artikel untuk dipublikasikan</p>
        </div>
        <a href="{{ route('admin.news.index') }}" 
           class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            Kembali
        </a>
    </div>

    @if($errors->any())
        <div class="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            <div class="flex items-center gap-2 font-semibold mb-1">
                <i data-lucide="alert-circle" class="w-4 h-4"></i>
                Ada kesalahan pada input Anda:
            </div>
            <ul class="list-disc list-inside space-y-0.5 text-xs text-rose-300">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form id="news-form" action="{{ route('admin.news.store') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
        @csrf

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <!-- Judul Berita -->
            <div>
                <label for="title" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Judul Berita <span class="text-rose-500">*</span>
                </label>
                <input type="text" id="title" name="title" value="{{ old('title') }}" required
                       class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                       placeholder="Contoh: Perkembangan Terbaru Teknologi AI di Indonesia...">
            </div>

            <!-- Penulis -->
            <div>
                <label for="author" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Nama Penulis (Author)
                </label>
                <input type="text" id="author" name="author" value="{{ old('author', auth()->user()->name) }}"
                       class="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                       placeholder="Otomatis menggunakan nama akun Anda jika dikosongkan">
            </div>

            <!-- Upload Cover Gambar -->
            <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Foto Cover Berita <span class="text-rose-500">*</span>
                </label>
                <div class="flex flex-col sm:flex-row items-center gap-4">
                    <div id="image-preview-wrapper" class="w-full sm:w-48 h-32 rounded-xl bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        <img id="image-preview" src="" alt="Preview Cover" class="w-full h-full object-cover hidden">
                        <div id="image-placeholder" class="text-center p-3 text-slate-500">
                            <i data-lucide="image" class="w-6 h-6 mx-auto mb-1"></i>
                            <span class="text-[11px] block">Preview Cover</span>
                        </div>
                    </div>
                    <div class="flex-1 w-full">
                        <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/webp" required
                               class="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-500 file:cursor-pointer cursor-pointer border border-slate-700 rounded-xl bg-slate-950">
                        <p class="text-[11px] text-slate-500 mt-2">
                            Format yang didukung: JPG, PNG, WEBP. Maksimal ukuran file: 5 MB.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Konten Berita (WYSIWYG Quill) -->
            <div>
                <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Konten Naskah Berita <span class="text-rose-500">*</span>
                </label>
                <div id="quill-editor"></div>
                <input type="hidden" name="content" id="content-input" value="{{ old('content') }}">
            </div>
        </div>

        <!-- Submit & Cancel -->
        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('admin.news.index') }}" 
               class="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
                Batal
            </a>
            <button type="submit" 
                    class="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-colors flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4"></i>
                Terbitkan Berita
            </button>
        </div>
    </form>

</div>
@endsection

@push('scripts')
    <!-- Quill.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
    <script>
        // Inisialisasi Quill Rich Text Editor
        const quill = new Quill('#quill-editor', {
            theme: 'snow',
            placeholder: 'Tulis naskah berita lengkap di sini...',
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['blockquote', 'link'],
                    ['clean']
                ]
            }
        });

        // Set konten lama jika ada (validation error fallback)
        const oldContent = document.getElementById('content-input').value;
        if (oldContent) {
            quill.root.innerHTML = oldContent;
        }

        // Sinkronisasi Quill ke input hidden sebelum submit
        document.getElementById('news-form').addEventListener('submit', function() {
            document.getElementById('content-input').value = quill.root.innerHTML;
        });

        // Live image preview
        const imageInput = document.getElementById('image');
        const imagePreview = document.getElementById('image-preview');
        const imagePlaceholder = document.getElementById('image-placeholder');

        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    imagePlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '';
                imagePreview.classList.add('hidden');
                imagePlaceholder.classList.remove('hidden');
            }
        });
    </script>
@endpush

