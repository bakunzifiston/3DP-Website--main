<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'is_active'];

    protected $hidden = ['password', 'remember_token', 'failed_logins'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'locked_until' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    /** Shape returned by /api/auth/me and login. */
    public function toAuthArray(): array
    {
        return $this->only(['id', 'name', 'email', 'role']);
    }
}
