<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/** Signs out accounts that were deactivated while they still had a session. */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->is_active) {
            Auth::guard('web')->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
            }
            abort(401, 'Please sign in to continue.');
        }

        return $next($request);
    }
}
