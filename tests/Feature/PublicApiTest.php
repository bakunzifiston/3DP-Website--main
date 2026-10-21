<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\Post;
use App\Models\Program;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_spa_shell_is_served_for_site_and_admin_paths(): void
    {
        foreach (['/', '/services/data-products', '/admin/login', '/does-not-exist'] as $path) {
            $this->get($path)->assertOk()->assertSee('<div id="root"></div>', false);
        }
    }

    public function test_only_published_services_are_listed(): void
    {
        Service::query()->where('slug', 'data-products')->update(['is_published' => false]);

        $this->getJson('/api/public/services')
            ->assertOk()
            ->assertJsonCount(7, 'data')
            ->assertJsonMissing(['slug' => 'data-products']);
        $this->getJson('/api/public/services/data-products')->assertNotFound()->assertJson(['error' => 'Not found']);
    }

    public function test_service_lists_are_returned_as_arrays(): void
    {
        $this->getJson('/api/public/services/data-strategy')
            ->assertOk()
            ->assertJsonPath('data.pillar', 'advise')
            ->assertJsonIsArray('data.features');
    }

    public function test_drafts_and_future_posts_are_hidden(): void
    {
        Post::query()->create(['slug' => 'draft', 'title' => 'Draft', 'excerpt' => 'e', 'body' => 'b', 'status' => 'draft']);
        Post::query()->create(['slug' => 'future', 'title' => 'Future', 'excerpt' => 'e', 'body' => 'b', 'status' => 'published', 'published_at' => now()->addDay()]);

        $this->getJson('/api/public/posts')->assertOk()->assertJsonPath('total', 3)->assertJsonMissing(['slug' => 'draft']);
        $this->getJson('/api/public/posts/future')->assertNotFound();
        $this->getJson('/api/public/posts/what-being-data-driven-means')->assertOk()->assertJsonCount(2, 'related');
    }

    public function test_contact_form_validates_and_stores_inquiries(): void
    {
        $this->postJson('/api/public/inquiries', ['name' => 'A', 'email' => 'nope'])
            ->assertUnprocessable()
            ->assertJsonStructure(['error', 'fields' => ['name', 'email', 'message', 'consent']]);

        $this->postJson('/api/public/inquiries', [
            'name' => 'Jane Doe', 'email' => 'Jane@Example.com', 'message' => 'We need help with dashboards.',
            'interest' => 'data-products', 'consent' => true, 'website' => '',
        ])->assertCreated();

        $this->assertDatabaseHas('inquiries', ['email' => 'jane@example.com', 'status' => 'new', 'interest' => 'data-products']);
    }

    public function test_honeypot_blocks_bots(): void
    {
        $this->postJson('/api/public/inquiries', [
            'name' => 'Bot', 'email' => 'bot@example.com', 'message' => 'Buy cheap things now', 'consent' => true, 'website' => 'http://spam.example',
        ])->assertUnprocessable();

        $this->assertSame(0, Inquiry::query()->count());
    }

    public function test_applications_only_accepted_for_open_programs(): void
    {
        $payload = [
            'program_slug' => 'data-talents-program', 'full_name' => 'Sam Learner', 'email' => 'sam@example.com',
            'phone' => '+250 788 000 000', 'experience_level' => 'beginner', 'consent' => true,
        ];
        $this->postJson('/api/public/applications', $payload)->assertCreated();
        $this->assertDatabaseHas('applications', ['program_title' => 'Data Talents Program', 'status' => 'new']);

        Program::query()->where('slug', 'data-talents-program')->update(['accepting_applications' => false]);
        $this->postJson('/api/public/applications', $payload)->assertNotFound();
    }

    public function test_form_submissions_are_rate_limited(): void
    {
        $payload = ['name' => 'Jane Doe', 'email' => 'jane@example.com', 'message' => 'Hello there, testing.', 'consent' => true];
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/public/inquiries', $payload)->assertCreated();
        }
        $this->postJson('/api/public/inquiries', $payload)->assertStatus(429)->assertJsonStructure(['error']);
    }
}
