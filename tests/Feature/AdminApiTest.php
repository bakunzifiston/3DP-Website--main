<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Inquiry;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $editor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->admin = User::query()->where('role', 'admin')->firstOrFail();
        $this->editor = User::factory()->create();
    }

    private function serviceData(array $overrides = []): array
    {
        return [
            'title' => 'Data audits', 'slug' => 'data-audits', 'pillar' => 'advise', 'summary' => 'A short summary.',
            'body' => "## Heading\n\nText", 'features' => ['One', '', 'Two'], 'outcomes' => [], 'is_published' => true, 'sort_order' => 5,
            ...$overrides,
        ];
    }

    public function test_content_crud_and_activity_log(): void
    {
        $id = $this->actingAs($this->editor)->postJson('/api/admin/services', $this->serviceData())
            ->assertCreated()
            ->assertJsonPath('data.features', ['One', 'Two'])
            ->json('data.id');

        $this->actingAs($this->editor)->putJson("/api/admin/services/$id", $this->serviceData(['title' => 'Data audits & reviews', 'is_published' => false]))
            ->assertOk()->assertJsonPath('data.is_published', false);
        $this->actingAs($this->editor)->getJson("/api/admin/services/$id")->assertOk()->assertJsonPath('data.title', 'Data audits & reviews');
        $this->actingAs($this->editor)->getJson('/api/admin/services?q=audits')->assertOk()->assertJsonPath('total', 1);
        $this->actingAs($this->editor)->deleteJson("/api/admin/services/$id")->assertNoContent();
        $this->actingAs($this->editor)->getJson("/api/admin/services/$id")->assertNotFound()->assertJson(['error' => 'Not found']);

        $this->assertDatabaseHas('activity_log', ['entity' => 'services', 'action' => 'deleted', 'entity_id' => $id, 'user_id' => $this->editor->id]);
    }

    public function test_content_validation(): void
    {
        $this->actingAs($this->editor)->postJson('/api/admin/services', $this->serviceData(['slug' => 'data-products']))
            ->assertUnprocessable()->assertJsonPath('fields.slug', 'This URL slug is already in use.');
        $this->actingAs($this->editor)->postJson('/api/admin/services', $this->serviceData(['slug' => 'Bad Slug!']))
            ->assertUnprocessable()->assertJsonStructure(['fields' => ['slug']]);
        $this->actingAs($this->editor)->postJson('/api/admin/services', $this->serviceData(['image' => 'https://evil.example/x.png']))
            ->assertUnprocessable()->assertJsonStructure(['fields' => ['image']]);
        $this->actingAs($this->editor)->postJson('/api/admin/team', ['name' => 'A', 'role' => 'B', 'linkedin_url' => 'javascript:alert(1)'])
            ->assertUnprocessable()->assertJsonStructure(['fields' => ['linkedin_url']]);
    }

    public function test_publishing_a_post_without_date_stamps_it(): void
    {
        $this->actingAs($this->editor)->postJson('/api/admin/posts', [
            'title' => 'New article', 'slug' => 'new-article', 'excerpt' => 'Excerpt', 'body' => 'Body', 'status' => 'published',
        ])->assertCreated()->assertJsonPath('data.status', 'published');

        $this->getJson('/api/public/posts/new-article')->assertOk();
    }

    public function test_program_dates_round_trip_as_plain_dates(): void
    {
        $program = $this->actingAs($this->editor)->getJson('/api/admin/programs/1')->json('data');
        $program['next_intake'] = '2027-01-15';

        $this->actingAs($this->editor)->putJson('/api/admin/programs/1', $program)->assertOk()->assertJsonPath('data.next_intake', '2027-01-15');
        $again = $this->actingAs($this->editor)->getJson('/api/admin/programs/1')->json('data');
        $this->actingAs($this->editor)->putJson('/api/admin/programs/1', $again)->assertOk();
    }

    public function test_inquiry_workflow_and_csv_export(): void
    {
        $inquiry = Inquiry::query()->create(['name' => '=HYPERLINK("x")', 'email' => 'a@example.com', 'phone' => '+250788000000', 'message' => 'Hello']);

        $this->actingAs($this->editor)->getJson('/api/admin/inquiries?status=new')->assertOk()->assertJsonPath('statusCounts.new', 1);
        $this->actingAs($this->editor)->getJson("/api/admin/inquiries/{$inquiry->id}")->assertOk()->assertJsonPath('data.status', 'read');
        $this->actingAs($this->editor)->patchJson("/api/admin/inquiries/{$inquiry->id}", ['status' => 'replied', 'notes' => 'Called back'])
            ->assertOk()->assertJsonPath('data.status', 'replied');
        $this->actingAs($this->editor)->patchJson("/api/admin/inquiries/{$inquiry->id}", ['status' => 'bogus'])->assertUnprocessable();

        $csv = $this->actingAs($this->editor)->get('/api/admin/inquiries/export.csv')->assertOk()->streamedContent();
        $this->assertStringContainsString("'=HYPERLINK", $csv);
        $this->assertStringContainsString(',+250788000000,', $csv);
    }

    public function test_csv_export_requires_sign_in(): void
    {
        $this->get('/api/admin/applications/export.csv')->assertUnauthorized();
    }

    public function test_dashboard_stats(): void
    {
        Application::query()->create(['program_title' => 'Data Talents Program', 'full_name' => 'X', 'email' => 'x@example.com']);

        $this->actingAs($this->editor)->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('data.counts.new_applications', 1)
            ->assertJsonPath('data.counts.published_services', 8)
            ->assertJsonPath('data.applicationsByProgram.0.total', 1)
            ->assertJsonCount(1, 'data.weekly');
    }

    public function test_editors_cannot_manage_users_or_settings(): void
    {
        $this->actingAs($this->editor)->getJson('/api/admin/users')->assertForbidden();
        $this->actingAs($this->editor)->getJson('/api/admin/settings')->assertOk();
        $this->actingAs($this->editor)->putJson('/api/admin/settings', ['contact_phone' => '+250'])->assertForbidden();
        $this->actingAs($this->admin)->putJson('/api/admin/settings', ['contact_phone' => '+250 788 123 456'])
            ->assertOk()->assertJsonPath('data.contact_phone', '+250 788 123 456');
    }

    public function test_user_management_guards(): void
    {
        $this->actingAs($this->admin)->postJson('/api/admin/users', ['name' => 'New', 'email' => 'new@example.com', 'role' => 'editor', 'password' => 'weak'])
            ->assertUnprocessable();
        $this->actingAs($this->admin)->postJson('/api/admin/users', ['name' => 'New', 'email' => 'new@example.com', 'role' => 'editor', 'password' => 'GoodPassword123'])
            ->assertCreated();
        $this->actingAs($this->admin)->putJson("/api/admin/users/{$this->admin->id}", ['name' => 'Me', 'email' => $this->admin->email, 'role' => 'editor', 'is_active' => true])
            ->assertUnprocessable();
        $this->actingAs($this->admin)->deleteJson("/api/admin/users/{$this->admin->id}")->assertUnprocessable();
        $this->actingAs($this->admin)->deleteJson("/api/admin/users/{$this->editor->id}")->assertNoContent();
    }

    public function test_media_upload_accepts_images_only(): void
    {
        Storage::fake('uploads');

        // A real file on disk, so the server inspects its actual contents rather than trusting the extension.
        $path = tempnam(sys_get_temp_dir(), 'upl');
        file_put_contents($path, '<?php echo 1;');
        $this->actingAs($this->editor)->postJson('/api/admin/media', ['file' => new UploadedFile($path, 'shell.png', 'image/png', null, true)])
            ->assertUnprocessable();
        @unlink($path);
        $this->actingAs($this->editor)->postJson('/api/admin/media', ['file' => UploadedFile::fake()->create('logo.svg', 2, 'image/svg+xml')])
            ->assertUnprocessable();

        $media = $this->actingAs($this->editor)->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('photo.jpg', 40, 40), 'alt_text' => 'A photo'])
            ->assertCreated()->json('data');
        $this->assertMatchesRegularExpression('#^/uploads/[a-z0-9-]+\.jpg$#', $media['url']);
        Storage::disk('uploads')->assertExists($media['filename']);

        $this->actingAs($this->editor)->deleteJson("/api/admin/media/{$media['id']}")->assertNoContent();
        Storage::disk('uploads')->assertMissing($media['filename']);
    }

    public function test_deactivated_user_session_is_rejected(): void
    {
        $this->editor->update(['is_active' => false]);

        $this->actingAs($this->editor)->getJson('/api/admin/stats')->assertUnauthorized();
    }

    public function test_unknown_service_id_and_non_numeric_ids(): void
    {
        $this->actingAs($this->editor)->getJson('/api/admin/services/999')->assertNotFound();
        $this->actingAs($this->editor)->getJson('/api/admin/services/abc')->assertNotFound();
        $this->assertSame(8, Service::query()->count());
    }
}
