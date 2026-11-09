<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_service_messages', function (Blueprint $table) {
            $table->foreignId('competition_id')->nullable()->after('news_title')->constrained('competitions')->nullOnDelete();
            $table->string('competition_title')->nullable()->after('competition_id');
        });
    }

    public function down(): void
    {
        Schema::table('customer_service_messages', function (Blueprint $table) {
            $table->dropForeign(['competition_id']);
            $table->dropColumn(['competition_id', 'competition_title']);
        });
    }
};

