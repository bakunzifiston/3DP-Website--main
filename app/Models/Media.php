<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    protected $table = 'media';

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return '/uploads/'.$this->filename;
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
