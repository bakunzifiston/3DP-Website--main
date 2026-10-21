<?php

namespace App\Http\Controllers\Api\Admin;

use App\Cms\ContentTypes;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

/**
 * Generic CRUD for every CMS content type defined in App\Cms\ContentTypes.
 * The content type comes from the route definition (routes/api.php), never from user input.
 */
class ContentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $contentType = $request->route('contentType');
        $type = ContentTypes::get($contentType);
        $query = $type['model']::query();
        $this->search($query, $request->query('q'), $type['search']);
        foreach ($type['filters'] as $field => $allowed) {
            if (in_array($request->query($field), $allowed, true)) {
                $query->where($field, $request->query($field));
            }
        }
        foreach ($type['order'] as [$column, $direction]) {
            $query->orderBy($column, $direction);
        }

        return response()->json($this->paginated($query, $request, 50));
    }

    public function show(Request $request): JsonResponse
    {
        $contentType = $request->route('contentType');
        $id = (int) $request->route('id');
        return response()->json(['data' => $this->find($contentType, $id)]);
    }

    public function store(Request $request): JsonResponse
    {
        $contentType = $request->route('contentType');
        $type = ContentTypes::get($contentType);
        $model = new $type['model'];
        $this->fillAndSave($request, $type, $model);
        ActivityLog::record($request, 'created', $contentType, $model->id, $model->{$type['title']});

        return response()->json(['data' => $model->fresh()], 201);
    }

    public function update(Request $request): JsonResponse
    {
        $contentType = $request->route('contentType');
        $id = (int) $request->route('id');
        $type = ContentTypes::get($contentType);
        $model = $this->find($contentType, $id);
        $this->fillAndSave($request, $type, $model);
        ActivityLog::record($request, 'updated', $contentType, $model->id, $model->{$type['title']});

        return response()->json(['data' => $model->fresh()]);
    }

    public function destroy(Request $request): Response
    {
        $contentType = $request->route('contentType');
        $id = (int) $request->route('id');
        $type = ContentTypes::get($contentType);
        $model = $this->find($contentType, $id);
        $model->delete();
        ActivityLog::record($request, 'deleted', $contentType, $id, $model->{$type['title']});

        return response()->noContent();
    }

    private function find(string $contentType, int $id): Model
    {
        return ContentTypes::get($contentType)['model']::query()->findOrFail($id);
    }

    private function fillAndSave(Request $request, array $type, Model $model): void
    {
        if ($request->has('slug')) {
            $request->merge(['slug' => Str::lower(trim((string) $request->input('slug')))]);
        }
        $rules = $type['rules']($model->exists ? $model->id : null);
        $data = [...$type['defaults'], ...$request->validate($rules, ContentTypes::messages())];

        // Every column in the rules is written, so omitted optional fields are cleared rather than left stale.
        $columns = array_filter(array_keys($rules), fn ($key) => ! str_contains($key, '.'));
        $data = array_merge(array_fill_keys($columns, null), $data);
        foreach ($type['lists'] as $list) {
            $data[$list] = array_values(array_filter($data[$list] ?? [], fn ($item) => filled($item)));
        }
        foreach ($type['defaults'] as $key => $default) {
            $data[$key] ??= $default;
        }
        if (isset($type['before_save'])) {
            $data = $type['before_save']($data);
        }

        $model->fill($data)->save();
    }
}
