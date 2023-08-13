
import * as dotenv from 'dotenv';
import { get } from 'env-var';

dotenv.config();

export const appConfig: AppConfig = {
    port: get('PORT').required().asIntPositive(),
}

export type AppConfig = {
    port: number;
}
