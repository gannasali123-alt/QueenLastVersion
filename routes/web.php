<?php

use App\Http\Controllers\CollegeController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Rate\UniversityRatingController;
use App\Http\Controllers\UniversityController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;



Route::get('/', HomeController::class)->name('home');



// Route::get('/', function () {
//     return Inertia::render('welcome', [
//         'canRegister' => Features::enabled(Features::registration()),
//     ]);
// })->name('home');
Route::get('/universities/{university}', [UniversityController::class , 'show']);




Route::get('/', function () {
    return Inertia::render('Home', [
    'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');



// Use controller for listing universities
Route::get('/universities', [UniversityController::class , 'index'])->name('universities');
Route::get('/colleges', [CollegeController::class , 'index'])->name('colleges');



Route::get('/guidance', function () {
    return Inertia::render('Guidance', [
    'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('guidance');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        }
        )->name('dashboard');

        Route::post('/universities/{university}/rate', [UniversityRatingController::class , 'store']);    });

// (duplicate removed) controller index is defined above

require __DIR__ . '/settings.php';

// Allow GET requests to Boost browser logs endpoint to avoid MethodNotAllowed
// The vendor package registers POST at the same path; this GET handler prevents accidental GET errors.
// Route::get('/_boost/browser-logs', function () {
//     return response()->json(['status' => 'ok']);
// });
