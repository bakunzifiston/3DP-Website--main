<?php

return [
    // First admin account, created by `php artisan db:seed` only when no users exist yet.
    // Leave ADMIN_PASSWORD empty to have a random password generated and printed once.
    'admin' => [
        'name' => env('ADMIN_NAME', '3DP Administrator'),
        'email' => env('ADMIN_EMAIL', 'admin@3dp.rw'),
        'password' => env('ADMIN_PASSWORD'),
    ],
];
