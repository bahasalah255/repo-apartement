<?php

namespace Database\Seeders;

use App\Models\Apartment;
use App\Models\BlockedDate;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create specific users for testing/login
        $admin = User::firstOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);

        $owner = User::firstOrCreate([
            'email' => 'owner@example.com',
        ], [
            'name' => 'Owner User',
            'role' => 'owner',
            'password' => bcrypt('password'),
        ]);

        $client = User::firstOrCreate([
            'email' => 'client@example.com',
        ], [
            'name' => 'Client User',
            'role' => 'client',
            'password' => bcrypt('password'),
        ]);

        // 2. Use factories to generate additional dummy data
        
        // Generate additional dummy owners and clients
        User::factory(5)->create(['role' => 'owner']);
        User::factory(10)->create(['role' => 'client']);

        // Generate apartments for our specific owner
        $apartments = Apartment::factory(5)->create([
            'owner_id' => $owner->id
        ]);

        // Generate more random apartments
        Apartment::factory(10)->create();

        // Generate reservations for specific client on specific owner's apartments
        foreach ($apartments as $apartment) {
            Reservation::factory()->create([
                'apartment_id' => $apartment->id,
                'client_id' => $client->id,
            ]);
        }

        // Generate completely random reservations
        Reservation::factory(20)->create();

        // Generate completely random blocked dates
        BlockedDate::factory(15)->create();
    }
}
