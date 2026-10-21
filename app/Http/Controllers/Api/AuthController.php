<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Session-based authentication for the admin dashboard (Sanctum stateful SPA: session cookie + CSRF token).
 */
class AuthController extends Controller
{
    public const MAX_FAILED_ATTEMPTS = 5;

    public const LOCK_MINUTES = 15;

    // A real bcrypt hash of a throwaway string, checked when the email is unknown (constant-time behaviour).
    private const DUMMY_HASH = '$2y$12$FpDZ8D2bObGPKXR6yhaI9uMaiTctM.6eQ8nS8XKq213H7WnAOlfUG';

    public static function passwordRule(): Password
    {
        return Password::min(10)->max(128)->letters()->numbers();
    }

    public function login(Request $request): JsonResponse
    {
        // Sign-in is cookie/session based, so it only works from the site's own pages (see SANCTUM_STATEFUL_DOMAINS).
        abort_unless($request->hasSession(), 400, 'Sign in from the website at '.config('app.url').'/admin.');
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            'password' => ['required', 'string', 'max:128'],
        ]);

        $user = User::query()->where('email', mb_strtolower($credentials['email']))->first();

        if ($user?->isLocked()) {
            abort(423, 'This account is temporarily locked after repeated failed sign-ins. Try again later.');
        }

        // Hash::check runs even for unknown emails so response time does not reveal which accounts exist.
        $valid = Hash::check($credentials['password'], $user?->password ?? self::DUMMY_HASH);

        if (! $user || ! $valid || ! $user->is_active) {
            if ($user) {
                $failed = $user->failed_logins + 1;
                $lock = $failed >= self::MAX_FAILED_ATTEMPTS;
                $user->forceFill([
                    'failed_logins' => $lock ? 0 : $failed,
                    'locked_until' => $lock ? now()->addMinutes(self::LOCK_MINUTES) : null,
                ])->save();
            }
            abort(401, 'Incorrect email or password.');
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $user->forceFill(['failed_logins' => 0, 'locked_until' => null, 'last_login_at' => now()])->save();
        ActivityLog::record($request, 'signed in', 'auth', $user->id);

        return response()->json(['data' => $user->toAuthArray()]);
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->toAuthArray()]);
    }

    public function password(Request $request): Response
    {
        $data = $request->validate([
            'current_password' => ['required', 'string', 'max:128', 'current_password:web'],
            'new_password' => ['required', 'string', self::passwordRule()],
        ], ['current_password.current_password' => 'Current password is incorrect.']);

        $user = $request->user();
        $user->forceFill(['password' => $data['new_password']])->save();

        // Sign out every other device that was using the old password.
        self::destroySessions($user->id, $request->hasSession() ? $request->session()->getId() : null);
        ActivityLog::record($request, 'changed password', 'auth', $user->id);

        return response()->noContent();
    }

    /** Deletes a user's database sessions, optionally keeping the current one. */
    public static function destroySessions(int $userId, ?string $exceptSessionId = null): void
    {
        if (config('session.driver') !== 'database') {
            return;
        }
        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $userId)
            ->when($exceptSessionId, fn ($q) => $q->where('id', '!=', $exceptSessionId))
            ->delete();
    }
}
