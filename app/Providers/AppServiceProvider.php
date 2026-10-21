<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(300)->by($request->user()?->id ?: $request->ip()));

        RateLimiter::for('login', fn (Request $request) => Limit::perMinutes(15, 20)->by($request->ip())
            ->response(fn () => response()->json(['error' => 'Too many sign-in attempts. Please wait a few minutes and try again.'], 429)));

        RateLimiter::for('forms', fn (Request $request) => Limit::perHour(10)->by($request->ip())
            ->response(fn () => response()->json(['error' => 'You have sent several submissions recently. Please try again later.'], 429)));
    }
}
