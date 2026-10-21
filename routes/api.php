<?php

use App\Cms\ContentTypes;
use App\Http\Controllers\Api\Admin\ActivityController;
use App\Http\Controllers\Api\Admin\ContentController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\SubmissionsController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

/*
| All routes here are prefixed with /api and use the "api" middleware group. Requests from the site's own
| frontend are "stateful" (Sanctum): they carry the session cookie and must include the CSRF token.
*/

Route::get('/health', fn () => ['ok' => true]);

// ---------- Public website ----------
Route::prefix('public')->group(function () {
    Route::get('/settings', [PublicController::class, 'settings']);
    Route::get('/services', [PublicController::class, 'services']);
    Route::get('/services/{slug}', [PublicController::class, 'service']);
    Route::get('/programs', [PublicController::class, 'programs']);
    Route::get('/programs/{slug}', [PublicController::class, 'program']);
    Route::get('/posts', [PublicController::class, 'posts']);
    Route::get('/posts/{slug}', [PublicController::class, 'post']);
    Route::get('/team', [PublicController::class, 'team']);
    Route::get('/testimonials', [PublicController::class, 'testimonials']);

    Route::middleware('throttle:forms')->group(function () {
        Route::post('/inquiries', [SubmissionController::class, 'inquiry']);
        Route::post('/applications', [SubmissionController::class, 'application']);
    });
});

// ---------- Authentication ----------
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/password', [AuthController::class, 'password']);
    });
});

// ---------- Admin dashboard ----------
Route::prefix('admin')->middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);

    foreach (array_keys(ContentTypes::all()) as $type) {
        Route::prefix($type)->group(function () use ($type) {
            Route::get('/', [ContentController::class, 'index'])->defaults('contentType', $type);
            Route::post('/', [ContentController::class, 'store'])->defaults('contentType', $type);
            Route::get('/{id}', [ContentController::class, 'show'])->defaults('contentType', $type)->whereNumber('id');
            Route::put('/{id}', [ContentController::class, 'update'])->defaults('contentType', $type)->whereNumber('id');
            Route::delete('/{id}', [ContentController::class, 'destroy'])->defaults('contentType', $type)->whereNumber('id');
        });
    }

    foreach (['inquiries', 'applications'] as $type) {
        Route::prefix($type)->group(function () use ($type) {
            Route::get('/', [SubmissionsController::class, 'index'])->defaults('submissionType', $type);
            Route::get('/{id}', [SubmissionsController::class, 'show'])->defaults('submissionType', $type)->whereNumber('id');
            Route::patch('/{id}', [SubmissionsController::class, 'update'])->defaults('submissionType', $type)->whereNumber('id');
            Route::delete('/{id}', [SubmissionsController::class, 'destroy'])->defaults('submissionType', $type)->whereNumber('id');
        });
    }

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update'])->middleware('role:admin');

    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy'])->whereNumber('id');

    Route::middleware('role:admin')->prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::put('/{id}', [UserController::class, 'update'])->whereNumber('id');
        Route::delete('/{id}', [UserController::class, 'destroy'])->whereNumber('id');
    });

    Route::get('/activity', [ActivityController::class, 'index']);
});

Route::fallback(fn () => response()->json(['error' => 'Not found'], 404));
