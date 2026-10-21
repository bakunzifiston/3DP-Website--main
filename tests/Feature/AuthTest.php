<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // Sanctum treats requests from the site's own origin as stateful (session-based).
    private function fromSite(): static
    {
        return $this->withHeader('Referer', config('app.url').'/admin/login');
    }

    public function test_admin_api_requires_authentication(): void
    {
        $this->getJson('/api/admin/stats')->assertUnauthorized()->assertJson(['error' => 'Please sign in to continue.']);
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_user_can_sign_in_and_out(): void
    {
        $user = User::factory()->admin()->create(['email' => 'admin@example.com']);

        $this->fromSite()->postJson('/api/auth/login', ['email' => 'ADMIN@example.com', 'password' => 'password-123'])
            ->assertOk()
            ->assertJsonPath('data.email', 'admin@example.com');
        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->last_login_at);

        $this->fromSite()->getJson('/api/auth/me')->assertOk()->assertJsonPath('data.role', 'admin');
        $this->fromSite()->postJson('/api/auth/logout')->assertNoContent();
        $this->assertGuest('web');
    }

    public function test_wrong_password_is_rejected_without_revealing_accounts(): void
    {
        User::factory()->create(['email' => 'editor@example.com']);

        $known = $this->fromSite()->postJson('/api/auth/login', ['email' => 'editor@example.com', 'password' => 'wrong'])->assertUnauthorized();
        $unknown = $this->fromSite()->postJson('/api/auth/login', ['email' => 'nobody@example.com', 'password' => 'wrong'])->assertUnauthorized();
        $this->assertSame($known->json('error'), $unknown->json('error'));
    }

    public function test_account_locks_after_repeated_failures(): void
    {
        User::factory()->create(['email' => 'editor@example.com']);
        for ($i = 0; $i < 5; $i++) {
            $this->fromSite()->postJson('/api/auth/login', ['email' => 'editor@example.com', 'password' => 'wrong'])->assertUnauthorized();
        }

        // Even the correct password is refused while locked.
        $this->fromSite()->postJson('/api/auth/login', ['email' => 'editor@example.com', 'password' => 'password-123'])->assertStatus(423);
    }

    public function test_inactive_accounts_cannot_sign_in(): void
    {
        User::factory()->create(['email' => 'old@example.com', 'is_active' => false]);

        $this->fromSite()->postJson('/api/auth/login', ['email' => 'old@example.com', 'password' => 'password-123'])->assertUnauthorized();
    }

    public function test_password_change_requires_current_password_and_strength(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/auth/password', ['current_password' => 'wrong', 'new_password' => 'NewPassword2026'])
            ->assertUnprocessable()->assertJsonStructure(['fields' => ['current_password']]);
        $this->actingAs($user)->putJson('/api/auth/password', ['current_password' => 'password-123', 'new_password' => 'short'])
            ->assertUnprocessable()->assertJsonStructure(['fields' => ['new_password']]);
        $this->actingAs($user)->putJson('/api/auth/password', ['current_password' => 'password-123', 'new_password' => 'NewPassword2026'])
            ->assertNoContent();
    }
}
