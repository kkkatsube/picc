<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add login route to prevent authentication redirect errors
Route::get('/login', function () {
    return response()->json([
        'message' => 'This is an API-only application. Please use /api/auth/login endpoint.',
    ], 401);
})->name('login');
