<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    public const STATUSES = ['new', 'reviewing', 'accepted', 'waitlisted', 'rejected'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $hidden = ['ip'];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
