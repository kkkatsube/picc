<?php

namespace App\Http\Controllers;

use App\Models\FavoritesCarousel;
use App\Models\FavoritesImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoritesImageController extends Controller
{
    /**
     * Display images in the specified carousel.
     */
    public function index(Request $request, string $carouselId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // カルーセルの所有者確認
        $carousel = FavoritesCarousel::where('user_id', $user->id)
            ->where('id', $carouselId)
            ->firstOrFail();

        $images = $carousel->images()->orderBy('order')->get();

        return response()->json($images);
    }

    /**
     * Store a newly created image in the carousel.
     */
    public function store(Request $request, string $carouselId): JsonResponse
    {
        $validated = $request->validate([
            'image_url' => [
                'required',
                'string',
                'max:2048',
                function ($attribute, $value, $fail) {
                    // Allow URLs with multibyte characters (Japanese, etc.)
                    if (!filter_var($value, FILTER_VALIDATE_URL) && !preg_match('/^https?:\/\//', $value)) {
                        $fail('The ' . $attribute . ' must be a valid URL.');
                    }
                },
            ],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // カルーセルの所有者確認
        $carousel = FavoritesCarousel::where('user_id', $user->id)
            ->where('id', $carouselId)
            ->firstOrFail();

        // 最大orderを取得して+1
        $maxOrder = FavoritesImage::where('carousel_id', $carousel->id)->max('order') ?? -1;

        $image = FavoritesImage::create([
            'carousel_id' => $carousel->id,
            'image_url' => $validated['image_url'],
            'order' => $maxOrder + 1,
        ]);

        return response()->json($image, 201);
    }

    /**
     * Remove the specified image.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // 画像の所属カルーセルの所有者確認
        $image = FavoritesImage::whereHas('carousel', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($id);

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    /**
     * Reorder images in the specified carousel.
     */
    public function reorder(Request $request, string $carouselId): JsonResponse
    {
        $validated = $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'required|integer|exists:favorites_images,id',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // カルーセルの所有者確認
        $carousel = FavoritesCarousel::where('user_id', $user->id)
            ->where('id', $carouselId)
            ->firstOrFail();

        DB::transaction(function () use ($carousel, $validated) {
            // First, set all images to temporary negative order values to avoid unique constraint violations
            foreach ($validated['image_ids'] as $order => $imageId) {
                FavoritesImage::where('carousel_id', $carousel->id)
                    ->where('id', $imageId)
                    ->update(['order' => -($order + 1)]);
            }

            // Then, set them to their final positive order values
            foreach ($validated['image_ids'] as $order => $imageId) {
                FavoritesImage::where('carousel_id', $carousel->id)
                    ->where('id', $imageId)
                    ->update(['order' => $order]);
            }
        });

        return response()->json(['message' => 'Images reordered successfully']);
    }
}
