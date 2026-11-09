<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompetitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|integer|exists:categories,id',
            'organizer' => 'sometimes|required|string|max:255',
            'competition_level' => 'sometimes|required|in:Internasional,Nasional,Provinsi,Regional,Internal Kampus',
            'description' => 'sometimes|required|string|min:20',
            'requirements' => 'nullable|string',
            'registration_deadline' => 'sometimes|required|date',
            'registration_url' => 'sometimes|required|url|max:500',
            'registration_fee' => 'nullable|string|max:100',
            'contact' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:500',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            'study_program_ids' => 'sometimes|required|array|min:1',
            'study_program_ids.*' => 'integer|exists:study_programs,id',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul lomba wajib diisi.',
            'category_id.required' => 'Pilih kategori lomba yang sesuai.',
            'category_id.exists' => 'Kategori lomba tidak valid.',
            'organizer.required' => 'Nama penyelenggara lomba wajib diisi.',
            'competition_level.required' => 'Pilih tingkat kompetisi.',
            'description.required' => 'Deskripsi lomba wajib diisi.',
            'description.min' => 'Deskripsi lomba minimal 20 karakter.',
            'registration_deadline.required' => 'Batas akhir pendaftaran (deadline) wajib diisi.',
            'registration_url.required' => 'Tautan / link pendaftaran resmi wajib diisi.',
            'registration_url.url' => 'Format tautan pendaftaran harus berupa URL yang valid.',
            'poster.image' => 'File poster harus berupa gambar.',
            'poster.mimes' => 'Format poster yang diizinkan adalah JPG, JPEG, PNG, atau WebP.',
            'poster.max' => 'Ukuran poster maksimal 3 MB.',
            'study_program_ids.required' => 'Pilih minimal satu program studi yang sesuai.',
            'study_program_ids.min' => 'Pilih minimal satu program studi yang sesuai.',
            'study_program_ids.*.exists' => 'Salah satu program studi yang dipilih tidak valid.',
        ];
    }
}

