/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CanvasImageListResponse } from '../models/CanvasImageListResponse';
import type { CanvasImageResponse } from '../models/CanvasImageResponse';
import type { CreateCanvasImageRequest } from '../models/CreateCanvasImageRequest';
import type { MessageResponse } from '../models/MessageResponse';
import type { UpdateCanvasImageRequest } from '../models/UpdateCanvasImageRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CanvasImageService {

    /**
     * List Canvas Images
     * キャンバスの画像一覧取得
     * @param canvasId
     * @returns CanvasImageListResponse List of canvas images
     * @throws ApiError
     */
    public static listCanvasImages(
        canvasId: number,
    ): CancelablePromise<CanvasImageListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/canvases/{canvasId}/images',
            path: {
                'canvasId': canvasId,
            },
            errors: {
                401: `Unauthorized`,
                404: `Canvas not found`,
            },
        });
    }

    /**
     * Create Canvas Image
     * キャンバスに画像を追加
     * @param canvasId
     * @param requestBody
     * @returns CanvasImageResponse Canvas image created successfully
     * @throws ApiError
     */
    public static createCanvasImage(
        canvasId: number,
        requestBody: CreateCanvasImageRequest,
    ): CancelablePromise<CanvasImageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/canvases/{canvasId}/images',
            path: {
                'canvasId': canvasId,
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
     * Get Canvas Image
     * キャンバス画像詳細取得
     * @param canvasId
     * @param id
     * @returns CanvasImageResponse Canvas image details
     * @throws ApiError
     */
    public static getCanvasImage(
        canvasId: number,
        id: number,
    ): CancelablePromise<CanvasImageResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/canvases/{canvasId}/images/{id}',
            path: {
                'canvasId': canvasId,
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Canvas image not found`,
            },
        });
    }

    /**
     * Update Canvas Image
     * キャンバス画像更新
     * @param canvasId
     * @param id
     * @param requestBody
     * @returns CanvasImageResponse Canvas image updated successfully
     * @throws ApiError
     */
    public static updateCanvasImage(
        canvasId: number,
        id: number,
        requestBody: UpdateCanvasImageRequest,
    ): CancelablePromise<CanvasImageResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/canvases/{canvasId}/images/{id}',
            path: {
                'canvasId': canvasId,
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Canvas image not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Canvas Image
     * キャンバス画像削除
     * @param canvasId
     * @param id
     * @returns MessageResponse Canvas image deleted successfully
     * @throws ApiError
     */
    public static deleteCanvasImage(
        canvasId: number,
        id: number,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/canvases/{canvasId}/images/{id}',
            path: {
                'canvasId': canvasId,
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Canvas image not found`,
            },
        });
    }

}
