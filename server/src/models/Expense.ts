import { DataTypes, Model, sql } from '@sequelize/core';
import type { RecurrenceKind, SimpleRecurrence, WeekendAdjustment } from '@server/types';

import type { PartialBy } from '@sequelize/utils';

import sequelize from '@server/config/database';
import User from '@server/models/User';

export interface ExpenseAttributes {
  id:                 string;
  description:        string;
  amount:             number;
  category:           string | null;
  date:               string | null;            // one-off date when recurrenceKind='none'
  recurrenceKind:     RecurrenceKind;           // 'none' | 'simple' | 'rrule'
  rrule?:             string | null;            // multi-line iCal (optional for 'simple')
  simple?:            SimpleRecurrence | null;
  anchorDate?:        string | null;
  endDate?:           string | null;
  count?:             number | null;
  timezone?:          string | null;
  weekendAdjustment?: WeekendAdjustment;
  includeDates?:      string[] | null;
  excludeDates?:      string[] | null;
  userID:             string;
  createdAt?:         Date;
  updatedAt?:         Date;
}

// interface ExpenseCreationAttributes extends PartialBy<ExpenseAttributes, 'id'> {}
export type ExpenseCreationAttributes = PartialBy<ExpenseAttributes, 'id' | 'date' | 'category' | 'recurrenceKind' | 'rrule' | 'anchorDate' | 'endDate' | 'count' | 'timezone' | 'weekendAdjustment' | 'includeDates' | 'excludeDates' | 'createdAt' | 'updatedAt'>;

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
  declare id:                 string;
  declare description:        string;
  declare amount:             number;
  declare category:           string | null;
  declare date:               string | null;
  declare recurrenceKind:     RecurrenceKind;
  declare rrule:              string | null;
  declare simple:             SimpleRecurrence | null;
  declare anchorDate:         string | null;
  declare endDate:            string | null;
  declare count:              number | null;
  declare timezone:           string | null;
  declare weekendAdjustment:  WeekendAdjustment;
  declare includeDates:       string[] | null;
  declare excludeDates:       string[] | null;
  declare userID:             string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Expense.init(
  {
    id: {
      type:          DataTypes.UUID,
      defaultValue:  sql.uuidV4,
      primaryKey:    true,
      allowNull:     false,
    },
    description: { type: DataTypes.STRING(255), allowNull: false },
    amount:      { type: DataTypes.DECIMAL(12,2), allowNull: false },
    category:    { type: DataTypes.STRING, allowNull: true },
    date:        {
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
    recurrenceKind: {
      type:         DataTypes.STRING,
      allowNull:    false,
      defaultValue: 'none' 
    },
    rrule:             { type: DataTypes.TEXT, allowNull: true },
    simple:            { type: DataTypes.JSON, allowNull: true },
    anchorDate:        { type: DataTypes.DATEONLY, allowNull: true },
    endDate:           { type: DataTypes.DATEONLY, allowNull: true },
    count:             { type: DataTypes.INTEGER, allowNull: true },
    timezone:          { type: DataTypes.STRING, allowNull: true },
    weekendAdjustment: {
      type:         DataTypes.STRING,
      allowNull:    false,
      defaultValue: 'none' 
    },
    includeDates: { type: DataTypes.JSON, allowNull: true },
    excludeDates: { type: DataTypes.JSON, allowNull: true },
    userID:       {
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
