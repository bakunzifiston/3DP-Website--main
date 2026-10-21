<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Site-wide settings shown on the public website and editable from the admin dashboard.
 */
class Setting extends Model
{
    public const KEYS = [
        'hero_eyebrow', 'hero_title', 'hero_subtitle',
        'contact_email', 'contact_phone', 'address', 'office_hours', 'response_time',
        'linkedin_url', 'x_url', 'instagram_url', 'facebook_url', 'youtube_url',
    ];

    protected $primaryKey = 'setting_key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['setting_key', 'setting_value'];

    public static function allValues(): array
    {
        $stored = static::query()->whereIn('setting_key', self::KEYS)->pluck('setting_value', 'setting_key');

        return collect(self::KEYS)->mapWithKeys(fn ($key) => [$key => $stored[$key] ?? null])->all();
    }

    public static function saveValues(array $values): void
    {
        foreach (array_intersect_key($values, array_flip(self::KEYS)) as $key => $value) {
            static::query()->updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
        }
    }
}
