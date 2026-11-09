<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompetitionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user('sanctum');
        $isOwnerOrAdmin = $user && ($user->id === $this->user_id || $user->role === 'admin');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'organizer' => $this->organizer,
            'competition_level' => $this->competition_level,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'registration_deadline' => $this->registration_deadline?->format('Y-m-d'),
            'registration_status' => $this->registration_status,
            'days_remaining' => $this->days_remaining,
            'registration_url' => $this->registration_url,
            'registration_fee' => $this->registration_fee,
            'contact' => $this->contact,
            'source_url' => $this->source_url,
            'poster_url' => $this->poster_url,
            'status' => $this->status,
            'rejection_reason' => $this->when($isOwnerOrAdmin, $this->rejection_reason),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'study_programs' => StudyProgramResource::collection($this->whenLoaded('studyPrograms')),
            'author' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'username' => $this->user->username,
                    'avatar' => $this->user->avatar,
                ];
            }),
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

