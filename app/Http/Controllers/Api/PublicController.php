<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Program;
use App\Models\Service;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only endpoints for the public website. Only published content and public columns are exposed.
 */
class PublicController extends Controller
{
    private const SERVICE_COLUMNS = ['id', 'slug', 'title', 'pillar', 'summary', 'body', 'features', 'outcomes', 'image', 'sort_order'];

    private const PROGRAM_COLUMNS = ['id', 'slug', 'title', 'summary', 'body', 'tracks', 'audience', 'format', 'duration', 'schedule', 'level', 'fee', 'next_intake', 'accepting_applications', 'image', 'sort_order'];

    private const POST_COLUMNS = ['id', 'slug', 'title', 'excerpt', 'category', 'cover_image', 'author_name', 'published_at'];

    private function cached(array $payload, int $seconds = 60): JsonResponse
    {
        return response()->json($payload)->header('Cache-Control', "public, max-age=$seconds");
    }

    public function settings(): JsonResponse
    {
        return $this->cached(['data' => Setting::allValues()]);
    }

    public function services(): JsonResponse
    {
        $services = Service::query()->where('is_published', true)->orderBy('sort_order')->orderBy('id')->get(self::SERVICE_COLUMNS);

        return $this->cached(['data' => $services]);
    }

    public function service(string $slug): JsonResponse
    {
        $service = Service::query()->where('slug', $slug)->where('is_published', true)->firstOrFail(self::SERVICE_COLUMNS);

        return $this->cached(['data' => $service]);
    }

    public function programs(): JsonResponse
    {
        $programs = Program::query()->where('is_published', true)->orderBy('sort_order')->orderBy('id')->get(self::PROGRAM_COLUMNS);

        return $this->cached(['data' => $programs]);
    }

    public function program(string $slug): JsonResponse
    {
        $program = Program::query()->where('slug', $slug)->where('is_published', true)->firstOrFail(self::PROGRAM_COLUMNS);

        return $this->cached(['data' => $program]);
    }

    public function posts(Request $request): JsonResponse
    {
        $query = Post::query()->live()->select(self::POST_COLUMNS)->orderByDesc('published_at')->orderByDesc('id');
        if ($category = mb_substr((string) $request->query('category', ''), 0, 80)) {
            $query->where('category', $category);
        }
        $payload = $this->paginated($query, $request, 9, 24);
        $payload['categories'] = Post::query()->live()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category');

        return $this->cached($payload);
    }

    public function post(string $slug): JsonResponse
    {
        $post = Post::query()->live()->where('slug', $slug)->firstOrFail([...self::POST_COLUMNS, 'body']);
        $related = Post::query()->live()->where('id', '!=', $post->id)
            ->orderByRaw('CASE WHEN category = ? THEN 0 ELSE 1 END', [$post->category])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get(self::POST_COLUMNS);

        return $this->cached(['data' => $post, 'related' => $related]);
    }

    public function team(): JsonResponse
    {
        $team = TeamMember::query()->where('is_published', true)->orderBy('sort_order')->orderBy('id')
            ->get(['id', 'name', 'role', 'bio', 'photo', 'linkedin_url']);

        return $this->cached(['data' => $team]);
    }

    public function testimonials(): JsonResponse
    {
        $testimonials = Testimonial::query()->where('is_published', true)->orderBy('sort_order')->orderBy('id')
            ->get(['id', 'quote', 'author_name', 'author_title', 'organization']);

        return $this->cached(['data' => $testimonials]);
    }
}
