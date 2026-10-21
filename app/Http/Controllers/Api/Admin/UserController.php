<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

/**
 * Admin and editor accounts. Routes are restricted to the admin role.
 */
class UserController extends Controller
{
    private const COLUMNS = ['id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'locked_until', 'created_at'];

    public function index(): JsonResponse
    {
        return response()->json(['data' => User::query()->orderBy('name')->get(self::COLUMNS)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, null);
        abort_if(empty($data['password']), 422, 'Set an initial password.');
        $user = User::query()->create($data);
        ActivityLog::record($request, 'created', 'users', $user->id, $user->email);

        return response()->json(['data' => $user->only(self::COLUMNS)], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $id = (int) $request->route('id');
        $user = User::query()->findOrFail($id);
        $data = $this->validated($request, $user->id);

        abort_if(
            $user->id === $request->user()->id && ($data['role'] !== 'admin' || ! $data['is_active']),
            422,
            'You cannot remove your own admin access or deactivate yourself.'
        );
        if ($data['role'] !== 'admin' || ! $data['is_active']) {
            $this->assertNotLastAdmin($user->id);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $user->forceFill(['failed_logins' => 0, 'locked_until' => null]);
        }
        $user->fill($data)->save();

        if (isset($data['password']) || ! $data['is_active']) {
            AuthController::destroySessions($user->id);
        }
        ActivityLog::record($request, 'updated', 'users', $user->id, $user->email);

        return response()->json(['data' => $user->fresh()->only(self::COLUMNS)]);
    }

    public function destroy(Request $request): Response
    {
        $id = (int) $request->route('id');
        abort_if($id === $request->user()->id, 422, 'You cannot delete your own account.');
        $user = User::query()->findOrFail($id);
        if ($user->isAdmin()) {
            $this->assertNotLastAdmin($user->id);
        }
        $user->delete();
        AuthController::destroySessions($id);
        ActivityLog::record($request, 'deleted', 'users', $id, $user->email);

        return response()->noContent();
    }

    private function validated(Request $request, ?int $ignoreId): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($ignoreId)],
            'role' => ['required', Rule::in(['admin', 'editor'])],
            'is_active' => ['boolean'],
            'password' => ['nullable', 'string', AuthController::passwordRule()],
        ], ['email.unique' => 'An account with this email already exists.']);
        $data['email'] = mb_strtolower($data['email']);
        $data['is_active'] = (bool) ($data['is_active'] ?? true);

        return $data;
    }

    private function assertNotLastAdmin(int $exceptId): void
    {
        $others = User::query()->where('role', 'admin')->where('is_active', true)->where('id', '!=', $exceptId)->count();
        abort_if($others === 0, 422, 'At least one active admin account is required.');
    }
}
