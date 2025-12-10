<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCanvasRequest;
use App\Http\Requests\UpdateCanvasRequest;
use App\Http\Resources\CanvasResource;
use App\Models\Canvas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CanvasController extends Controller
{
    /**
     * Display a listing of the user's canvases.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvases = $user->canvases()->latest()->get();

        return CanvasResource::collection($canvases);
    }

    /**
     * Store a newly created canvas.
     */
    public function store(StoreCanvasRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->create($request->validated());

        return response()->json(new CanvasResource($canvas), 201);
    }

    /**
     * Display the specified canvas.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($id);

        return response()->json(new CanvasResource($canvas));
    }

    /**
     * Update the specified canvas.
     */
    public function update(UpdateCanvasRequest $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($id);
        $canvas->update($request->validated());

        return response()->json(new CanvasResource($canvas));
    }

    /**
     * Remove the specified canvas.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $canvas = $user->canvases()->findOrFail($id);
        $canvas->delete();

        return response()->json(['message' => 'Canvas deleted successfully']);
    }
}
