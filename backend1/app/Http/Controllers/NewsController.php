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
     */
    public function index()
    {
        $news = News::latest()->get();
        return response()->json($news, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'title'   => 'required|string',
            'content' => 'required|string',
            'image'   => 'required|image|mimes:jpeg,jpg,png,webp|max:5048',
        ]);

        $file = $request->file('image');

        // 2. Olah & konversi gambar menggunakan Native PHP GD ke format .webp (kualitas 80%)
        $imageContent = file_get_contents($file->getRealPath());
        $gdImage = @imagecreatefromstring($imageContent);

        if (!$gdImage) {
            return response()->json([
                'message' => 'Gagal memproses file gambar dengan PHP GD.'
            ], 422);
        }

        // Pertahankan transparansi untuk format PNG / WebP
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

        // 3. Simpan file .webp ke folder storage/app/public/news/ menggunakan nama unik
        $filename = Str::random(40) . '.webp';
        $relativePath = 'news/' . $filename;
        Storage::disk('public')->put($relativePath, $webpData);

        // 4. Simpan path relatif gambar ke database MySQL (Storage::url(...))
        $news = News::create([
            'title'   => $request->title,
            'content' => $request->content,
            'image'   => Storage::url($relativePath),
        ]);

        // 5. Kembalikan respons JSON 201 Created
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
     */
    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);

        $request->validate([
            'title'   => 'sometimes|required|string',
            'content' => 'sometimes|required|string',
            'image'   => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5048',
        ]);

        $data = $request->only(['title', 'content']);

        if ($request->hasFile('image')) {
            $this->deletePhysicalImage($news->image);

            $file = $request->file('image');
            $imageContent = file_get_contents($file->getRealPath());
            $gdImage = @imagecreatefromstring($imageContent);

            if ($gdImage) {
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

                $data['image'] = Storage::url($relativePath);
            }
        }

        $news->update($data);

        return response()->json([
            'message' => 'Berita berhasil diperbarui.',
            'data'    => $news,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $news = News::findOrFail($id);

        // Hapus file fisik gambar dari storage public jika data berita dihapus
        $this->deletePhysicalImage($news->image);

        $news->delete();

        return response()->json([
            'message' => 'Berita berhasil dihapus.'
        ], 200);
    }

    /**
     * Hapus file fisik gambar dari storage public
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