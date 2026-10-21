<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    public const STATUSES = ['new', 'read', 'replied', 'archived'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $hidden = ['ip'];
}
