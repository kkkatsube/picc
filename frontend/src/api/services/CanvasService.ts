/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CanvasListResponse } from '../models/CanvasListResponse';
import type { CanvasResponse } from '../models/CanvasResponse';
import type { CreateCanvasRequest } from '../models/CreateCanvasRequest';
import type { MessageResponse } from '../models/MessageResponse';
import type { UpdateCanvasRequest } from '../models/UpdateCanvasRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CanvasService {

    /**
     * List User Canvases
     * ユーザーのキャンバス一覧取得
     * @returns CanvasListResponse List of user canvases
     * @throws ApiError
     */
    public static listCanvases(): CancelablePromise<CanvasListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/canvases',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Create Canvas
     * 新規キャンバス作成
     * @param requestBody
     * @returns CanvasResponse Canvas created successfully
     * @throws ApiError
     */
    public static createCanvas(
        requestBody: CreateCanvasRequest,
    ): CancelablePromise<CanvasResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/canvases',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Canvas
     * キャンバス詳細取得
     * @param id
     * @returns CanvasResponse Canvas details
     * @throws ApiError
     */
    public static getCanvas(
        id: number,
    ): CancelablePromise<CanvasResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/canvases/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Canvas not found`,
            },
        });
    }

    /**
     * Update Canvas
     * キャンバス更新
     * @param id
     * @param requestBody
     * @returns CanvasResponse Canvas updated successfully
     * @throws ApiError
     */
    public static updateCanvas(
        id: number,
        requestBody: UpdateCanvasRequest,
    ): CancelablePromise<CanvasResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/canvases/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Canvas not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Canvas
     * キャンバス削除
     * @param id
     * @returns MessageResponse Canvas deleted successfully
     * @throws ApiError
     */
    public static deleteCanvas(
        id: number,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/canvases/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Canvas not found`,
            },
        });
    }

}
