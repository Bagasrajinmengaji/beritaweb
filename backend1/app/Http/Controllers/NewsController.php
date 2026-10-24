<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     * Mendukung sorting latest(), pencarian, serta pagination opsional untuk tabel Admin.
     */
    public function index(Request $request)
    {
        $query = News::latest();

        // Pencarian opsional berdasarkan judul atau author
        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        // Jika request meminta per_page atau paginate, kembalikan paginated response
        if ($request->has('per_page') || $request->boolean('paginate')) {
            $perPage = (int) $request->query('per_page', 10);
            return response()->json($query->paginate($perPage), 200);
        }

        // Default: kembalikan seluruh koleksi berita terurut terbaru
        return response()->json($query->get(), 200);
    }

    /**
     * Store a newly created resource in storage.
     * Dilindungi middleware auth:sanctum.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'author'  => 'nullable|string|max:255',
            'content' => 'required|string',
            'image'   => 'required|image|mimes:jpeg,jpg,png,webp|max:5048',
        ]);

        // Ambil nama author otomatis dari user yang login jika input author kosong
        $authorName = $request->input('author')
            ?: (auth()->check() ? auth()->user()->name : 'Redaksi');

        // Konversi gambar menggunakan Native PHP GD ke WebP (kualitas 80%)
        $imageUrl = $this->convertAndStoreWebp($request->file('image'));

        if (!$imageUrl) {
            return response()->json([
                'message' => 'Gagal memproses file gambar dengan PHP GD.'
            ], 422);
        }

        $news = News::create([
            'user_id' => auth()->id(),
            'title'   => $request->title,
            'author'  => $authorName,
            'content' => $request->content,
            'image'   => $imageUrl,
        ]);

        return response()->json([
            'message' => 'Berita berhasil diterbitkan.',
            'data'    => $news,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $news = News::findOrFail($id);
        return response()->json($news, 200);
    }

    /**
     * Update the specified resource in storage.
     * Dilindungi middleware auth:sanctum.
     * Endpoint: PUT/PATCH /api/news/{id}
     */
    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);

        // Otorisasi: Hanya Admin atau Pemilik Artikel yang boleh mengedit
        if (auth()->user()->role !== 'admin' && $news->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Anda hanya dapat mengedit berita buatan sendiri.'
            ], 403);
        }

        $request->validate([
            'title'   => 'sometimes|required|string|max:255',
            'author'  => 'nullable|string|max:255',
            'content' => 'sometimes|required|string',
            'image'   => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5048',
        ]);

        $data = $request->only(['title', 'author', 'content']);

        // Jika ada unggahan gambar baru
        if ($request->hasFile('image')) {
            // 1. Hapus gambar lama dari storage fisik
            $this->deletePhysicalImage($news->image);

            // 2. Olah & simpan gambar baru ke format .webp
            $newImageUrl = $this->convertAndStoreWebp($request->file('image'));

            if (!$newImageUrl) {
                return response()->json([
                    'message' => 'Gagal mengonversi gambar baru ke format WebP.'
                ], 422);
            }

            $data['image'] = $newImageUrl;
        }

        // Update record database
        $news->update($data);

        return response()->json([
            'message' => 'Berita berhasil diperbarui.',
            'data'    => $news->fresh(),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     * Dilindungi middleware auth:sanctum.
     * Endpoint: DELETE /api/news/{id}
     */
    public function destroy($id)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak. Hanya Admin yang dapat menghapus/mengedit berita secara langsung.'
            ], 403);
        }

        $news = News::findOrFail($id);

        // Hapus file fisik gambar dari storage public
        $this->deletePhysicalImage($news->image);

        // Hapus record dari database MySQL
        $news->delete();

        return response()->json([
            'message' => 'Berita berhasil dihapus.'
        ], 200);
    }

    /**
     * Konversi file gambar ke .webp menggunakan Native PHP GD & simpan ke storage/app/public/news/
     */
    protected function convertAndStoreWebp($file): ?string
    {
        $imageContent = file_get_contents($file->getRealPath());
        $gdImage = @imagecreatefromstring($imageContent);

        if (!$gdImage) {
            return null;
        }

        // Pertahankan transparansi untuk PNG/WebP
        if (!imageistruecolor($gdImage)) {
            imagepalettetotruecolor($gdImage);
        }
        imagealphablending($gdImage, true);
        imagesavealpha($gdImage, true);

        // Ekspor ke buffer WebP kualitas 80%
        ob_start();
        imagewebp($gdImage, null, 80);
        $webpData = ob_get_clean();
        imagedestroy($gdImage);

        // Simpan file ke storage/app/public/news/ dengan nama unik
        $filename = Str::random(40) . '.webp';
        $relativePath = 'news/' . $filename;
        Storage::disk('public')->put($relativePath, $webpData);

        return Storage::url($relativePath);
    }

    /**
     * Hapus file fisik gambar dari disk public
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