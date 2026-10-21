<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// 3DP CMS content, submissions, media, settings and audit log.
// List-type fields (features, outcomes, tracks) are JSON stored in TEXT columns and cast to arrays by the models,
// which keeps the schema portable across MySQL 8+ and MariaDB 10.4+.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 140)->unique();
            $table->string('title', 160);
            $table->enum('pillar', ['train', 'build', 'advise']);
            $table->string('summary', 400);
            $table->text('body')->nullable();
            $table->text('features')->nullable();
            $table->text('outcomes')->nullable();
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['is_published', 'sort_order']);
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 140)->unique();
            $table->string('title', 160);
            $table->string('summary', 400);
            $table->text('body')->nullable();
            $table->text('tracks')->nullable();
            $table->string('audience')->nullable();
            $table->string('format', 160)->nullable();
            $table->string('duration', 120)->nullable();
            $table->string('schedule', 160)->nullable();
            $table->string('level', 80)->nullable();
            $table->string('fee', 120)->nullable();
            $table->date('next_intake')->nullable();
            $table->boolean('accepting_applications')->default(true);
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->index(['is_published', 'sort_order']);
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 160)->unique();
            $table->string('title', 200);
            $table->string('excerpt', 400);
            $table->mediumText('body');
            $table->string('category', 80)->nullable();
            $table->string('cover_image')->nullable();
            $table->string('author_name', 120)->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'published_at']);
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('role', 140);
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->text('quote');
            $table->string('author_name', 120);
            $table->string('author_title', 140)->nullable();
            $table->string('organization', 140)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });

        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 190);
            $table->string('phone', 40)->nullable();
            $table->string('organization', 160)->nullable();
            $table->string('interest', 80)->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied', 'archived'])->default('new');
            $table->text('notes')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->string('program_title', 160);
            $table->string('track', 120)->nullable();
            $table->string('full_name', 120);
            $table->string('email', 190);
            $table->string('phone', 40)->nullable();
            $table->string('occupation', 160)->nullable();
            $table->enum('experience_level', ['none', 'beginner', 'intermediate', 'advanced'])->default('none');
            $table->text('motivation')->nullable();
            $table->enum('status', ['new', 'reviewing', 'accepted', 'waitlisted', 'rejected'])->default('new');
            $table->text('notes')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename', 120)->unique();
            $table->string('original_name');
            $table->string('mime_type', 60);
            $table->unsignedInteger('size_bytes');
            $table->string('alt_text')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->string('setting_key', 80)->primary();
            $table->text('setting_value')->nullable();
            $table->timestamps();
        });

        Schema::create('activity_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 40);
            $table->string('entity', 40);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('summary')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        foreach (['activity_log', 'settings', 'media', 'applications', 'inquiries', 'testimonials', 'team_members', 'posts', 'programs', 'services'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
