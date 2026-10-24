<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customer_service_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('session_id')->nullable()->index();
            $table->string('user_name')->default('Pengguna');
            $table->string('user_email')->nullable();
            $table->foreignId('news_id')->nullable()->constrained('news')->nullOnDelete();
            $table->string('news_title')->nullable();
            $table->text('message');
            $table->enum('sender', ['user', 'admin', 'bot'])->default('user');
            $table->boolean('is_read_by_admin')->default(false);
            $table->boolean('is_read_by_user')->default(false);
            $table->string('status')->default('open'); // open, in_progress, resolved
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_service_messages');
    }
};
