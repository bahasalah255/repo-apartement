<?php

namespace Database\Seeders;

use App\Models\Apartment;
use App\Models\BlockedDate;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::updateOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'role' => 'admin',
        ]);

        // Create owner user
        $owner = User::updateOrCreate([
            'email' => 'owner@example.com',
        ], [
            'name' => 'Owner User',
            'role' => 'owner',
        ]);

        // Create client user
        $client = User::updateOrCreate([
            'email' => 'client@example.com',
        ], [
            'name' => 'Client User',
            'role' => 'client',
        ]);

        // Create apartments from the factory so photos are always valid arrays.
        $apartmentOne = Apartment::updateOrCreate([
            'name' => 'Appartement Centre-Ville',
        ], Apartment::factory()->raw([
            'owner_id' => $owner->id,
            'name' => 'Appartement Centre-Ville',
            'address' => '123 Rue de la Ville, Paris',
            'price_per_night' => 100,
            'description' => 'Magnifique appartement en plein centre-ville.',
            'capacity' => 4,
            'is_active' => true,
        ]));

        $apartmentTwo = Apartment::updateOrCreate([
            'name' => 'Studio Montmartre',
        ], Apartment::factory()->raw([
            'owner_id' => $owner->id,
            'name' => 'Studio Montmartre',
            'address' => '456 Rue Montmartre, Paris',
            'price_per_night' => 80,
            'description' => 'Charmant studio avec vue sur la ville.',
            'capacity' => 2,
            'is_active' => true,
        ]));

        // Create reservation
        Reservation::updateOrCreate([
            'apartment_id' => $apartmentOne->id,
            'client_id' => $client->id,
            'check_in' => now()->addDays(10)->toDateString(),
            'check_out' => now()->addDays(15)->toDateString(),
        ], [
            'check_in' => now()->addDays(10),
            'check_out' => now()->addDays(15),
            'status' => 'confirmed',
            'phone' => '0123456789',
            'total_price' => 500,
        ]);

        // Create blocked date
        BlockedDate::updateOrCreate([
            'apartment_id' => $apartmentOne->id,
            'start_date' => now()->addDays(20)->toDateString(),
            'end_date' => now()->addDays(22)->toDateString(),
        ], [
            'apartment_id' => $apartmentOne->id,
            'start_date' => now()->addDays(20),
            'end_date' => now()->addDays(22),
            'reason' => 'Maintenance',
        ]);
    }
}
