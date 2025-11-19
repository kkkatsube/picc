<?php

use App\Models\Counter;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

describe('Counter API', function () {
    describe('GET /counter', function () {
        test('can get counter value for authenticated user', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            // Create counter with value 10
            Counter::create([
                'user_id' => $user->id,
                'value' => 10,
            ]);

            $response = $this->getJson('/api/counter');

            $response
                ->assertStatus(200)
                ->assertJson([
                    'value' => 10,
                ]);
        });

        test('creates counter with default value 0 if not exists', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            $response = $this->getJson('/api/counter');

            $response
                ->assertStatus(200)
                ->assertJson([
                    'value' => 0,
                ]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user->id,
                'value' => 0,
            ]);
        });

        test('requires authentication to get counter', function () {
            $response = $this->getJson('/api/counter');

            $response->assertStatus(401);
        });

        test('returns only authenticated user counter', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            Counter::create(['user_id' => $user1->id, 'value' => 10]);
            Counter::create(['user_id' => $user2->id, 'value' => 20]);

            Sanctum::actingAs($user1);

            $response = $this->getJson('/api/counter');

            $response
                ->assertStatus(200)
                ->assertJson(['value' => 10]);
        });
    });

    describe('PUT /counter', function () {
        test('can update counter value for authenticated user', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            Counter::create([
                'user_id' => $user->id,
                'value' => 5,
            ]);

            $response = $this->putJson('/api/counter', [
                'value' => 10,
            ]);

            $response
                ->assertStatus(200)
                ->assertJson([
                    'value' => 10,
                ]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user->id,
                'value' => 10,
            ]);
        });

        test('creates counter if not exists when updating', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            $response = $this->putJson('/api/counter', [
                'value' => 15,
            ]);

            $response
                ->assertStatus(200)
                ->assertJson([
                    'value' => 15,
                ]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user->id,
                'value' => 15,
            ]);
        });

        test('can update counter to zero', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            Counter::create([
                'user_id' => $user->id,
                'value' => 10,
            ]);

            $response = $this->putJson('/api/counter', [
                'value' => 0,
            ]);

            $response
                ->assertStatus(200)
                ->assertJson([
                    'value' => 0,
                ]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user->id,
                'value' => 0,
            ]);
        });

        test('can update counter to negative value', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            Counter::create([
                'user_id' => $user->id,
                'value' => 5,
            ]);

            $response = $this->putJson('/api/counter', [
                'value' => -3,
            ]);

            $response
                ->assertStatus(200)
                ->assertJson([
                    'value' => -3,
                ]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user->id,
                'value' => -3,
            ]);
        });

        test('requires authentication to update counter', function () {
            $response = $this->putJson('/api/counter', [
                'value' => 10,
            ]);

            $response->assertStatus(401);
        });

        test('requires value field for update', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            $response = $this->putJson('/api/counter', []);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['value']);
        });

        test('requires integer value for update', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            $response = $this->putJson('/api/counter', [
                'value' => 'not a number',
            ]);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['value']);
        });

        test('rejects null value', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            $response = $this->putJson('/api/counter', [
                'value' => null,
            ]);

            $response
                ->assertStatus(422)
                ->assertJsonValidationErrors(['value']);
        });

        test('only updates authenticated user counter', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();

            Counter::create(['user_id' => $user1->id, 'value' => 10]);
            Counter::create(['user_id' => $user2->id, 'value' => 20]);

            Sanctum::actingAs($user1);

            $response = $this->putJson('/api/counter', [
                'value' => 50,
            ]);

            $response
                ->assertStatus(200)
                ->assertJson(['value' => 50]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user1->id,
                'value' => 50,
            ]);

            $this->assertDatabaseHas('counters', [
                'user_id' => $user2->id,
                'value' => 20, // Unchanged
            ]);
        });
    });

    describe('Counter persistence', function () {
        test('counter persists across sessions', function () {
            $user = User::factory()->create();
            Sanctum::actingAs($user);

            // First session: create and update
            $this->putJson('/api/counter', ['value' => 42]);

            // Simulate logout (clear token)
            $this->postJson('/api/auth/logout');

            // Simulate new session with new authentication
            Sanctum::actingAs($user);

            // Get counter in new session
            $response = $this->getJson('/api/counter');

            $response
                ->assertStatus(200)
                ->assertJson(['value' => 42]);
        });
    });

    describe('Counter isolation', function () {
        test('each user has independent counter', function () {
            $user1 = User::factory()->create();
            $user2 = User::factory()->create();
            $user3 = User::factory()->create();

            // User 1: set to 10
            Sanctum::actingAs($user1);
            $this->putJson('/api/counter', ['value' => 10]);

            // User 2: set to 20
            Sanctum::actingAs($user2);
            $this->putJson('/api/counter', ['value' => 20]);

            // User 3: set to 30
            Sanctum::actingAs($user3);
            $this->putJson('/api/counter', ['value' => 30]);

            // Verify each user has their own value
            Sanctum::actingAs($user1);
            expect($this->getJson('/api/counter')->json('value'))->toBe(10);

            Sanctum::actingAs($user2);
            expect($this->getJson('/api/counter')->json('value'))->toBe(20);

            Sanctum::actingAs($user3);
            expect($this->getJson('/api/counter')->json('value'))->toBe(30);
        });
    });
});
