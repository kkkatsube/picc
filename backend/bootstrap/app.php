<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Handle authentication exceptions for API routes
        $exceptions->render(function (Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        // Handle route not found exceptions (especially for login route)
        $exceptions->render(function (Illuminate\Routing\Exceptions\RouteNotFoundException $e, $request) {
            if ($request->is('api/*') && str_contains($e->getMessage(), 'login')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        // Handle validation exceptions
        $exceptions->render(function (Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Handle access denied exceptions
        $exceptions->render(function (Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Forbidden.',
                ], 403);
            }
        });

        // Handle general exceptions for API routes
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                // For API routes, always return JSON
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                // Don't expose internal errors in production
                $message = $e->getMessage() ?: 'Server Error';

                return response()->json([
                    'message' => $message,
                    'error' => class_basename($e),
                ], $status);
            }
        });
    })->create();
