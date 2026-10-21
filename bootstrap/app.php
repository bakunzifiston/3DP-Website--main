<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Requests from the site's own frontend get session + CSRF protection on /api routes (Sanctum SPA mode).
        $middleware->statefulApi();
        $middleware->throttleApi();
        $middleware->append(SecurityHeaders::class);
        $middleware->redirectGuestsTo('/admin/login');
        $middleware->alias([
            'role' => EnsureRole::class,
            'active' => EnsureUserIsActive::class,
        ]);
        // Behind a reverse proxy / load balancer set TRUSTED_PROXIES (e.g. "*" or the proxy IP).
        if ($proxies = env('TRUSTED_PROXIES')) {
            $middleware->trustProxies(at: $proxies === '*' ? '*' : explode(',', $proxies));
        }
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API errors always use one JSON shape: { error: string, fields?: { field: message } }.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return match (true) {
                $e instanceof ValidationException => response()->json([
                    'error' => 'Please check the highlighted fields.',
                    'fields' => collect($e->errors())->map(fn ($messages) => $messages[0]),
                ], 422),
                $e instanceof AuthenticationException => response()->json(['error' => 'Please sign in to continue.'], 401),
                $e instanceof TokenMismatchException => response()->json(['error' => 'Your session expired. Please refresh the page and try again.'], 419),
                $e instanceof ModelNotFoundException, $e->getPrevious() instanceof ModelNotFoundException => response()->json(['error' => 'Not found'], 404),
                $e instanceof HttpExceptionInterface => response()->json([
                    'error' => $e->getMessage() ?: match ($e->getStatusCode()) {
                        403 => 'You do not have permission to do that.',
                        404 => 'Not found',
                        429 => 'Too many requests. Please slow down.',
                        default => 'Request failed.',
                    },
                ], $e->getStatusCode(), $e->getHeaders()),
                default => null, // fall through to Laravel's handler (reported, generic 500 JSON outside debug mode)
            };
        });
    })->create();
