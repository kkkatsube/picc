/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type HealthCheck = {
    status: HealthCheck.status;
    message: string;
    connection_time_ms?: number;
    driver?: string;
    error?: string;
};

export namespace HealthCheck {

    export enum status {
        OK = 'ok',
        ERROR = 'error',
    }


}

