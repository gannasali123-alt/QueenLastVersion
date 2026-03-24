<?php

namespace Database\Factories;

use App\Models\Street;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\University>
 */
class UniversityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $image = self::randomProcessedImage();
        $background = self::randomProcessedImage();

        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => bcrypt('password'), // Default password
            // 'address' => $this->faker->address(),
            'address' => Street::inRandomOrder()->first()->id,
            'phone' => $this->faker->phoneNumber(),
            'description' => $this->faker->paragraph(),
            'status' => 'pending',
            'type' => $this->faker->randomElement(['public', 'private']),
            'location' => $this->faker->address(),
            'has_email_authentication' => false,
            'image_path' => $image,
            'image_background' => $background,
        ];
    }

    protected static function randomProcessedImage(): ?string
    {
        static $images = null;
        if ($images === null) {
            $all = Storage::disk('public')->files('universities');
            $images = array_values(array_filter($all, function ($p) {
                $ext = strtolower(pathinfo($p, PATHINFO_EXTENSION));
                return in_array($ext, ['webp']);
            }));
        }

        return !empty($images) ? Arr::random($images) : null;
    }
}
