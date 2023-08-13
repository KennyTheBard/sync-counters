import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
} from 'sequelize';
import { sequelize } from './sequelize';
import { Counter } from 'common';

export class CounterModel extends Model<
    InferAttributes<CounterModel>,
    InferCreationAttributes<CounterModel>
> {
    declare uuid: string;
    declare name: string;
    declare value: number;
    declare createdAt: number;

    public toDto(): Counter {
        return {
            uuid: this.uuid,
            name: this.name,
            value: this.value,
            createdAt: this.createdAt,
        }
    }
}

CounterModel.init(
    {
        uuid: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'created_at'
        },
    },
    {
        sequelize,
        tableName: "counters",
        timestamps: false,
        underscored: true,
    }
);

export default CounterModel;
