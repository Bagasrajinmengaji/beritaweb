<?php
namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class NewsController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi: Sekarang terima JPG, JPEG, PNG, dan WEBP
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'image'   => 'required|image|mimes:jpeg,jpg,png,webp|max:5048', // max 5MB
        ]);

        $file = $request->file('image');

        // 2. Buat nama file unik dengan ekstensi .webp
        $filename = Str::random(40) . '.webp';
        $relativePath = 'news/' . $filename;

        // 3. Baca gambar, konversi ke WebP dengan kualitas 80%
        $imageConverted = Image::read($file)->toWebp(80);

        // 4. Simpan hasil konversi ke disk public
        Storage::disk('public')->put($relativePath, (string) $imageConverted);

        // 5. Simpan ke Database
        $news = News::create([
            'title'   => $request->title,
            'content' => $request->content,
            'image'   => Storage::url($relativePath),
        ]);

        return response()->json([
            'message' => 'Berita berhasil diterbitkan!',
            'data'    => $news
        ], 201);
    }
}
?>