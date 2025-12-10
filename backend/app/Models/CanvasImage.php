<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $canvas_id
 * @property string $uri
 * @property int|null $x
 * @property int|null $y
 * @property int|null $width
 * @property int|null $height
 * @property int|null $left
 * @property int|null $right
 * @property int|null $top
 * @property int|null $bottom
 * @property float|null $size
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 */
class CanvasImage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'canvas_id',
        'uri',
        'x',
        'y',
        'width',
        'height',
        'left',
        'right',
        'top',
        'bottom',
        'size',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'x' => 'integer',
            'y' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'left' => 'integer',
            'right' => 'integer',
            'top' => 'integer',
            'bottom' => 'integer',
            'size' => 'float',
        ];
    }

    /**
     * Get the canvas that owns the image.
     *
     * @return BelongsTo<Canvas, $this>
     */
    public function canvas(): BelongsTo
    {
        return $this->belongsTo(Canvas::class);
    }
}
