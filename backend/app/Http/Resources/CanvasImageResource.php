<?php

namespace App\Http\Resources;

use App\Models\CanvasImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CanvasImage
 */
class CanvasImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'canvas_id' => $this->canvas_id,
            'uri' => $this->uri,
            'x' => $this->x,
            'y' => $this->y,
            'width' => $this->width,
            'height' => $this->height,
            'left' => $this->left,
            'right' => $this->right,
            'top' => $this->top,
            'bottom' => $this->bottom,
            'size' => $this->size,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
