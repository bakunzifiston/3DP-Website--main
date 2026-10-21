<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    /** Published and not scheduled for the future. */
    public function scopeLive(Builder $query): Builder
    {
        return $query->where('status', 'published')->where('published_at', '<=', now());
    }
}
