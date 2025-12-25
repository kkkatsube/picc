<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCanvasImageRequest;
use App\Http\Requests\UpdateCanvasImageRequest;
use App\Http\Resources\CanvasImageResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CanvasImageController extends Controller
{
    /**
     * Display a listing of canvas images.
     */
    public function index(Request $request, string $canvasId): AnonymousResourceCollection
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($canvasId);
        $images = $canvas->images()->latest()->get();

        return CanvasImageResource::collection($images);
    }

    /**
     * Store a newly created canvas image.
     */
    public function store(StoreCanvasImageRequest $request, string $canvasId): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($canvasId);

        $validated = $request->validated();
        $imageUrl = $validated['add_picture_url'];

        // Get image size from URL or use provided dimensions
        try {
            // If width and height are provided, use them (for localhost images)
            if (isset($validated['width']) && isset($validated['height'])) {
                $width = $validated['width'];
                $height = $validated['height'];
            } else {
                // Try to get image size from URL
                $imageSize = @getimagesize($imageUrl);

                if ($imageSize === false) {
                    return response()->json([
                        'message' => 'Failed to fetch image from URL',
                        'errors' => ['add_picture_url' => ['Unable to retrieve image dimensions. Please provide width and height.']],
                    ], 422);
                }

                [$width, $height] = $imageSize;
            }

            // Create image record with provided or default values
            $image = $canvas->images()->create([
                'uri' => $imageUrl,
                'x' => $validated['x'] ?? 0,
                'y' => $validated['y'] ?? 0,
                'width' => $width,
                'height' => $height,
                'size' => $validated['size'] ?? 1.0,
                'left' => 0,
                'right' => 0,
                'top' => 0,
                'bottom' => 0,
            ]);

            return (new CanvasImageResource($image))
                ->response()
                ->setStatusCode(201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process image',
                'errors' => ['add_picture_url' => [$e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Display the specified canvas image.
     */
    public function show(Request $request, string $canvasId, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($canvasId);
        $image = $canvas->images()->findOrFail($id);

        return response()->json(new CanvasImageResource($image));
    }

    /**
     * Update the specified canvas image.
     */
    public function update(UpdateCanvasImageRequest $request, string $canvasId, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($canvasId);
        $image = $canvas->images()->findOrFail($id);
        $image->update($request->validated());

        return response()->json(new CanvasImageResource($image));
    }

    /**
     * Remove the specified canvas image.
     */
    public function destroy(Request $request, string $canvasId, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($canvasId);
        $image = $canvas->images()->findOrFail($id);
        $image->delete();

        return response()->json(['message' => 'Canvas image deleted successfully']);
    }
}
