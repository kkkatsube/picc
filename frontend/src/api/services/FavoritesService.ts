/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FavoritesCarousel } from '../models/FavoritesCarousel';
import type { FavoritesImage } from '../models/FavoritesImage';
import type { MessageResponse } from '../models/MessageResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FavoritesService {

    /**
     * Get All Favorites Carousels
     * ユーザーのお気に入りカルーセル一覧取得
     * @returns FavoritesCarousel Carousels retrieved successfully
     * @throws ApiError
     */
    public static getFavoritesCarousels(): CancelablePromise<Array<FavoritesCarousel>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/favorites/carousels',
            errors: {
                401: `Unauthorized`,
            },
        });
    }

    /**
     * Create Favorites Carousel
     * お気に入りカルーセル作成
     * @param requestBody
     * @returns FavoritesCarousel Carousel created successfully
     * @throws ApiError
     */
    public static createFavoritesCarousel(
        requestBody: {
            name: string;
        },
    ): CancelablePromise<FavoritesCarousel> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/favorites/carousels',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Favorites Carousel
     * お気に入りカルーセル詳細取得
     * @param id
     * @returns FavoritesCarousel Carousel retrieved successfully
     * @throws ApiError
     */
    public static getFavoritesCarousel(
        id: number,
    ): CancelablePromise<FavoritesCarousel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/favorites/carousels/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Carousel not found`,
            },
        });
    }

    /**
     * Update Favorites Carousel
     * お気に入りカルーセル更新
     * @param id
     * @param requestBody
     * @returns FavoritesCarousel Carousel updated successfully
     * @throws ApiError
     */
    public static updateFavoritesCarousel(
        id: number,
        requestBody: {
            name: string;
        },
    ): CancelablePromise<FavoritesCarousel> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/favorites/carousels/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Carousel not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Favorites Carousel
     * お気に入りカルーセル削除
     * @param id
     * @returns MessageResponse Carousel deleted successfully
     * @throws ApiError
     */
    public static deleteFavoritesCarousel(
        id: number,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/favorites/carousels/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Carousel not found`,
            },
        });
    }

    /**
     * Reorder Favorites Carousels
     * お気に入りカルーセルの並び替え
     * @param requestBody
     * @returns MessageResponse Carousels reordered successfully
     * @throws ApiError
     */
    public static reorderFavoritesCarousels(
        requestBody: {
            carousel_ids: Array<number>;
        },
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/favorites/carousels/reorder',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Carousel Images
     * カルーセル内の画像一覧取得
     * @param carouselId
     * @returns FavoritesImage Images retrieved successfully
     * @throws ApiError
     */
    public static getCarouselImages(
        carouselId: number,
    ): CancelablePromise<Array<FavoritesImage>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/favorites/carousels/{carouselId}/images',
            path: {
                'carouselId': carouselId,
            },
            errors: {
                401: `Unauthorized`,
                404: `Carousel not found`,
            },
        });
    }

    /**
     * Add Image to Carousel
     * カルーセルに画像追加
     * @param carouselId
     * @param requestBody
     * @returns FavoritesImage Image added successfully
     * @throws ApiError
     */
    public static addImageToCarousel(
        carouselId: number,
        requestBody: {
            image_url: string;
        },
    ): CancelablePromise<FavoritesImage> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/favorites/carousels/{carouselId}/images',
            path: {
                'carouselId': carouselId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Carousel not found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Favorites Image
     * お気に入り画像削除
     * @param id
     * @returns MessageResponse Image deleted successfully
     * @throws ApiError
     */
    public static deleteFavoritesImage(
        id: number,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/favorites/images/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Image not found`,
            },
        });
    }

    /**
     * Reorder Carousel Images
     * カルーセル内画像の並び替え
     * @param carouselId
     * @param requestBody
     * @returns MessageResponse Images reordered successfully
     * @throws ApiError
     */
    public static reorderCarouselImages(
        carouselId: number,
        requestBody: {
            image_ids: Array<number>;
        },
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/favorites/carousels/{carouselId}/images/reorder',
            path: {
                'carouselId': carouselId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Carousel not found`,
                422: `Validation Error`,
            },
        });
    }

}
