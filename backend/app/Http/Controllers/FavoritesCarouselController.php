<?php

namespace App\Http\Controllers;

use App\Models\FavoritesCarousel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoritesCarouselController extends Controller
{
    /**
     * Display a listing of the user's favorites carousels.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $carousels = FavoritesCarousel::where('user_id', $user->id)
            ->orderBy('order')
            ->with('images')
            ->get();

        return response()->json($carousels);
    }

    /**
     * Store a newly created carousel.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // 最大orderを取得して+1
        $maxOrder = FavoritesCarousel::where('user_id', $user->id)->max('order') ?? -1;

        $carousel = FavoritesCarousel::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'order' => $maxOrder + 1,
        ]);

        return response()->json($carousel, 201);
    }

    /**
     * Display the specified carousel with its images.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $carousel = FavoritesCarousel::where('user_id', $user->id)
            ->where('id', $id)
            ->with('images')
            ->firstOrFail();

        return response()->json($carousel);
    }

    /**
     * Update the specified carousel.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        $carousel = FavoritesCarousel::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $carousel->update($validated);

        return response()->json($carousel);
    }

    /**
     * Remove the specified carousel.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $carousel = FavoritesCarousel::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $carousel->delete();

        return response()->json(['message' => 'Carousel deleted successfully']);
    }

    /**
     * Reorder carousels for the user.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'carousel_ids' => 'required|array|min:1',
            'carousel_ids.*' => 'required|integer',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Verify all carousel IDs belong to the user
        $userCarouselIds = FavoritesCarousel::where('user_id', $user->id)
            ->pluck('id')
            ->toArray();

        $invalidIds = array_diff($validated['carousel_ids'], $userCarouselIds);
        if (! empty($invalidIds)) {
            return response()->json([
                'message' => 'Invalid carousel IDs provided',
                'invalid_ids' => $invalidIds,
            ], 422);
        }

        DB::transaction(function () use ($user, $validated) {
            // First, set all orders to temporary high values to avoid unique constraint violations
            $tempOffset = 10000;
            foreach ($validated['carousel_ids'] as $tempOrder => $carouselId) {
                FavoritesCarousel::where('user_id', $user->id)
                    ->where('id', $carouselId)
                    ->update(['order' => $tempOffset + $tempOrder]);
            }

            // Then, set the final order values
            foreach ($validated['carousel_ids'] as $order => $carouselId) {
                FavoritesCarousel::where('user_id', $user->id)
                    ->where('id', $carouselId)
                    ->update(['order' => $order]);
            }
        });

        return response()->json(['message' => 'Carousels reordered successfully']);
    }
}
