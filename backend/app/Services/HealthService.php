<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthService
{
    /**
     * Perform comprehensive system health check
     */
    public function checkSystemHealth(): array
    {
        $overallStatus = 'ok';
        $checks = [];

        // Basic API Status
        $checks['api'] = [
            'status' => 'ok',
            'message' => 'API is healthy',
        ];

        // Database Connection Check
        $checks['database'] = $this->checkDatabaseConnection();
        if ($checks['database']['status'] === 'error') {
            $overallStatus = 'error';
        }

        // Redis Connection Check
        $checks['redis'] = $this->checkRedisConnection();
        if ($checks['redis']['status'] === 'error') {
            $overallStatus = 'error';
        }

        return [
            'status' => $overallStatus,
            'message' => $overallStatus === 'ok'
                ? 'All systems operational'
                : 'Some systems have issues',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0',
            'checks' => $checks,
        ];
    }

    /**
     * Check database connectivity and performance
     */
    private function checkDatabaseConnection(): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $connectionTime = round((microtime(true) - $start) * 1000, 2);

            $driver = 'unknown';
            try {
                $driver = config('database.default', 'unknown');
            } catch (Exception $e) {
                // Config not available in test environment
            }

            return [
                'status' => 'ok',
                'message' => 'Database connection successful',
                'connection_time_ms' => $connectionTime,
                'driver' => $driver,
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check Redis connectivity and performance
     */
    private function checkRedisConnection(): array
    {
        try {
            $start = microtime(true);
            Redis::ping();
            $connectionTime = round((microtime(true) - $start) * 1000, 2);

            return [
                'status' => 'ok',
                'message' => 'Redis connection successful',
                'connection_time_ms' => $connectionTime,
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Redis connection failed',
                'error' => $e->getMessage(),
            ];
        }
    }
}
