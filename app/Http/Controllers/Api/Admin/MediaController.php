<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Image library. Files live on the "uploads" disk (storage/app/uploads, served at /uploads).
 */
class MediaController extends Controller
{
    private const EXTENSIONS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];

    public function index(Request $request): JsonResponse
    {
        $query = Media::query()->with('uploader:id,name')->latest()->orderByDesc('id');

        return response()->json($this->paginated($query, $request, 48, 100, fn (Media $m) => [
            ...$m->only(['id', 'filename', 'original_name', 'mime_type', 'size_bytes', 'alt_text', 'created_at', 'url']),
            'uploaded_by' => $m->uploader?->name,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // "image" + "mimes" check the real file contents (via finfo), not just the extension. SVG is excluded.
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ], [
            'file.required' => 'Choose an image to upload.',
            'file.image' => 'Only JPG, PNG, WebP or GIF images can be uploaded.',
            'file.mimes' => 'Only JPG, PNG, WebP or GIF images can be uploaded.',
            'file.max' => 'Images must be 5 MB or smaller.',
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();
        abort_unless(isset(self::EXTENSIONS[$mime]), 422, 'Only JPG, PNG, WebP or GIF images can be uploaded.');

        // Random names: the original filename never touches the filesystem.
        $filename = now()->format('YmdHis').'-'.Str::lower(Str::random(16)).'.'.self::EXTENSIONS[$mime];
        Storage::disk('uploads')->putFileAs('', $file, $filename);

        $media = Media::query()->create([
            'filename' => $filename,
            'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
            'mime_type' => $mime,
            'size_bytes' => $file->getSize(),
            'alt_text' => $request->input('alt_text'),
            'uploaded_by' => $request->user()->id,
        ]);
        ActivityLog::record($request, 'uploaded', 'media', $media->id, $media->original_name);

        return response()->json(['data' => $media->only(['id', 'filename', 'url', 'alt_text'])], 201);
    }

    public function destroy(Request $request): Response
    {
        $id = (int) $request->route('id');
        $media = Media::query()->findOrFail($id);
        Storage::disk('uploads')->delete(basename($media->filename));
        $media->delete();
        ActivityLog::record($request, 'deleted', 'media', $id, $media->original_name);

        return response()->noContent();
    }
}
