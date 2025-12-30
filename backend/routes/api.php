<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CanvasController;
use App\Http\Controllers\CanvasImageController;
use App\Http\Controllers\CounterController;
use App\Http\Controllers\FavoritesCarouselController;
use App\Http\Controllers\FavoritesImageController;
use App\Http\Controllers\HealthController;
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
Route::get('/health', [HealthController::class, 'check']);

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

// Counter Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/counter', [CounterController::class, 'show']);
    Route::put('/counter', [CounterController::class, 'update']);
});

// Canvas Routes (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('canvases', CanvasController::class);
    Route::apiResource('canvases.images', CanvasImageController::class)
        ->except(['index', 'store'])
        ->parameter('images', 'id');
    Route::get('/canvases/{canvasId}/images', [CanvasImageController::class, 'index']);
    Route::post('/canvases/{canvasId}/images', [CanvasImageController::class, 'store']);
});

// Favorites Routes (Protected)
Route::middleware('auth:sanctum')->prefix('favorites')->group(function () {
    // Carousel management
    Route::get('/carousels', [FavoritesCarouselController::class, 'index']);
    Route::post('/carousels', [FavoritesCarouselController::class, 'store']);
    Route::put('/carousels/reorder', [FavoritesCarouselController::class, 'reorder']); // Must be before {id} routes
    Route::get('/carousels/{id}', [FavoritesCarouselController::class, 'show']);
    Route::put('/carousels/{id}', [FavoritesCarouselController::class, 'update']);
    Route::delete('/carousels/{id}', [FavoritesCarouselController::class, 'destroy']);

    // Image management
    Route::get('/carousels/{carouselId}/images', [FavoritesImageController::class, 'index']);
    Route::post('/carousels/{carouselId}/images', [FavoritesImageController::class, 'store']);
    Route::delete('/images/{id}', [FavoritesImageController::class, 'destroy']);
    Route::put('/carousels/{carouselId}/images/reorder', [FavoritesImageController::class, 'reorder']);
});
