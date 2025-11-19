<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCounterRequest;
use App\Http\Resources\CounterResource;
use App\Models\Counter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CounterController extends Controller
{
    /**
     * Get the authenticated user's counter value.
     */
    public function show(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Get or create counter with default value 0
        $counter = Counter::firstOrCreate(
            ['user_id' => $user->id],
            ['value' => 0]
        );

        return response()->json(new CounterResource($counter));
    }

    /**
     * Update the authenticated user's counter value.
     */
    public function update(UpdateCounterRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Update or create counter with the provided value
        $counter = Counter::updateOrCreate(
            ['user_id' => $user->id],
            ['value' => $request->validated()['value']]
        );

        return response()->json(new CounterResource($counter));
    }
}