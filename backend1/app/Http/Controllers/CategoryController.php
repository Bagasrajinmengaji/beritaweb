<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Tampilkan daftar seluruh kategori lomba.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount(['competitions' => function ($q) {
            $q->where('status', 'approved');
        }])->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Tampilkan detail satu kategori berdasarkan slug atau id.
     */
    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->orWhere('id', $slug)
            ->withCount(['competitions' => function ($q) {
                $q->where('status', 'approved');
            }])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }
}

