/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateCanvasImageRequest = {
    /**
     * HTTPS URL of the image to add (server will fetch dimensions automatically)
     */
    add_picture_url: string;
    /**
     * X position on canvas (optional)
     */
    'x'?: number | null;
    /**
     * Y position on canvas (optional)
     */
    'y'?: number | null;
    /**
     * Size multiplier (optional, 0.1-5.0)
     */
    size?: number | null;
    /**
     * Original image width in pixels (optional, to skip getimagesize())
     */
    width?: number | null;
    /**
     * Original image height in pixels (optional, to skip getimagesize())
     */
    height?: number | null;
};

