<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json(['data' => Setting::allValues()]);
    }

    public function update(Request $request): JsonResponse
    {
        $url = ['sometimes', 'nullable', 'url:https', 'max:255'];
        $data = $request->validate([
            'hero_eyebrow' => ['sometimes', 'nullable', 'string', 'max:160'],
            'hero_title' => ['sometimes', 'nullable', 'string', 'max:200'],
            'hero_subtitle' => ['sometimes', 'nullable', 'string', 'max:400'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:190'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'address' => ['sometimes', 'nullable', 'string', 'max:200'],
            'office_hours' => ['sometimes', 'nullable', 'string', 'max:120'],
            'response_time' => ['sometimes', 'nullable', 'string', 'max:120'],
            'linkedin_url' => $url,
            'x_url' => $url,
            'instagram_url' => $url,
            'facebook_url' => $url,
            'youtube_url' => $url,
        ], ['*.url' => 'Enter a full https:// link.']);

        Setting::saveValues($data);
        ActivityLog::record($request, 'updated', 'settings', null, implode(', ', array_keys($data)));

        return response()->json(['data' => Setting::allValues()]);
    }
}
