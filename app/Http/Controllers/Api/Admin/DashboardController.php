<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Inquiry;
use App\Models\Post;
use App\Models\Program;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $counts = [
            'new_inquiries' => Inquiry::query()->where('status', 'new')->count(),
            'total_inquiries' => Inquiry::query()->count(),
            'new_applications' => Application::query()->where('status', 'new')->count(),
            'total_applications' => Application::query()->count(),
            'published_services' => Service::query()->where('is_published', true)->count(),
            'published_programs' => Program::query()->where('is_published', true)->count(),
            'published_posts' => Post::query()->where('status', 'published')->count(),
            'draft_posts' => Post::query()->where('status', 'draft')->count(),
        ];

        // Submissions per week (weeks start on Monday) for the last 8 weeks, for the dashboard trend chart.
        $since = now()->subWeeks(8);
        $weekOf = fn ($date) => Carbon::parse($date)->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $inquiryWeeks = Inquiry::query()->where('created_at', '>=', $since)->pluck('created_at')->map($weekOf)->countBy();
        $applicationWeeks = Application::query()->where('created_at', '>=', $since)->pluck('created_at')->map($weekOf)->countBy();
        $weekly = $inquiryWeeks->keys()->merge($applicationWeeks->keys())->unique()->sort()->values()
            ->map(fn ($week) => [
                'week' => $week,
                'inquiries' => $inquiryWeeks[$week] ?? 0,
                'applications' => $applicationWeeks[$week] ?? 0,
            ]);

        return response()->json(['data' => [
            'counts' => $counts,
            'recentInquiries' => Inquiry::query()->latest()->limit(5)->get(['id', 'name', 'organization', 'interest', 'status', 'created_at']),
            'recentApplications' => Application::query()->latest()->limit(5)->get(['id', 'full_name', 'program_title', 'status', 'created_at']),
            'weekly' => $weekly,
            'applicationsByProgram' => Application::query()
                ->selectRaw('program_title, COUNT(*) AS total')
                ->groupBy('program_title')->orderByDesc('total')->limit(6)->get()
                ->map(fn ($row) => ['program' => $row->program_title, 'total' => (int) $row->total]),
        ]]);
    }
}
