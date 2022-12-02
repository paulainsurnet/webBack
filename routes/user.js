import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { TOKEN_EXPIRED_ERROR } from '../errors';
import MongoDriver from '../mongo-driver';

const { SALT, MASTER_KEY } = process.env;

export default (app, mongoClient) => {
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, SALT);
    if (!email || !password) {
      res.status(500).json('ERROR no params');
    } else {
      const userFound = await (await MongoDriver(mongoClient, 'users')).findOne({
        email, password: hashPassword
      });
  
      if (userFound) {
        delete userFound.password;
        const token = JWT.sign(userFound, MASTER_KEY, { expiresIn: 1440 })
        res.send({
          success: true,
          token
        });
      } else {
        res.send({
          success: false,
        });
      }
    }
  })
  
  app.post('/getUserInfo', (req, res) => {
    const { token } = req.body;
    if (undefined === token) {
      res.status(500);
      res.send({message: 'No token supplied.'});
    } else {
      JWT.verify(token, MASTER_KEY, (err, decoded) => {
        if (err) {
          if (err.name === TOKEN_EXPIRED_ERROR) {
            res.status(200);
            res.send({ expired: true });
          } else {
            res.status(500);
            res.send(new Error('Invalid token'));
          }
        } else {
          res.send({ decoded });
        }
      })
    }
  })
  
  app.post('/signUp', async (req, res) => {
    const { email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, SALT);
  
    if (!email || !password) {
      res.status(500).json('ERROR no params');
    } else {
      const createdUser = await (await MongoDriver(mongoClient, 'users')).insert({
        email, password: hashPassword
      });
  
      if (createdUser) {
        res.json({
          success: true,
          user: createdUser
        });
      } else {
        res.status(500).send({ error: 'User not created' }); // Ver como manejar estos errores
      }
    }
  });
}
