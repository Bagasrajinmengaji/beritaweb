<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompetitionRequest;
use App\Http\Requests\UpdateCompetitionRequest;
use App\Http\Resources\CompetitionListResource;
use App\Http\Resources\CompetitionResource;
use App\Models\Competition;
use App\Traits\ProcessesWebpImages;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CompetitionController extends Controller
{
    use ProcessesWebpImages;

    /**
     * Tampilkan katalog lomba publik (hanya yang berstatus 'approved').
     */
    public function index(Request $request): JsonResponse
    {
        $query = Competition::query()
            ->approved()
            ->with(['category', 'studyPrograms']);

        // 1. Pencarian teks (judul, penyelenggara, deskripsi)
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('organizer', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 2. Filter Kategori (berdasarkan ID atau Slug)
        if ($request->filled('category')) {
            $cat = $request->input('category');
            $query->whereHas('category', function ($q) use ($cat) {
                if (is_numeric($cat)) {
                    $q->where('id', (int) $cat);
                } else {
                    $q->where('slug', $cat);
                }
            });
        }

        // 3. Filter Program Studi (berdasarkan ID atau Slug)
        if ($request->filled('study_program')) {
            $prodi = $request->input('study_program');
            $query->whereHas('studyPrograms', function ($q) use ($prodi) {
                if (is_numeric($prodi)) {
                    $q->where('study_programs.id', (int) $prodi);
                } else {
                    $q->where('study_programs.slug', $prodi);
                }
            });
        }

        // 4. Filter Tingkat Kompetisi
        if ($request->filled('level')) {
            $query->where('competition_level', $request->input('level'));
        }

        // 5. Filter Status Deadline (dibuka / segera ditutup / ditutup)
        if ($request->filled('deadline_status')) {
            $status = $request->input('deadline_status');
            $today = Carbon::now('Asia/Jakarta')->toDateString();
            $soonLimit = Carbon::now('Asia/Jakarta')->addDays(7)->toDateString();

            if ($status === 'dibuka') {
                $query->where('registration_deadline', '>', $soonLimit);
            } elseif ($status === 'segera') {
                $query->whereBetween('registration_deadline', [$today, $soonLimit]);
            } elseif ($status === 'ditutup') {
                $query->where('registration_deadline', '<', $today);
            }
        }

        // 6. Pengurutan (Sorting)
        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'deadline_asc'  => $query->orderBy('registration_deadline', 'asc'),
            'deadline_desc' => $query->orderBy('registration_deadline', 'desc'),
            'title_asc'     => $query->orderBy('title', 'asc'),
            default         => $query->latest('published_at')->latest('id'),
        };

        // 7. Pagination
        $perPage = min(max((int) $request->input('per_page', 12), 1), 50);
        $competitions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CompetitionListResource::collection($competitions),
            'meta' => [
                'current_page' => $competitions->currentPage(),
                'last_page' => $competitions->lastPage(),
                'per_page' => $competitions->perPage(),
                'total' => $competitions->total(),
            ],
        ]);
    }

    /**
     * Tampilkan detail satu lomba berdasarkan slug atau ID (Publik).
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $competition = Competition::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
            ->with(['category', 'studyPrograms', 'user'])
            ->firstOrFail();

        // Cek izin akses: jika belum approved, hanya pemilik atau admin yang bisa melihat
        $user = $request->user('sanctum');
        if ($competition->status !== 'approved') {
            if (!$user || ($user->id !== $competition->user_id && $user->role !== 'admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lomba ini belum disetujui untuk ditampilkan kepada publik.',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => new CompetitionResource($competition),
        ]);
    }

    /**
     * Ajukan lomba baru oleh user terautentikasi (Status awal: 'pending').
     */
    public function store(StoreCompetitionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        return DB::transaction(function () use ($request, $validated, $user) {
            $posterPath = null;
            if ($request->hasFile('poster')) {
                $posterPath = $this->convertAndStoreWebp($request->file('poster'), 'posters');
            }

            $competition = Competition::create([
                'user_id' => $user->id,
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'organizer' => $validated['organizer'],
                'competition_level' => $validated['competition_level'],
                'description' => $validated['description'],
                'requirements' => $validated['requirements'] ?? null,
                'registration_deadline' => $validated['registration_deadline'],
                'registration_url' => $validated['registration_url'],
                'registration_fee' => $validated['registration_fee'] ?? 'Gratis',
                'contact' => $validated['contact'] ?? null,
                'source_url' => $validated['source_url'] ?? null,
                'poster' => $posterPath,
                'status' => 'pending', // Wajib pending menunggu review admin
            ]);

            // Hubungkan dengan program studi yang dipilih
            if (!empty($validated['study_program_ids'])) {
                $competition->studyPrograms()->sync($validated['study_program_ids']);
            }

            $competition->load(['category', 'studyPrograms', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Informasi lomba berhasil diajukan! Admin akan memverifikasi sebelum ditampilkan ke publik.',
                'data' => new CompetitionResource($competition),
            ], 201);
        });
    }

    /**
     * Tampilkan daftar lomba milik user yang sedang login (Dashboard Mahasiswa).
     */
    public function myCompetitions(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Competition::where('user_id', $user->id)
            ->with(['category', 'studyPrograms']);

        // Filter status moderasi pengajuan (pending, approved, rejected, draft)
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = min(max((int) $request->input('per_page', 10), 1), 50);
        $competitions = $query->latest('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => CompetitionListResource::collection($competitions),
            'meta' => [
                'current_page' => $competitions->currentPage(),
                'last_page' => $competitions->lastPage(),
                'per_page' => $competitions->perPage(),
                'total' => $competitions->total(),
            ],
        ]);
    }

    /**
     * Tampilkan detail satu lomba milik user sendiri (untuk periksa revisi/edit).
     */
    public function myShow(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $competition = Competition::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['category', 'studyPrograms', 'user'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new CompetitionResource($competition),
        ]);
    }

    /**
     * Update/perbaiki pengajuan lomba milik user sendiri.
     */
    public function update(UpdateCompetitionRequest $request, int $id): JsonResponse
    {
        $user = $request->user();
        $competition = Competition::findOrFail($id);

        // Hanya pemilik atau admin yang berhak mengedit
        if ($competition->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk mengubah pengajuan lomba ini.',
            ], 403);
        }

        $validated = $request->validated();

        return DB::transaction(function () use ($request, $validated, $competition) {
            // Jika ada poster baru, konversi dan hapus poster lama
            if ($request->hasFile('poster')) {
                $oldPoster = $competition->poster;
                $competition->poster = $this->convertAndStoreWebp($request->file('poster'), 'posters');
                $this->deletePhysicalImage($oldPoster);
            }

            // Jika sebelumnya ditolak atau draft, kembalikan ke 'pending' saat diedit
            if (in_array($competition->status, ['rejected', 'draft'])) {
                $competition->status = 'pending';
                $competition->rejection_reason = null;
            }

            // Isi atribut yang diubah
            $competition->fill(collect($validated)->except(['poster', 'study_program_ids'])->toArray());
            $competition->save();

            // Sync prodi jika ada
            if (isset($validated['study_program_ids'])) {
                $competition->studyPrograms()->sync($validated['study_program_ids']);
            }

            $competition->load(['category', 'studyPrograms', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Informasi lomba berhasil diperbarui.',
                'data' => new CompetitionResource($competition),
            ]);
        });
    }

    /**
     * Hapus pengajuan lomba.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $competition = Competition::findOrFail($id);

        if ($competition->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki hak untuk menghapus lomba ini.',
            ], 403);
        }

        // Hapus poster fisik
        $this->deletePhysicalImage($competition->poster);
        $competition->delete();

        return response()->json([
            'success' => true,
            'message' => 'Informasi lomba berhasil dihapus.',
        ]);
    }
}

