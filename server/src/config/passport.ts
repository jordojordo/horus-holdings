import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

import User from '@server/models/User';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username', // Specify the username field
      passwordField: 'password', // Specify the password field
    },
    async(username, password, done) => {
      try {
        const user = await User.findOne({ where: { Username: username } });

        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        const match = await bcrypt.compare(password, user.Password);

        if (!match) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async(id: number, done) => {
  try {
    const user = await User.findByPk(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
