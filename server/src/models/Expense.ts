import { DataTypes, Model } from '@sequelize/core';
import type { PartialBy } from '@sequelize/utils';

import sequelize from '@server/config/database';
import User from '@server/models/User';

interface ExpenseAttributes {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string | null;
  recurring: boolean;
  recurrenceType?: string;
  recurrenceEndDate?: string | null;
  userID: string;
}

interface ExpenseCreationAttributes extends PartialBy<ExpenseAttributes, 'id'> {}

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  public id!: string;
  public description!: string;
  public amount!: number;
  public category!: string;
  public date!: string | null;
  public recurring!: boolean;
  public recurrenceType?: string;
  public recurrenceEndDate?: string | null;
  public userID!: string;
}

Expense.init(
  {
    id: {
      type:          DataTypes.UUID,
      defaultValue:  DataTypes.UUIDV4,
      primaryKey:    true,
      allowNull:     false,
    },
    description: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    amount: {
      type:      DataTypes.FLOAT,
      allowNull: false,
    },
    category: {
      type:      DataTypes.STRING,
      allowNull: true,
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
      type:      DataTypes.BOOLEAN,
      allowNull: false,
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
    userID: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'expenses',
  }
);

Expense.belongsTo(User, { foreignKey: 'userID' });

export default Expense;
