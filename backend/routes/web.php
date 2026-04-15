<?php

use App\Http\Controllers\ApartmentController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
})->name('home');

// Page d'accueil (React SPA)
Route::get('/{any}', function () {
    return view('home');
})->where('any', '.*');

// Routes d'authentification (React gère l'affichage)
Route::middleware('guest')->group(function () {
    Route::get('/login', function () { return view('home'); })->name('login');
    Route::get('/register', function () { return view('home'); })->name('register');
});
Route::post('/logout', function() {
    Auth::logout();
    return response()->json(['message' => 'Logged out']);
})->name('logout');

// Routes protégées
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Appartements
    Route::resource('apartments', ApartmentController::class);
    Route::post('/apartments/{apartment}/block-date', [ApartmentController::class, 'blockDate'])->name('apartments.block-date');
    
    // Réservations
    Route::resource('reservations', ReservationController::class);
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('reservations.status');
    Route::delete('/reservations/{reservation}/cancel', [ReservationController::class, 'destroy'])->name('reservations.cancel');
    
    // Admin
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [AdminController::class, 'index'])->name('index');
        Route::get('/apartments', [AdminController::class, 'apartments'])->name('apartments');
        Route::get('/reservations', [AdminController::class, 'reservations'])->name('reservations');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::put('/users/{user}/role', [AdminController::class, 'updateRole'])->name('users.role');
    });
});