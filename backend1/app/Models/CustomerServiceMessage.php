<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerServiceMessage extends Model
{
    use HasFactory;

    protected $table = 'customer_service_messages';

    protected $fillable = [
        'user_id',
        'session_id',
        'user_name',
        'user_email',
        'news_id',
        'news_title',
        'message',
        'sender',
        'is_read_by_admin',
        'is_read_by_user',
        'status',
    ];

    protected $casts = [
        'is_read_by_admin' => 'boolean',
        'is_read_by_user'  => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function news()
    {
        return $this->belongsTo(News::class);
    }
}
