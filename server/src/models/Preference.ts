import { DataTypes, Model } from '@sequelize/core';
import type { PartialBy } from '@sequelize/utils';

import sequelize from '@server/config/database';
import User from '@server/models/User';

interface PreferenceAttributes {
  id: string;
  userID: number;
  foobar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PreferenceCreationAttributes extends PartialBy<PreferenceAttributes, 'id'> {}

class Preference extends Model<PreferenceAttributes, PreferenceCreationAttributes> implements PreferenceAttributes {
  public id!: string;
  public userID!: number;
  public foobar!: string;
  public createdAt!: string;
  public updatedAt!: string;
}

Preference.init(
  {
    id: {
      type:          DataTypes.UUID,
      defaultValue:  DataTypes.UUIDV4,
      primaryKey:    true,
      allowNull:     false,
    },
    userID: {
      type:       DataTypes.UUID,
      allowNull:  false,
      references: {
        model: User,
        key:   'id',
      },
    },
    foobar: {
      type:      DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName:  'preferences',
    timestamps: true,
  }
);

// Set up association between User and Preference
User.hasOne(Preference, {
  foreignKey: 'userID',
  as:         'Preference'
});
Preference.belongsTo(User, {
  foreignKey: 'userID',
  as:         'User'
});

export default Preference;
