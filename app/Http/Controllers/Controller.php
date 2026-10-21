<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

abstract class Controller
{
    /**
     * Paginates a query into the API's list shape: { data, total, page, pageSize }.
     */
    protected function paginated(Builder $query, Request $request, int $defaultSize = 20, int $maxSize = 100, ?callable $map = null): array
    {
        $page = max(1, (int) $request->query('page', 1));
        $pageSize = min($maxSize, max(1, (int) $request->query('pageSize', $defaultSize)));
        $total = (clone $query)->count();
        $items = $query->forPage($page, $pageSize)->get();

        return [
            'data' => $map ? $items->map($map)->values() : $items,
            'total' => $total,
            'page' => $page,
            'pageSize' => $pageSize,
        ];
    }

    /** Applies a LIKE search across columns; the term is length-limited and wildcards are escaped. */
    protected function search(Builder $query, ?string $term, array $columns): Builder
    {
        $term = mb_substr(trim((string) $term), 0, 100);
        if ($term === '') {
            return $query;
        }
        $like = '%'.addcslashes($term, '%_\\').'%';

        return $query->where(function (Builder $q) use ($columns, $like) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', $like);
            }
        });
    }
}
