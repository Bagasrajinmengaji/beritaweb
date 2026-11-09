<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('organizer');
            $table->enum('competition_level', [
                'Internasional',
                'Nasional',
                'Provinsi',
                'Regional',
                'Internal Kampus'
            ])->default('Nasional');
            $table->longText('description');
            $table->text('requirements')->nullable();
            $table->date('registration_deadline');
            $table->string('registration_url');
            $table->string('registration_fee')->nullable();
            $table->string('contact')->nullable();
            $table->string('source_url')->nullable();
            $table->string('poster')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Index performa query
            $table->index('status');
            $table->index('registration_deadline');
            $table->index('competition_level');
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};

