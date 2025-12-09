/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateCounterRequest } from '../models/UpdateCounterRequest';
import type { UserCounterResponse } from '../models/UserCounterResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CounterService {

    /**
     * Get User Counter
     * ユーザーカウンター値取得
     * @returns UserCounterResponse Current user counter
     * @throws ApiError
     */
    public static getUserCounterValue(): CancelablePromise<UserCounterResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/counter',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Put User Counter
     * ユーザーカウンター値更新
     * @param requestBody
     * @returns UserCounterResponse Updated counter
     * @throws ApiError
     */
    public static updateUserCounterValue(
        requestBody: UpdateCounterRequest,
    ): CancelablePromise<UserCounterResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/counter',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

}
