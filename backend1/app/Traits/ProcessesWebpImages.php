<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait ProcessesWebpImages
{
    /**
     * Konversi uploaded image ke format WebP terkompresi dan simpan ke disk public.
     *
     * @param UploadedFile $file
     * @param string $folder Subfolder di public disk (contoh: 'posters')
     * @param int $quality Kualitas WebP (default 80)
     * @return string Path relatif untuk akses URL (contoh: 'storage/posters/xxx.webp')
     */
    public function convertAndStoreWebp(UploadedFile $file, string $folder = 'posters', int $quality = 80): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $realPath = $file->getRealPath();

        // Buat GD image resource berdasarkan format sumber
        $image = match ($extension) {
            'jpeg', 'jpg' => @imagecreatefromjpeg($realPath),
            'png' => @imagecreatefrompng($realPath),
            'webp' => @imagecreatefromwebp($realPath),
            'gif' => @imagecreatefromgif($realPath),
            default => @imagecreatefromstring(file_get_contents($realPath)),
        };

        if (!$image) {
            // Fallback jika GD gagal membuat resource: simpan file asli
            $path = $file->store($folder, 'public');
            return 'storage/' . $path;
        }

        // Tangani palette/truecolor & alpha channel transparansi
        if (!imageistruecolor($image)) {
            imagepalettetotruecolor($image);
        }
        imagealphablending($image, false);
        imagesavealpha($image, true);

        // Pastikan direktori tujuan tersedia di storage/app/public/{folder}
        Storage::disk('public')->makeDirectory($folder);

        $filename = Str::random(40) . '.webp';
        $fullPath = Storage::disk('public')->path("{$folder}/{$filename}");

        // Simpan sebagai WebP
        imagewebp($image, $fullPath, $quality);
        imagedestroy($image);

        return "storage/{$folder}/{$filename}";
    }

    /**
     * Hapus file gambar fisik dari disk storage.
     */
    public function deletePhysicalImage(?string $path): void
    {
        if (empty($path)) {
            return;
        }

        // Jangan hapus placeholder default
        if (str_contains($path, 'placeholder')) {
            return;
        }

        // Bersihkan prefix storage/ atau /storage/
        $cleanPath = preg_replace('#^/?storage/#', '', $path);

        if (Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        }
    }
}

