import { DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../config/database';
import User from './User';

interface IncomeAttributes {
  id: number;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
  recurrenceType?: string;
  recurrenceEndDate?: string;
  userId: number;
}

interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id'> {}

class Income extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
  public id!: number;
  public description!: string;
  public amount!: number;
  public date!: string;
  public recurring!: boolean;
  public recurrenceType?: string;
  public recurrenceEndDate?: string;
  public userId!: number;
}

Income.init(
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    description: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type:      DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      get() {
        const rawDate = this.getDataValue('date');

        return rawDate ? new Date(rawDate).toISOString().split('T')[0] : null;
      },
      set(value: string) {
        this.setDataValue('date', value);
      },
    },
    recurring: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
    },
    recurrenceType: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
    recurrenceEndDate: {
      type:      DataTypes.DATEONLY,
      allowNull: true,
      get() {
        const rawDate = this.getDataValue('recurrenceEndDate');

        return rawDate ? new Date(rawDate).toISOString().split('T')[0] : null;
      },
      set(value: string) {
        this.setDataValue('recurrenceEndDate', value);
      },
    },
    userId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'incomes',
  }
);

Income.belongsTo(User, { foreignKey: 'userId' });

export default Income;
