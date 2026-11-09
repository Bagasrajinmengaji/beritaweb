<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competition_study_program', function (Blueprint $table) {
            $table->foreignId('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->foreignId('study_program_id')->constrained('study_programs')->cascadeOnDelete();
            $table->primary(['competition_id', 'study_program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_study_program');
    }
};

