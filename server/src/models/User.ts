import { DataTypes, Model, Optional } from 'sequelize';

import sequelize from '../config/database';
import { UserAttributes } from '../types/User';

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
}

User.init(
  {
    id: {
      type:          DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey:    true,
    },
    username: {
      type:      DataTypes.STRING,
      allowNull: false,
      unique:    true,
    },
    password: {
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
