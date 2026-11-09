<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudyProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminStudyProgramController extends Controller
{
    public function index()
    {
        $programs = StudyProgram::withCount('competitions')->orderBy('name')->paginate(20);
        return view('admin.study_programs.index', compact('programs'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:150|unique:study_programs,name',
        ], [
            'name.required' => 'Nama program studi wajib diisi.',
            'name.unique' => 'Program studi ini sudah terdaftar.',
        ]);

        StudyProgram::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'is_active' => true,
        ]);

        return redirect()->route('admin.study-programs.index')->with('success', 'Program studi baru berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $program = StudyProgram::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:150|unique:study_programs,name,' . $program->id,
        ]);

        $program->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return redirect()->route('admin.study-programs.index')->with('success', 'Program studi berhasil diperbarui.');
    }

    public function toggleActive(int $id)
    {
        $program = StudyProgram::findOrFail($id);
        $program->is_active = !$program->is_active;
        $program->save();

        $statusStr = $program->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Program studi {$program->name} berhasil {$statusStr}.");
    }

    public function destroy(int $id)
    {
        $program = StudyProgram::withCount('competitions')->findOrFail($id);

        if ($program->competitions_count > 0) {
            return redirect()->back()->with('error', 'Program studi ini tidak dapat dihapus karena masih terkait dengan data lomba.');
        }

        $program->delete();

        return redirect()->route('admin.study-programs.index')->with('success', 'Program studi berhasil dihapus.');
    }
}

