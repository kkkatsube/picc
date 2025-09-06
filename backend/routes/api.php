<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health Check Endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is healthy',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});

// User authentication route (for future use)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});