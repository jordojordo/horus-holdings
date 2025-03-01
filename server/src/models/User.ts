import { DataTypes, Model } from '@sequelize/core';
import type { PartialBy } from '@sequelize/utils';

import sequelize from '@server/config/database';

interface UserAttributes {
  id: string;
  Username: string;
  Password: string;
}

interface UserCreationAttributes extends PartialBy<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public Username!: string;
  public Password!: string;
}

User.init(
  {
    id: {
      type:          DataTypes.UUID,
      defaultValue:  DataTypes.UUIDV4,
      primaryKey:    true,
      allowNull:     false,
    },
    Username: {
      type:      DataTypes.STRING,
      allowNull: false,
      unique:    true,
    },
    Password: {
      type:      DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;
