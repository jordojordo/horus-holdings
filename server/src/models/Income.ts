import type { PartialBy } from '@sequelize/utils';
import type { RecurrenceKind, SimpleRecurrence, WeekendAdjustment } from '@server/types';

import { DataTypes, Model, sql } from '@sequelize/core';

import sequelize from '@server/config/database';
import User from '@server/models/User';

export interface IncomeAttributes {
  id:                 string;
  name:               string;
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

export type IncomeCreationAttributes = PartialBy<IncomeAttributes, 'id' | 'date' | 'category' | 'recurrenceKind' | 'rrule' | 'simple' | 'anchorDate' | 'endDate' | 'count' | 'timezone' | 'weekendAdjustment' | 'includeDates' | 'excludeDates' | 'createdAt' | 'updatedAt'>;

class Income extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
  declare id:                 string;
  declare name:               string;
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

Income.init({
  id: {
    type:         DataTypes.UUID,
    defaultValue: sql.uuidV4,
    primaryKey:   true,
  },
  name:        { type: DataTypes.STRING, allowNull: false },
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
    type: DataTypes.STRING, allowNull: false, defaultValue: 'none' 
  },
  rrule:             { type: DataTypes.TEXT, allowNull: true },
  simple:            { type: DataTypes.JSON, allowNull: true },
  anchorDate:        { type: DataTypes.DATEONLY, allowNull: true },
  endDate:           { type: DataTypes.DATEONLY, allowNull: true },
  count:             { type: DataTypes.INTEGER, allowNull: true },
  timezone:          { type: DataTypes.STRING, allowNull: true },
  weekendAdjustment: {
    type: DataTypes.STRING, allowNull: false, defaultValue: 'none' 
  },
  includeDates:      { type: DataTypes.JSON, allowNull: true },
  excludeDates:      { type: DataTypes.JSON, allowNull: true },
  userID:            { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize,
  tableName: 'incomes',
});

Income.belongsTo(User, { foreignKey: 'userID' });

export default Income;
