<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('canvas_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('canvas_id')
                ->constrained('canvases')
                ->onDelete('cascade');
            $table->string('uri', 2048);
            $table->integer('x')->nullable();
            $table->integer('y')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('left')->nullable();
            $table->integer('right')->nullable();
            $table->integer('top')->nullable();
            $table->integer('bottom')->nullable();
            $table->float('size')->nullable();
            $table->timestamps();

            $table->index('canvas_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('canvas_images');
    }
};
