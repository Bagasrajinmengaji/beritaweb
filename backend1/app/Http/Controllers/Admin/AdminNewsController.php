<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminNewsController extends Controller
{
    /**
     * Tampilkan daftar seluruh berita dengan pagination dan pencarian.
     */
    public function index(Request $request)
    {
        $query = News::latest();

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        $news = $query->paginate(10)->withQueryString();

        return view('admin.news.index', compact('news'));
    }

    /**
     * Tampilkan formulir pembuatan berita baru.
     */
    public function create()
    {
        return view('admin.news.create');
    }

    /**
     * Simpan berita baru ke database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'author'  => 'nullable|string|max:255',
            'content' => 'required|string',
            'image'   => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
        ], [
            'title.required'   => 'Judul berita wajib diisi.',
            'content.required' => 'Konten naskah berita wajib diisi.',
            'image.required'   => 'Gambar cover berita wajib diunggah.',
            'image.image'      => 'File yang diunggah harus berupa gambar.',
            'image.mimes'      => 'Format gambar harus jpeg, jpg, png, atau webp.',
            'image.max'        => 'Ukuran gambar maksimal adalah 5MB.',
        ]);

        $authorName = $request->input('author') ?: (Auth::user()->name ?? 'Redaksi');

        $imageUrl = $this->convertAndStoreWebp($request->file('image'));

        if (!$imageUrl) {
            return back()->withInput()->withErrors(['image' => 'Gagal memproses file gambar cover.']);
        }

        News::create([
            'user_id' => Auth::id(),
            'title'   => $request->title,
            'author'  => $authorName,
            'content' => $request->content,
            'image'   => $imageUrl,
        ]);

        return redirect()->route('admin.news.index')->with('success', 'Berita baru berhasil diterbitkan.');
    }

    /**
     * Tampilkan formulir pengeditan berita.
     */
    public function edit($id)
    {
        $item = News::findOrFail($id);
        return view('admin.news.edit', compact('item'));
    }

    /**
     * Perbarui data berita yang ada di database.
     */
    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);

        $request->validate([
            'title'   => 'required|string|max:255',
            'author'  => 'nullable|string|max:255',
            'content' => 'required|string',
            'image'   => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ], [
            'title.required'   => 'Judul berita wajib diisi.',
            'content.required' => 'Konten naskah berita wajib diisi.',
            'image.image'      => 'File yang diunggah harus berupa gambar.',
            'image.mimes'      => 'Format gambar harus jpeg, jpg, png, atau webp.',
            'image.max'        => 'Ukuran gambar maksimal adalah 5MB.',
        ]);

        $dataToUpdate = [
            'title'   => $request->title,
            'author'  => $request->input('author') ?: $news->author,
            'content' => $request->content,
        ];

        if ($request->hasFile('image')) {
            $newImageUrl = $this->convertAndStoreWebp($request->file('image'));
            if ($newImageUrl) {
                $this->deletePhysicalImage($news->image);
                $dataToUpdate['image'] = $newImageUrl;
            }
        }

        $news->update($dataToUpdate);

        return redirect()->route('admin.news.index')->with('success', 'Berita "' . Str::limit($news->title, 40) . '" berhasil diperbarui.');
    }

    /**
     * Hapus berita dari database beserta file fisiknya.
     */
    public function destroy($id)
    {
        $news = News::findOrFail($id);
        $title = $news->title;

        $this->deletePhysicalImage($news->image);
        $news->delete();

        return redirect()->route('admin.news.index')->with('success', 'Berita "' . Str::limit($title, 40) . '" berhasil dihapus.');
    }

    /**
     * Konversi file gambar ke .webp menggunakan PHP GD & simpan ke storage public.
     */
    protected function convertAndStoreWebp($file): ?string
    {
        $imageContent = file_get_contents($file->getRealPath());
        $gdImage = @imagecreatefromstring($imageContent);

        if (!$gdImage) {
            return null;
        }

        if (!imageistruecolor($gdImage)) {
            imagepalettetotruecolor($gdImage);
        }
        imagealphablending($gdImage, true);
        imagesavealpha($gdImage, true);

        ob_start();
        imagewebp($gdImage, null, 80);
        $webpData = ob_get_clean();
        imagedestroy($gdImage);

        $filename = Str::random(40) . '.webp';
        $relativePath = 'news/' . $filename;
        Storage::disk('public')->put($relativePath, $webpData);

        return Storage::url($relativePath);
    }

    /**
     * Hapus file fisik gambar dari disk public.
     */
    protected function deletePhysicalImage(?string $imageUrl): void
    {
        if (empty($imageUrl)) {
            return;
        }

        $cleanPath = ltrim(parse_url($imageUrl, PHP_URL_PATH) ?? $imageUrl, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, strlen('storage/'));
        }

        if (Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        }
    }
}

