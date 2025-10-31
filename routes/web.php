<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\ResponseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::resource("posts", PostController::class);
Route::resource("response", ResponseController::class);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
