<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Application;
use App\Models\Inquiry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Inbox for public form submissions: contact enquiries and program applications.
 */
class SubmissionsController extends Controller
{
    private const TYPES = [
        'inquiries' => [
            'model' => Inquiry::class,
            'title' => 'name',
            'search' => ['name', 'email', 'organization', 'message'],
            'list' => ['id', 'name', 'email', 'organization', 'interest', 'status', 'created_at'],
            'csv' => ['id', 'created_at', 'status', 'name', 'email', 'phone', 'organization', 'interest', 'message'],
        ],
        'applications' => [
            'model' => Application::class,
            'title' => 'full_name',
            'search' => ['full_name', 'email', 'program_title', 'occupation'],
            'list' => ['id', 'program_id', 'program_title', 'track', 'full_name', 'email', 'phone', 'experience_level', 'status', 'created_at'],
            'csv' => ['id', 'created_at', 'status', 'program_title', 'track', 'full_name', 'email', 'phone', 'occupation', 'experience_level', 'motivation'],
        ],
    ];

    private function type(string $name): array
    {
        return self::TYPES[$name] ?? abort(404);
    }

    private function statuses(string $name): array
    {
        return $this->type($name)['model']::STATUSES;
    }

    private function filtered(Request $request, string $name): Builder
    {
        $type = $this->type($name);
        $query = $type['model']::query();
        if (in_array($request->query('status'), $this->statuses($name), true)) {
            $query->where('status', $request->query('status'));
        }
        if ($name === 'applications' && ctype_digit((string) $request->query('program_id'))) {
            $query->where('program_id', (int) $request->query('program_id'));
        }

        return $this->search($query, $request->query('q'), $type['search']);
    }

    public function index(Request $request): JsonResponse
    {
        $submissionType = $request->route('submissionType');
        $type = $this->type($submissionType);
        $query = $this->filtered($request, $submissionType)->select($type['list'])->latest()->orderByDesc('id');
        if ($submissionType === 'inquiries') {
            $query->selectRaw('SUBSTR(message, 1, 160) AS preview');
        }
        $payload = $this->paginated($query, $request, 25);
        $payload['statusCounts'] = $type['model']::query()
            ->selectRaw('status, COUNT(*) AS n')->groupBy('status')->pluck('n', 'status')
            ->map(fn ($n) => (int) $n);

        return response()->json($payload);
    }

    public function show(Request $request): JsonResponse
    {
        $submissionType = $request->route('submissionType');
        $id = (int) $request->route('id');
        $record = $this->type($submissionType)['model']::query()->findOrFail($id);
        // Opening a new enquiry marks it as read.
        if ($submissionType === 'inquiries' && $record->status === 'new') {
            $record->update(['status' => 'read']);
        }

        return response()->json(['data' => $record]);
    }

    public function update(Request $request): JsonResponse
    {
        $submissionType = $request->route('submissionType');
        $id = (int) $request->route('id');
        $type = $this->type($submissionType);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in($this->statuses($submissionType))],
            'notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);
        abort_if(empty($data), 422, 'Nothing to update.');

        $record = $type['model']::query()->findOrFail($id);
        $record->update($data);
        if (isset($data['status'])) {
            ActivityLog::record($request, "marked {$data['status']}", $submissionType, $record->id, $record->{$type['title']});
        }

        return response()->json(['data' => $record->fresh()]);
    }

    public function destroy(Request $request): Response
    {
        $submissionType = $request->route('submissionType');
        $id = (int) $request->route('id');
        $type = $this->type($submissionType);
        $record = $type['model']::query()->findOrFail($id);
        $record->delete();
        ActivityLog::record($request, 'deleted', $submissionType, $id, $record->{$type['title']});

        return response()->noContent();
    }

    /** CSV export of the current filter, for follow-up in a spreadsheet or CRM. */
    public function export(Request $request): StreamedResponse
    {
        $submissionType = $request->route('submissionType');
        $columns = $this->type($submissionType)['csv'];
        $rows = $this->filtered($request, $submissionType)->latest()->get($columns);
        ActivityLog::record($request, 'exported', $submissionType, null, $rows->count().' rows');

        $filename = "3dp-{$submissionType}-".now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($rows, $columns) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel detects the encoding
            fputcsv($out, $columns, escape: '');
            foreach ($rows as $row) {
                fputcsv($out, array_map(fn ($c) => self::csvSafe($row->{$c}), $columns), escape: '');
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=utf-8']);
    }

    /** Neutralises spreadsheet formula injection; phone numbers such as +250... are left intact. */
    private static function csvSafe(mixed $value): string
    {
        $s = $value instanceof \DateTimeInterface ? $value->format('c') : (string) ($value ?? '');

        return preg_match('/^[=@\t\r]|^[+-](?![\d\s(])/', $s) ? "'".$s : $s;
    }
}
