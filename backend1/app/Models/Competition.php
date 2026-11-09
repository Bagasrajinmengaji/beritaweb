<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Competition extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'organizer',
        'competition_level',
        'description',
        'requirements',
        'registration_deadline',
        'registration_url',
        'registration_fee',
        'contact',
        'source_url',
        'poster',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'published_at',
    ];

    protected $casts = [
        'registration_deadline' => 'date',
        'reviewed_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    protected $appends = [
        'registration_status',
        'days_remaining',
        'poster_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($competition) {
            if (empty($competition->slug)) {
                $baseSlug = Str::slug($competition->title);
                $slug = $baseSlug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }
                $competition->slug = $slug;
            }
        });
    }

    /* ─── Relations ──────────────────────────────────────────────────────────── */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function studyPrograms(): BelongsToMany
    {
        return $this->belongsToMany(
            StudyProgram::class,
            'competition_study_program',
            'competition_id',
            'study_program_id'
        );
    }

    public function csMessages(): HasMany
    {
        return $this->hasMany(CustomerServiceMessage::class, 'competition_id');
    }

    /* ─── Scopes ─────────────────────────────────────────────────────────────── */

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', 'rejected');
    }

    /* ─── Accessors & Helpers ────────────────────────────────────────────────── */

    /**
     * Hitung status pendaftaran berdasarkan tanggal deadline (Zona Asia/Jakarta).
     * Ambang 'Segera Ditutup' adalah <= 7 hari.
     */
    public function getRegistrationStatusAttribute(): string
    {
        if (!$this->registration_deadline) {
            return 'Pendaftaran Ditutup';
        }

        $now = Carbon::now('Asia/Jakarta')->startOfDay();
        $deadline = Carbon::parse($this->registration_deadline, 'Asia/Jakarta')->startOfDay();

        if ($now->greaterThan($deadline)) {
            return 'Pendaftaran Ditutup';
        }

        $diffDays = $now->diffInDays($deadline, false);

        if ($diffDays <= 7) {
            return 'Segera Ditutup';
        }

        return 'Pendaftaran Dibuka';
    }

    /**
     * Sisa hari hingga batas penutupan pendaftaran.
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->registration_deadline) {
            return 0;
        }

        $now = Carbon::now('Asia/Jakarta')->startOfDay();
        $deadline = Carbon::parse($this->registration_deadline, 'Asia/Jakarta')->startOfDay();

        if ($now->greaterThan($deadline)) {
            return 0;
        }

        return (int) $now->diffInDays($deadline, false);
    }

    /**
     * URL lengkap poster untuk diakses frontend/browser.
     */
    public function getPosterUrlAttribute(): ?string
    {
        if (!$this->poster) {
            return null;
        }

        if (Str::startsWith($this->poster, ['http://', 'https://'])) {
            return $this->poster;
        }

        $storagePath = Str::startsWith($this->poster, 'storage/') 
            ? $this->poster 
            : 'storage/' . ltrim($this->poster, '/');

        return asset($storagePath);
    }
}

