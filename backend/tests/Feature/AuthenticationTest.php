<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

describe('Authentication API', function () {
    describe('POST /auth/register', function () {
        test('can register a new user', function () {
            $userData = [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ];

            $response = $this->postJson('/api/auth/register', $userData);

            $response
                ->assertStatus(201)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],
                ])
                ->assertJson([
                    'token_type' => 'Bearer',
                    'user' => [
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                    ],
                ]);

            $this->assertDatabaseHas('users', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]);
        });

        test('requires valid data for registration', function () {
            $response = $this->postJson('/api/auth/register', []);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password']);
        });

        test('requires unique email for registration', function () {
            User::factory()->create(['email' => 'john@example.com']);

            $userData = [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ];

            $response = $this->postJson('/api/auth/register', $userData);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });

        test('requires password confirmation', function () {
            $userData = [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'password_confirmation' => 'differentpassword',
            ];

            $response = $this->postJson('/api/auth/register', $userData);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
        });
    });

    describe('POST /auth/login', function () {
        test('can login with valid credentials', function () {
            $user = User::factory()->create([
                'email' => 'john@example.com',
                'password' => bcrypt('password123'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => 'john@example.com',
                'password' => 'password123',
            ]);

            $response
                ->assertStatus(200)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],
                ])
                ->assertJson([
                    'token_type' => 'Bearer',
                    'user' => [
                        'id' => $user->id,
                        'email' => 'john@example.com',
                    ],
                ]);
        });

        test('cannot login with invalid credentials', function () {
            User::factory()->create([
                'email' => 'john@example.com',
                'password' => bcrypt('password123'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => 'john@example.com',
                'password' => 'wrongpassword',
            ]);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });

        test('requires email and password for login', function () {
            $response = $this->postJson('/api/auth/login', []);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
        });
    });

    describe('POST /auth/logout', function () {
        test('can logout authenticated user', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            $response = $this->postJson('/api/auth/logout');

            $response
                ->assertStatus(200)
                ->assertJson([
                    'message' => 'Successfully logged out',
                ]);
        });

        test('requires authentication for logout', function () {
            $response = $this->postJson('/api/auth/logout');

            $response->assertStatus(401);
        });
    });

    describe('GET /auth/user', function () {
        test('can get authenticated user data', function () {
            $user = User::factory()->create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]);

            Sanctum::actingAs($user);

            $response = $this->getJson('/api/auth/user');

            $response
                ->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],
                ])
                ->assertJson([
                    'data' => [
                        'id' => $user->id,
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                    ],
                ]);
        });

        test('requires authentication to get user data', function () {
            $response = $this->getJson('/api/auth/user');

            $response->assertStatus(401);
        });
    });
});
