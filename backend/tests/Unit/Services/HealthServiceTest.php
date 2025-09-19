<?php

use App\Services\HealthService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    // Clear any existing mocks
    \Mockery::close();
    $this->service = new HealthService;
});

afterEach(function () {
    \Mockery::close();
});

describe('HealthService', function () {
    describe('checkSystemHealth', function () {
        test('returns ok status when all services are healthy', function () {
            // Mock database connection
            DB::shouldReceive('connection')
                ->once()
                ->andReturnSelf();
            DB::shouldReceive('getPdo')
                ->once()
                ->andReturn(\Mockery::mock('PDO'));

            // Mock Redis connection
            Redis::shouldReceive('ping')
                ->once()
                ->andReturn('PONG');

            $result = $this->service->checkSystemHealth();

            expect($result)
                ->toHaveKey('status', 'ok')
                ->toHaveKey('message', 'All systems operational')
                ->toHaveKey('version', '1.0.0')
                ->toHaveKey('timestamp')
                ->toHaveKey('checks');

            expect($result['checks'])
                ->toHaveKey('api')
                ->toHaveKey('database')
                ->toHaveKey('redis');

            expect($result['checks']['api']['status'])->toBe('ok');
            expect($result['checks']['database']['status'])->toBe('ok');
            expect($result['checks']['redis']['status'])->toBe('ok');
        });

        test('returns error status when database fails', function () {
            // Mock database connection failure
            DB::shouldReceive('connection')
                ->once()
                ->andReturnSelf();
            DB::shouldReceive('getPdo')
                ->once()
                ->andThrow(new Exception('Database connection failed'));

            // Mock Redis success
            Redis::shouldReceive('ping')
                ->once()
                ->andReturn('PONG');

            $result = $this->service->checkSystemHealth();

            expect($result['status'])->toBe('error');
            expect($result['message'])->toBe('Some systems have issues');
            expect($result['checks']['database']['status'])->toBe('error');
            expect($result['checks']['database']['message'])->toBe('Database connection failed');
            expect($result['checks']['redis']['status'])->toBe('ok');
        });

        test('returns error status when redis fails', function () {
            // Mock database success
            DB::shouldReceive('connection')
                ->once()
                ->andReturnSelf();
            DB::shouldReceive('getPdo')
                ->once()
                ->andReturn(\Mockery::mock('PDO'));

            // Mock Redis connection failure
            Redis::shouldReceive('ping')
                ->once()
                ->andThrow(new Exception('Redis connection failed'));

            $result = $this->service->checkSystemHealth();

            expect($result['status'])->toBe('error');
            expect($result['message'])->toBe('Some systems have issues');
            expect($result['checks']['database']['status'])->toBe('ok');
            expect($result['checks']['redis']['status'])->toBe('error');
            expect($result['checks']['redis']['error'])->toBe('Redis connection failed');
        });

        test('returns error status when both services fail', function () {
            // Mock both services failure
            DB::shouldReceive('connection')
                ->once()
                ->andReturnSelf();
            DB::shouldReceive('getPdo')
                ->once()
                ->andThrow(new Exception('Database error'));

            Redis::shouldReceive('ping')
                ->once()
                ->andThrow(new Exception('Redis error'));

            $result = $this->service->checkSystemHealth();

            expect($result['status'])->toBe('error');
            expect($result['checks']['database']['status'])->toBe('error');
            expect($result['checks']['redis']['status'])->toBe('error');
        });

        test('includes timestamp and version', function () {
            // Mock services
            DB::shouldReceive('connection')
                ->once()
                ->andReturnSelf();
            DB::shouldReceive('getPdo')
                ->once()
                ->andReturn(\Mockery::mock('PDO'));

            Redis::shouldReceive('ping')
                ->once()
                ->andReturn('PONG');

            $result = $this->service->checkSystemHealth();

            expect($result['version'])->toBe('1.0.0');
            expect($result['timestamp'])->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/');
        });

        test('API check is always healthy', function () {
            // Even with other services failing, API should be healthy
            DB::shouldReceive('connection')
                ->once()
                ->andReturnSelf();
            DB::shouldReceive('getPdo')
                ->once()
                ->andThrow(new Exception('Database error'));

            Redis::shouldReceive('ping')
                ->once()
                ->andThrow(new Exception('Redis error'));

            $result = $this->service->checkSystemHealth();

            expect($result['checks']['api']['status'])->toBe('ok');
            expect($result['checks']['api']['message'])->toBe('API is healthy');
        });
    });
});
