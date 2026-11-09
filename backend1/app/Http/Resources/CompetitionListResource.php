<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompetitionListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user('sanctum') ?? $request->user();
        $isOwnerOrAdmin = $user && ($user->id === $this->user_id || $user->role === 'admin');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'organizer' => $this->organizer,
            'competition_level' => $this->competition_level,
            'registration_deadline' => $this->registration_deadline?->format('Y-m-d'),
            'registration_status' => $this->registration_status,
            'days_remaining' => $this->days_remaining,
            'registration_fee' => $this->registration_fee,
            'poster_url' => $this->poster_url,
            'status' => $this->status,
            'rejection_reason' => $this->when($isOwnerOrAdmin, $this->rejection_reason),
            'category' => $this->whenLoaded('category', function () {
                return [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                    'slug' => $this->category->slug,
                ];
            }),
            'study_programs' => $this->whenLoaded('studyPrograms', function () {
                return $this->studyPrograms->map(function ($prodi) {
                    return [
                        'id' => $prodi->id,
                        'name' => $prodi->name,
                        'slug' => $prodi->slug,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

