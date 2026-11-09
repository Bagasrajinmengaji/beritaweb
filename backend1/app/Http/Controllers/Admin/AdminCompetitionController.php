<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Models\Category;
use App\Models\StudyProgram;
use App\Traits\ProcessesWebpImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminCompetitionController extends Controller
{
    use ProcessesWebpImages;

    /**
     * Tampilkan daftar antrean & riwayat lomba dengan filter status.
     */
    public function index(Request $request)
    {
        $query = Competition::with(['category', 'user', 'studyPrograms']);

        // Filter status moderasi
        if ($request->filled('status') && in_array($request->status, ['pending', 'approved', 'rejected', 'draft'])) {
            $query->where('status', $request->status);
        }

        // Pencarian judul, penyelenggara, pengirim
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('organizer', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                  });
            });
        }

        // Default urutkan pending teratas, lalu terbaru
        $competitions = $query
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $pendingCount = Competition::where('status', 'pending')->count();
        $approvedCount = Competition::where('status', 'approved')->count();
        $rejectedCount = Competition::where('status', 'rejected')->count();

        return view('admin.competitions.index', compact(
            'competitions',
            'pendingCount',
            'approvedCount',
            'rejectedCount'
        ));
    }

    /**
     * Tampilkan halaman review detail pengajuan lomba.
     */
    public function show(int $id)
    {
        $competition = Competition::with(['category', 'user', 'reviewer', 'studyPrograms'])->findOrFail($id);

        return view('admin.competitions.show', compact('competition'));
    }

    /**
     * Aksi Admin: Menyetujui pengajuan lomba (Approve).
     */
    public function approve(Request $request, int $id)
    {
        $competition = Competition::findOrFail($id);

        $competition->update([
            'status' => 'approved',
            'rejection_reason' => null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'published_at' => $competition->published_at ?? now(),
        ]);

        return redirect()->back()->with('success', "Informasi lomba \"{$competition->title}\" berhasil disetujui dan kini tayang kepada publik.");
    }

    /**
     * Aksi Admin: Menolak pengajuan lomba dengan alasan perbaikan (Reject).
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:5|max:1000',
        ], [
            'rejection_reason.required' => 'Wajib memberikan catatan/alasan penolakan kepada pengaju.',
            'rejection_reason.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $competition = Competition::findOrFail($id);

        $competition->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', "Pengajuan lomba \"{$competition->title}\" telah ditolak. Catatan perbaikan telah dikirimkan ke mahasiswa pengaju.");
    }

    /**
     * Tampilkan form edit lomba oleh admin.
     */
    public function edit(int $id)
    {
        $competition = Competition::with('studyPrograms')->findOrFail($id);
        $categories = Category::orderBy('name')->get();
        $studyPrograms = StudyProgram::where('is_active', true)->orderBy('name')->get();

        return view('admin.competitions.edit', compact('competition', 'categories', 'studyPrograms'));
    }

    /**
     * Update data lomba oleh admin.
     */
    public function update(Request $request, int $id)
    {
        $competition = Competition::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'organizer' => 'required|string|max:255',
            'competition_level' => 'required|in:Internasional,Nasional,Provinsi,Regional,Internal Kampus',
            'description' => 'required|string|min:20',
            'requirements' => 'nullable|string',
            'registration_deadline' => 'required|date',
            'registration_url' => 'required|url|max:500',
            'registration_fee' => 'nullable|string|max:100',
            'contact' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:500',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            'study_program_ids' => 'required|array|min:1',
            'study_program_ids.*' => 'exists:study_programs,id',
            'status' => 'required|in:pending,approved,rejected,draft',
            'rejection_reason' => 'nullable|string',
        ]);

        // Upload poster baru jika diganti
        if ($request->hasFile('poster')) {
            $oldPoster = $competition->poster;
            $competition->poster = $this->convertAndStoreWebp($request->file('poster'), 'posters');
            $this->deletePhysicalImage($oldPoster);
        }

        $competition->fill(collect($validated)->except(['poster', 'study_program_ids'])->toArray());

        if ($validated['status'] === 'approved' && !$competition->published_at) {
            $competition->published_at = now();
        }

        $competition->save();

        if (isset($validated['study_program_ids'])) {
            $competition->studyPrograms()->sync($validated['study_program_ids']);
        }

        return redirect()->route('admin.competitions.index')->with('success', "Informasi lomba \"{$competition->title}\" berhasil diperbarui.");
    }

    /**
     * Hapus permanen pengajuan lomba.
     */
    public function destroy(int $id)
    {
        $competition = Competition::findOrFail($id);

        $this->deletePhysicalImage($competition->poster);
        $competition->delete();

        return redirect()->route('admin.competitions.index')->with('success', "Informasi lomba \"{$competition->title}\" berhasil dihapus secara permanen.");
    }
}

