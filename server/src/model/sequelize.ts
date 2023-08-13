import {Sequelize} from 'sequelize';
import { appConfig } from '../config';

export const sequelize = new Sequelize({
    dialect: 'postgres',
    ...appConfig.pg,
});
