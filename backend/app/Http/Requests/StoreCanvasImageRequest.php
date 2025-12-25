<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCanvasImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Allow both https:// and http://localhost for local development
            'add_picture_url' => [
                'required',
                'url',
                function ($attribute, $value, $fail) {
                    if (!preg_match('/^https:\/\//', $value) && !preg_match('/^http:\/\/localhost/', $value)) {
                        $fail('The ' . $attribute . ' must be a secure HTTPS URL or localhost HTTP URL.');
                    }
                },
            ],
            'x' => 'sometimes|integer',
            'y' => 'sometimes|integer',
            'size' => 'sometimes|numeric|min:0.1|max:5.0',
            'width' => 'sometimes|integer|min:1',
            'height' => 'sometimes|integer|min:1',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
