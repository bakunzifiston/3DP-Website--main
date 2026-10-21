<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ActivityLog extends Model
{
    protected $table = 'activity_log';

    public const UPDATED_AT = null;

    protected $guarded = ['id'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Audit trail for admin actions. Failures are reported but never block the request. */
    public static function record(Request $request, string $action, string $entity, ?int $entityId = null, ?string $summary = null): void
    {
        try {
            static::query()->create([
                'user_id' => $request->user()?->id,
                'action' => $action,
                'entity' => $entity,
                'entity_id' => $entityId,
                'summary' => $summary !== null ? Str::limit($summary, 250, '') : null,
                'ip' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
