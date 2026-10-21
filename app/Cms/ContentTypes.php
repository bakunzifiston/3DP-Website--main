<?php

namespace App\Cms;

use App\Models\Post;
use App\Models\Program;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\Testimonial;
use Illuminate\Validation\Rule;

/**
 * Declarative definitions of the CMS content types. Each entry drives the generic admin ContentController
 * (validation, defaults, search, filters, ordering), so adding a field means touching one place.
 */
class ContentTypes
{
    public const SLUG_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    public const IMAGE_PATH_PATTERN = '/^\/uploads\/[A-Za-z0-9._-]+$/';

    public static function all(): array
    {
        return [
            'services' => [
                'model' => Service::class,
                'label' => 'Service',
                'title' => 'title',
                'search' => ['title', 'summary'],
                'order' => [['sort_order', 'asc'], ['id', 'asc']],
                'filters' => ['pillar' => ['train', 'build', 'advise']],
                'lists' => ['features', 'outcomes'],
                'defaults' => ['is_published' => true, 'sort_order' => 0, 'features' => [], 'outcomes' => []],
                'rules' => fn (?int $id) => [
                    'title' => ['required', 'string', 'max:160'],
                    'slug' => self::slugRules('services', $id),
                    'pillar' => ['required', Rule::in(['train', 'build', 'advise'])],
                    'summary' => ['required', 'string', 'max:400'],
                    'body' => ['nullable', 'string', 'max:20000'],
                    'features' => ['array', 'max:20'],
                    'features.*' => ['nullable', 'string', 'max:200'],
                    'outcomes' => ['array', 'max:12'],
                    'outcomes.*' => ['nullable', 'string', 'max:200'],
                    'image' => self::imageRules(),
                    'sort_order' => ['integer', 'between:-9999,9999'],
                    'is_published' => ['boolean'],
                ],
            ],

            'programs' => [
                'model' => Program::class,
                'label' => 'Program',
                'title' => 'title',
                'search' => ['title', 'summary'],
                'order' => [['sort_order', 'asc'], ['id', 'asc']],
                'filters' => [],
                'lists' => ['tracks'],
                'defaults' => ['is_published' => true, 'accepting_applications' => true, 'sort_order' => 0, 'tracks' => []],
                'rules' => fn (?int $id) => [
                    'title' => ['required', 'string', 'max:160'],
                    'slug' => self::slugRules('programs', $id),
                    'summary' => ['required', 'string', 'max:400'],
                    'body' => ['nullable', 'string', 'max:20000'],
                    'tracks' => ['array', 'max:12'],
                    'tracks.*' => ['nullable', 'string', 'max:120'],
                    'audience' => ['nullable', 'string', 'max:255'],
                    'format' => ['nullable', 'string', 'max:160'],
                    'duration' => ['nullable', 'string', 'max:120'],
                    'schedule' => ['nullable', 'string', 'max:160'],
                    'level' => ['nullable', 'string', 'max:80'],
                    'fee' => ['nullable', 'string', 'max:120'],
                    'next_intake' => ['nullable', 'date_format:Y-m-d'],
                    'accepting_applications' => ['boolean'],
                    'image' => self::imageRules(),
                    'sort_order' => ['integer', 'between:-9999,9999'],
                    'is_published' => ['boolean'],
                ],
            ],

            'posts' => [
                'model' => Post::class,
                'label' => 'Article',
                'title' => 'title',
                'search' => ['title', 'excerpt', 'category'],
                'order' => [['published_at', 'desc'], ['created_at', 'desc'], ['id', 'desc']],
                'filters' => ['status' => ['draft', 'published']],
                'lists' => [],
                'defaults' => ['status' => 'draft'],
                'rules' => fn (?int $id) => [
                    'title' => ['required', 'string', 'max:200'],
                    'slug' => self::slugRules('posts', $id, 160),
                    'excerpt' => ['required', 'string', 'max:400'],
                    'body' => ['required', 'string', 'max:100000'],
                    'category' => ['nullable', 'string', 'max:80'],
                    'cover_image' => self::imageRules(),
                    'author_name' => ['nullable', 'string', 'max:120'],
                    'status' => ['required', Rule::in(['draft', 'published'])],
                    'published_at' => ['nullable', 'date'],
                ],
                // Publishing without a date stamps it with "now" so it sorts correctly on the public site.
                'before_save' => function (array $data) {
                    if (($data['status'] ?? null) === 'published' && empty($data['published_at'])) {
                        $data['published_at'] = now();
                    }

                    return $data;
                },
            ],

            'team' => [
                'model' => TeamMember::class,
                'label' => 'Team member',
                'title' => 'name',
                'search' => ['name', 'role'],
                'order' => [['sort_order', 'asc'], ['id', 'asc']],
                'filters' => [],
                'lists' => [],
                'defaults' => ['is_published' => true, 'sort_order' => 0],
                'rules' => fn (?int $id) => [
                    'name' => ['required', 'string', 'max:120'],
                    'role' => ['required', 'string', 'max:140'],
                    'bio' => ['nullable', 'string', 'max:2000'],
                    'photo' => self::imageRules(),
                    'linkedin_url' => ['nullable', 'url:https', 'max:255'],
                    'sort_order' => ['integer', 'between:-9999,9999'],
                    'is_published' => ['boolean'],
                ],
            ],

            'testimonials' => [
                'model' => Testimonial::class,
                'label' => 'Testimonial',
                'title' => 'author_name',
                'search' => ['author_name', 'organization', 'quote'],
                'order' => [['sort_order', 'asc'], ['id', 'asc']],
                'filters' => [],
                'lists' => [],
                'defaults' => ['is_published' => false, 'sort_order' => 0],
                'rules' => fn (?int $id) => [
                    'quote' => ['required', 'string', 'max:1200'],
                    'author_name' => ['required', 'string', 'max:120'],
                    'author_title' => ['nullable', 'string', 'max:140'],
                    'organization' => ['nullable', 'string', 'max:140'],
                    'sort_order' => ['integer', 'between:-9999,9999'],
                    'is_published' => ['boolean'],
                ],
            ],
        ];
    }

    public static function get(string $name): array
    {
        $types = self::all();
        abort_unless(isset($types[$name]), 404);

        return $types[$name];
    }

    public static function slugRules(string $table, ?int $ignoreId, int $max = 140): array
    {
        return ['required', 'string', "max:$max", 'regex:'.self::SLUG_PATTERN, Rule::unique($table, 'slug')->ignore($ignoreId)];
    }

    /** Images must come from the media library: same-site upload paths only, never arbitrary URLs. */
    public static function imageRules(): array
    {
        return ['nullable', 'string', 'max:255', 'regex:'.self::IMAGE_PATH_PATTERN];
    }

    public static function messages(): array
    {
        return [
            'slug.unique' => 'This URL slug is already in use.',
            'slug.regex' => 'Use lowercase letters, numbers and hyphens only.',
            '*.regex' => 'Choose an image from the media library.',
            'linkedin_url.url' => 'Enter a full https:// link.',
        ];
    }
}
