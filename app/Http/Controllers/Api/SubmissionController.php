<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Inquiry;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Public form submissions: contact enquiries and program applications.
 * Both are rate limited (see AppServiceProvider) and include a honeypot field ("website") that must stay empty.
 */
class SubmissionController extends Controller
{
    private const INTERESTS = ['training', 'data-products', 'systems', 'strategy', 'compliance', 'other'];

    public function inquiry(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'organization' => ['nullable', 'string', 'max:160'],
            'interest' => ['nullable', Rule::in(self::INTERESTS)],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'consent' => ['accepted'],
            'website' => ['prohibited'],
        ], [
            'consent.accepted' => 'Please confirm we may use your details to reply.',
            'website.prohibited' => 'Invalid submission.',
        ]);

        Inquiry::query()->create([
            ...collect($data)->except(['consent', 'website'])->all(),
            'email' => mb_strtolower($data['email']),
            'interest' => $data['interest'] ?? 'other',
            'ip' => $request->ip(),
        ]);

        return response()->json(['ok' => true], 201);
    }

    public function application(Request $request): JsonResponse
    {
        $data = $request->validate([
            'program_slug' => ['required', 'string', 'max:140'],
            'track' => ['nullable', 'string', 'max:120'],
            'full_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'min:7', 'max:40'],
            'occupation' => ['nullable', 'string', 'max:160'],
            'experience_level' => ['nullable', Rule::in(['none', 'beginner', 'intermediate', 'advanced'])],
            'motivation' => ['nullable', 'string', 'max:3000'],
            'consent' => ['accepted'],
            'website' => ['prohibited'],
        ], [
            'consent.accepted' => 'Please confirm we may use your details to process your application.',
            'website.prohibited' => 'Invalid submission.',
        ]);

        $program = Program::query()
            ->where('slug', $data['program_slug'])
            ->where('is_published', true)
            ->where('accepting_applications', true)
            ->first();
        abort_unless($program, 404, 'This program is not accepting applications.');

        Application::query()->create([
            'program_id' => $program->id,
            'program_title' => $program->title,
            'track' => $data['track'] ?? null,
            'full_name' => $data['full_name'],
            'email' => mb_strtolower($data['email']),
            'phone' => $data['phone'],
            'occupation' => $data['occupation'] ?? null,
            'experience_level' => $data['experience_level'] ?? 'none',
            'motivation' => $data['motivation'] ?? null,
            'ip' => $request->ip(),
        ]);

        return response()->json(['ok' => true], 201);
    }
}
