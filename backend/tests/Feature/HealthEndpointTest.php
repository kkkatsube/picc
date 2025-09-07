<?php

use App\Services\HealthService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

describe('Health Endpoint', function () {
    test('returns 200 status when all services are healthy', function () {
        // Mock healthy services
        DB::shouldReceive('connection->getPdo')
            ->once()
            ->andReturn(Mockery::mock('PDO'));

        Redis::shouldReceive('ping')
            ->once()
            ->andReturn('PONG');

        $response = $this->getJson('/api/health');

        $response
            ->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'timestamp',
                'version',
                'checks' => [
                    'api' => ['status', 'message'],
                    'database' => ['status', 'message', 'connection_time_ms', 'driver'],
                    'redis' => ['status', 'message', 'connection_time_ms']
                ]
            ])
            ->assertJson([
                'status' => 'ok',
                'message' => 'All systems operational',
                'version' => '1.0.0',
                'checks' => [
                    'api' => [
                        'status' => 'ok',
                        'message' => 'API is healthy'
                    ],
                    'database' => [
                        'status' => 'ok',
                        'message' => 'Database connection successful'
                    ],
                    'redis' => [
                        'status' => 'ok',
                        'message' => 'Redis connection successful'
                    ]
                ]
            ]);

        // Verify response contains expected fields
        $data = $response->json();
        expect($data['timestamp'])->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/');
        expect($data['checks']['database']['connection_time_ms'])->toBeFloat()->toBeGreaterThan(0);
        expect($data['checks']['redis']['connection_time_ms'])->toBeFloat()->toBeGreaterThan(0);
    });

    test('returns 503 status when database fails', function () {
        // Mock database failure
        DB::shouldReceive('connection->getPdo')
            ->once()
            ->andThrow(new Exception('Database connection failed'));

        // Mock Redis success
        Redis::shouldReceive('ping')
            ->once()
            ->andReturn('PONG');

        $response = $this->getJson('/api/health');

        $response
            ->assertStatus(503)
            ->assertJson([
                'status' => 'error',
                'message' => 'Some systems have issues',
                'checks' => [
                    'database' => [
                        'status' => 'error',
                        'message' => 'Database connection failed'
                    ],
                    'redis' => [
                        'status' => 'ok'
                    ]
                ]
            ]);
    });

    test('returns 503 status when redis fails', function () {
        // Mock database success
        DB::shouldReceive('connection->getPdo')
            ->once()
            ->andReturn(Mockery::mock('PDO'));

        // Mock Redis failure
        Redis::shouldReceive('ping')
            ->once()
            ->andThrow(new Exception('Redis server not available'));

        $response = $this->getJson('/api/health');

        $response
            ->assertStatus(503)
            ->assertJson([
                'status' => 'error',
                'message' => 'Some systems have issues',
                'checks' => [
                    'database' => [
                        'status' => 'ok'
                    ],
                    'redis' => [
                        'status' => 'error',
                        'message' => 'Redis connection failed',
                        'error' => 'Redis server not available'
                    ]
                ]
            ]);
    });

    test('returns proper content type headers', function () {
        // Mock healthy services
        DB::shouldReceive('connection->getPdo')
            ->once()
            ->andReturn(Mockery::mock('PDO'));

        Redis::shouldReceive('ping')
            ->once()
            ->andReturn('PONG');

        $response = $this->getJson('/api/health');

        $response
            ->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    });

    test('includes performance metrics', function () {
        // Mock services with timing
        DB::shouldReceive('connection->getPdo')
            ->once()
            ->andReturn(Mockery::mock('PDO'));

        Redis::shouldReceive('ping')
            ->once()
            ->andReturn('PONG');

        $response = $this->getJson('/api/health');

        $data = $response->json();

        expect($data['checks']['database'])->toHaveKey('connection_time_ms');
        expect($data['checks']['redis'])->toHaveKey('connection_time_ms');
        expect($data['checks']['database']['connection_time_ms'])->toBeFloat();
        expect($data['checks']['redis']['connection_time_ms'])->toBeFloat();
    });

    test('matches OpenAPI specification structure', function () {
        // Mock healthy services
        DB::shouldReceive('connection->getPdo')
            ->once()
            ->andReturn(Mockery::mock('PDO'));

        Redis::shouldReceive('ping')
            ->once()
            ->andReturn('PONG');

        $response = $this->getJson('/api/health');

        $data = $response->json();

        // Verify it matches our TypeScript interfaces
        expect($data['status'])->toBeIn(['ok', 'error']);
        expect($data['checks']['api']['status'])->toBeIn(['ok', 'error']);
        expect($data['checks']['database']['status'])->toBeIn(['ok', 'error']);
        expect($data['checks']['redis']['status'])->toBeIn(['ok', 'error']);
    });
});