/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HealthCheck } from './HealthCheck';

export type HealthResponse = {
    status: HealthResponse.status;
    message: string;
    timestamp: string;
    version: string;
    checks: {
        api: HealthCheck;
        database: HealthCheck;
        redis: HealthCheck;
    };
};

export namespace HealthResponse {

    export enum status {
        OK = 'ok',
        ERROR = 'error',
    }


}

