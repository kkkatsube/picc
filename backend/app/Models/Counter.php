<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Counter extends Model
{
    use HasFactory;
    
      /**
       * The attributes that are mass assignable.
       *
       * @var array<int, string>
       */
      protected $fillable = [
          'user_id',
          'value',
      ];

      /**
       * The attributes that should be cast.
       *
       * @return array<string, string>
       */
      protected function casts(): array
      {
          return [
              'value' => 'integer',
          ];
      }

      /**
       * Get the user that owns the counter.
       */
      public function user(): BelongsTo
      {
          return $this->belongsTo(User::class);
      }

}
