import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ExpenseAttributes {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string | null;
  recurring: boolean;
  recurrenceType?: string;
  recurrenceEndDate?: string | null;
  userId: number;
}

interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'id'> {}

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  public id!: number;
  public description!: string;
  public amount!: number;
  public category!: string;
  public date!: string | null;
  public recurring!: boolean;
  public recurrenceType?: string;
  public recurrenceEndDate?: string | null;
  public userId!: number;
}

Expense.init(
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
    userId: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'expenses',
  }
);

Expense.belongsTo(User, { foreignKey: 'userId' });

export default Expense;
