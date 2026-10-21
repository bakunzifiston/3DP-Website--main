<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query()->with('user:id,name')->latest()->orderByDesc('id');

        return response()->json($this->paginated($query, $request, 30, 100, fn (ActivityLog $a) => [
            ...$a->only(['id', 'action', 'entity', 'entity_id', 'summary', 'created_at']),
            'user_name' => $a->user?->name,
        ]));
    }
}
