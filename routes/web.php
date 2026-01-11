<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PostLike\PostLikeController;
use App\Http\Controllers\Rate\UniversityRatingController;

// use App\Http\Controllers\HomeController;

// Route::get('/', HomeController::class)->name('home');



Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

        Route::post('/universities/{university}/rate', [UniversityRatingController::class, 'store']);
    Route::post('/universityposts/{universitypost}/taggle-like', [PostLikeController::class, 'taggle']);
});

require __DIR__.'/settings.php';
