<?php

namespace App\Http\Controllers;

use App\Exceptions\UnsupportedAgeException;
use App\Http\Requests\QuotationRequest;
use App\Services\QuotationCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuotationController extends Controller
{
    public function __invoke(QuotationRequest $request, QuotationCalculator $calculator): JsonResponse
    {
        $validated = $request->validated();
        $ages = $request->ages();

        try {
            $total = $calculator->total(
                $ages,
                $validated['start_date'],
                $validated['end_date'],
                $validated['currency_id'],
            );
        } catch (UnsupportedAgeException $exception) {
            throw ValidationException::withMessages([
                'age' => [
                    "All ages must be between 18 and 70. Unsupported: {$exception->age}.",
                ],
            ]);
        }

        return response()->json([
            'total' => $total,
            'currency_id' => $validated['currency_id'],
            'quotation_id' => (string) Str::uuid(),
        ]);
    }
}
