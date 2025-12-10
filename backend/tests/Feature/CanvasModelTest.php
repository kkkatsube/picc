<?php

use App\Models\Canvas;
use App\Models\CanvasImage;
use App\Models\User;

describe('Canvas Model', function () {
    describe('relationships', function () {
        test('belongs to user', function () {
            $user = User::factory()->create();
            $canvas = Canvas::factory()->create(['user_id' => $user->id]);

            $canvasUser = $canvas->user;
            expect($canvasUser)->not->toBeNull();
            expect($canvasUser)->toBeInstanceOf(User::class);
            assert($canvasUser instanceof User);
            expect($canvasUser->id)->toBe($user->id);
        });

        test('has many images', function () {
            $canvas = Canvas::factory()->create();
            $images = CanvasImage::factory()->count(3)->create(['canvas_id' => $canvas->id]);

            expect($canvas->images)->toHaveCount(3);
            expect($canvas->images->first())->toBeInstanceOf(CanvasImage::class);
        });

        test('user has many canvases', function () {
            $user = User::factory()->create();
            Canvas::factory()->count(5)->create(['user_id' => $user->id]);

            expect($user->canvases)->toHaveCount(5);
            expect($user->canvases->first())->toBeInstanceOf(Canvas::class);
        });
    });

    describe('cascade deletion', function () {
        test('deleting user cascades to canvases', function () {
            $user = User::factory()->create();
            $canvas = Canvas::factory()->create(['user_id' => $user->id]);
            $canvasId = $canvas->id;

            $user->delete();

            expect(Canvas::find($canvasId))->toBeNull();
        });

        test('deleting canvas cascades to images', function () {
            $canvas = Canvas::factory()->create();
            $image = CanvasImage::factory()->create(['canvas_id' => $canvas->id]);
            $imageId = $image->id;

            $canvas->delete();

            expect(CanvasImage::find($imageId))->toBeNull();
        });
    });

    describe('attributes', function () {
        test('casts width and height to integers', function () {
            $canvas = Canvas::factory()->create([
                'width' => '1920',
                'height' => '1080',
            ]);

            expect($canvas->width)->toBeInt();
            expect($canvas->height)->toBeInt();
            expect($canvas->width)->toBe(1920);
            expect($canvas->height)->toBe(1080);
        });

        test('allows nullable name and memo', function () {
            $canvas = Canvas::factory()->create([
                'name' => null,
                'memo' => null,
            ]);

            expect($canvas->name)->toBeNull();
            expect($canvas->memo)->toBeNull();
        });
    });
});

describe('CanvasImage Model', function () {
    describe('relationships', function () {
        test('belongs to canvas', function () {
            $canvas = Canvas::factory()->create();
            $image = CanvasImage::factory()->create(['canvas_id' => $canvas->id]);

            $imageCanvas = $image->canvas;
            expect($imageCanvas)->not->toBeNull();
            expect($imageCanvas)->toBeInstanceOf(Canvas::class);
            assert($imageCanvas instanceof Canvas);
            expect($imageCanvas->id)->toBe($canvas->id);
        });
    });

    describe('attributes', function () {
        test('casts numeric attributes correctly', function () {
            $image = CanvasImage::factory()->create([
                'x' => '100',
                'y' => '200',
                'width' => '300',
                'height' => '400',
                'left' => '10',
                'right' => '20',
                'top' => '30',
                'bottom' => '40',
                'size' => '1.5',
            ]);

            expect($image->x)->toBeInt();
            expect($image->y)->toBeInt();
            expect($image->width)->toBeInt();
            expect($image->height)->toBeInt();
            expect($image->left)->toBeInt();
            expect($image->right)->toBeInt();
            expect($image->top)->toBeInt();
            expect($image->bottom)->toBeInt();
            expect($image->size)->toBeFloat();
        });

        test('allows nullable position and cropping properties', function () {
            $image = CanvasImage::factory()->create([
                'x' => null,
                'y' => null,
                'width' => null,
                'height' => null,
                'left' => null,
                'right' => null,
                'top' => null,
                'bottom' => null,
                'size' => null,
            ]);

            expect($image->x)->toBeNull();
            expect($image->y)->toBeNull();
            expect($image->width)->toBeNull();
            expect($image->height)->toBeNull();
            expect($image->left)->toBeNull();
            expect($image->right)->toBeNull();
            expect($image->top)->toBeNull();
            expect($image->bottom)->toBeNull();
            expect($image->size)->toBeNull();
        });

        test('requires uri field', function () {
            expect(function () {
                CanvasImage::factory()->create(['uri' => null]);
            })->toThrow(Exception::class);
        });
    });
});
