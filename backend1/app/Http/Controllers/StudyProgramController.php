<?php

namespace App\Http\Controllers;

use App\Http\Resources\StudyProgramResource;
use App\Models\StudyProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyProgramController extends Controller
{
    /**
     * Tampilkan daftar seluruh program studi aktif.
     */
    public function index(): JsonResponse
    {
        $programs = StudyProgram::where('is_active', true)
            ->withCount(['competitions' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => StudyProgramResource::collection($programs),
        ]);
    }

    /**
     * Tampilkan detail satu program studi.
     */
    public function show(string $slug): JsonResponse
    {
        $program = StudyProgram::where('slug', $slug)
            ->orWhere('id', $slug)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new StudyProgramResource($program),
        ]);
    }
}

