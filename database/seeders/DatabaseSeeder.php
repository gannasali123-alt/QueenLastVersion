<?php

namespace Database\Seeders;

use App\Models\Admin;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Application;
use App\Models\College;
use App\Models\Major;
use App\Models\PostLike;
use App\Models\Street;
use App\Models\Student;
use App\Models\University;
use App\Models\UniversityImage;
use App\Models\UniversityMajor;
use App\Models\UniversityPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin
        Admin::factory()->create([
            'name' => 'Jihad',
            'email' => 'Jihad@gmail.com',
            'password' => Hash::make('775585061'),
        ]);

        $streets = [
            'الستين', 'الخمسين', 'الزبيري', 'هائل', 'حدة', 'تعز', 'المطار',
            'عمران', 'القيادة', 'الجزائر', 'بغداد', 'صخر', '45', 'الثلاثين',
            'العدل', 'الرقاص', 'التحرير', 'جمال', 'القصر', 'التلفزيون',
            '14 أكتوبر', 'الوحدة', 'المدينة', 'عصر', 'السواد', 'دار سلم'
        ];

        Street::factory()
            ->count(count($streets)) 
            ->state(new Sequence(
                ...array_map(fn ($street) => ['name' => $street], $streets)
            ))
            ->create();









        // Users
        User::factory(10)->create();
        $users = User::all();

        // Colleges and Majors
        College::factory(5)
            ->create()
            ->each(function (College $college) {
                Major::factory(rand(3, 6))->create([
                    'college_id' => $college->id,
                ]);
            });

        // Universities
        $universities = University::factory(8)->create();

        // University images and posts
        $universities->each(function (University $u) {
            UniversityImage::factory(rand(1, 3))->create([
                'university_id' => $u->id,
            ]);

            UniversityPost::factory(rand(1, 3))->create([
                'university_id' => $u->id,
            ]);
        });

        // Link Universities with Majors
        $allMajors = Major::query()->inRandomOrder()->get();
        foreach ($universities as $u) {
            $picked = $allMajors->random(min($allMajors->count(), rand(3, 6)));
            foreach ($picked as $m) {
                UniversityMajor::factory()->create([
                    'university_id' => $u->id,
                    'major_id' => $m->id,
                ]);
            }
        }

        // Seed ratings for universities
        if ($users->isNotEmpty()) {
            foreach ($universities as $u) {
                $raters = $users->shuffle()->take(min($users->count(), rand(3, 8)));
                foreach ($raters as $rater) {
                    try {
                        $u->addStar(rand(3, 5), $rater, [
                            'source' => 'seeder',
                        ]);
                    } catch (\Throwable $e) {
                        // ignore duplicates or validation errors
                    }
                }
            }
        }

        // Students
        Student::factory(40)->create();

        // Applications: map students to random university majors and users
        $uniMajors = UniversityMajor::all();
        if ($users->isNotEmpty() && $uniMajors->isNotEmpty()) {
            Application::factory(50)->make()->each(function (Application $app) use ($users, $uniMajors) {
                $app->user_id = $users->random()->id;
                $app->university_major_id = $uniMajors->random()->id;
                $app->save();
            });
        }

        // Post likes
        $posts = UniversityPost::all();
        if ($users->isNotEmpty() && $posts->isNotEmpty()) {
            // attempt a variety of likes avoiding duplicates by try/catch on unique index
            PostLike::factory(100)->make()->each(function (PostLike $pl) use ($users, $posts) {
                $pl->user_id = $users->random()->id;
                $pl->university_posts_id = $posts->random()->id;
                try {
                    $pl->save();
                } catch (\Throwable $e) {
                    // ignore duplicates
                }
            });
        }
    }
}
