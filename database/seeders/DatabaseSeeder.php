<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\Program;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Seeds the CMS with 3DP's existing website content and creates the first admin account.
 * Safe to re-run: records are only inserted when their slug/key does not exist yet, nothing is overwritten.
 * Usage: php artisan db:seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAdmin();

        $content = json_decode(file_get_contents(__DIR__.'/data/initial-content.json'), true, flags: JSON_THROW_ON_ERROR);

        $this->insertMissing(Service::class, $content['services'], ordered: true);
        $this->insertMissing(Program::class, $content['programs'], ordered: true);
        $this->insertMissing(Post::class, array_map(fn ($post, $i) => [
            ...$post,
            'author_name' => '3DP Team',
            'status' => 'published',
            'published_at' => now()->subDays(($i + 1) * 9),
        ], $content['posts'], array_keys($content['posts'])), ordered: false);

        $current = Setting::allValues();
        $defaults = [
            'hero_eyebrow' => 'Data Driven Decisions Partners · Kigali, Rwanda',
            'hero_title' => 'Turn the data you already have into decisions you can trust.',
            'hero_subtitle' => 'We help companies and individuals become data driven through training, data products, data-driven systems, and strategy.',
            'contact_email' => '3dp.rwanda@gmail.com',
            'address' => 'Kigali, Rwanda',
            'office_hours' => 'Monday to Friday, 8:00 to 17:00 (CAT)',
            'response_time' => 'We usually reply within two working days.',
        ];
        Setting::saveValues(array_filter($defaults, fn ($key) => empty($current[$key]), ARRAY_FILTER_USE_KEY));
        $this->command?->info('Settings: defaults applied where empty.');
    }

    private function seedAdmin(): void
    {
        if (User::query()->exists()) {
            $this->command?->info('Admin: users already exist, skipped.');

            return;
        }
        $email = Str::lower(config('cms.admin.email'));
        $password = config('cms.admin.password') ?: Str::password(16, symbols: false);

        User::query()->forceCreate([
            'name' => config('cms.admin.name'),
            'email' => $email,
            'password' => $password,
            'role' => 'admin',
            'is_active' => true,
        ]);
        $this->command?->info("Admin: created {$email}.");
        if (! config('cms.admin.password')) {
            $this->command?->warn("Admin: generated password (shown once, change it after signing in): {$password}");
        }
    }

    /** @param class-string<\Illuminate\Database\Eloquent\Model> $model */
    private function insertMissing(string $model, array $rows, bool $ordered): void
    {
        $added = 0;
        foreach (array_values($rows) as $i => $row) {
            if ($model::query()->where('slug', $row['slug'])->exists()) {
                continue;
            }
            $model::query()->forceCreate($ordered ? ['sort_order' => $i * 10, ...$row] : $row);
            $added++;
        }
        $this->command?->info(class_basename($model).": {$added} added.");
    }
}
