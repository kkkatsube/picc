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
            // Allow https:// and local development URLs (localhost and private IP addresses)
            'add_picture_url' => [
                'required',
                'url',
                function ($attribute, $value, $fail) {
                    // Allow HTTPS URLs or local development HTTP URLs (localhost, 127.x.x.x, 192.168.x.x, 10.x.x.x)
                    if (! preg_match('/^https:\/\//', $value) &&
                        ! preg_match('/^http:\/\/(localhost|127\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?/', $value)) {
                        $fail('The '.$attribute.' must be a secure HTTPS URL or local development HTTP URL.');
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
