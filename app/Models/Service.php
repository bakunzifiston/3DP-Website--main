<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'outcomes' => 'array',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
