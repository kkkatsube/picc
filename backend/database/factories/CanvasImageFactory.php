<?php

namespace Database\Factories;

use App\Models\Canvas;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CanvasImage>
 */
class CanvasImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'canvas_id' => Canvas::factory(),
            'uri' => fake()->imageUrl(640, 480, 'canvas', true),
            'x' => fake()->numberBetween(0, 1000),
            'y' => fake()->numberBetween(0, 1000),
            'width' => fake()->numberBetween(100, 500),
            'height' => fake()->numberBetween(100, 500),
            'left' => fake()->optional()->numberBetween(0, 50),
            'right' => fake()->optional()->numberBetween(0, 50),
            'top' => fake()->optional()->numberBetween(0, 50),
            'bottom' => fake()->optional()->numberBetween(0, 50),
            'size' => fake()->optional()->randomFloat(2, 0.1, 2.0),
        ];
    }
}
