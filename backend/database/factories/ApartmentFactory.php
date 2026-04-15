<?php

namespace Database\Factories;

use App\Models\Apartment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;

class ApartmentFactory extends Factory
{
    protected $model = Apartment::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->sentence(3),
            'address' => $this->faker->address,
            'photos' => [Storage::url('apartments/xn005TzDF0IALwgWTS7kH5xGzLvLybnPo4dXR1IH.jpg')],
            'price_per_night' => $this->faker->numberBetween(50, 200),
            'description' => $this->faker->paragraph,
            'capacity' => $this->faker->numberBetween(1, 6),
            'is_active' => true,
        ];
    }
}