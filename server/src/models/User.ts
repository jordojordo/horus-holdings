import { DataTypes, Model, sql } from '@sequelize/core';
import type { PartialBy } from '@sequelize/utils';

import sequelize from '@server/config/database';

interface UserAttributes {
  id:       string;
  Username: string;
  Password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UserCreationAttributes extends PartialBy<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!:       string;
  public Username!: string;
  public Password!: string;
}

User.init(
  {
    id: {
      type:          DataTypes.UUID,
      defaultValue:  sql.uuidV4,
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
