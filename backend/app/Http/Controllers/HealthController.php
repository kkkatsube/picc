<?php

namespace App\Http\Controllers;

use App\Services\HealthService;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __construct(
        private readonly HealthService $healthService
    ) {}

    /**
     * API Health Check endpoint
     */
    public function check(): JsonResponse
    {
        $healthData = $this->healthService->checkSystemHealth();

        $statusCode = $healthData['status'] === 'ok' ? 200 : 503;

        return response()->json($healthData, $statusCode);
    }
}
