<?php

use App\Http\Controllers\Api\Admin\SubmissionsController;
use Illuminate\Support\Facades\Route;

// CSV downloads are plain links (not fetch calls), so they run in the web group where the session cookie
// is always honoured, rather than relying on Sanctum's Origin/Referer detection.
Route::middleware(['auth', 'active'])->group(function () {
    foreach (['inquiries', 'applications'] as $type) {
        Route::get("/api/admin/{$type}/export.csv", [SubmissionsController::class, 'export'])->defaults('submissionType', $type);
    }
});

// The website and admin dashboard are a React single-page app (resources/js). Every other non-API path renders
// the same shell and React Router takes over; unknown paths show the app's own 404 page.
Route::view('/{path?}', 'app')->where('path', '^(?!api/|uploads/|sanctum/|up$).*$');
