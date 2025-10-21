// controllers/authController.js
import { hash, compare } from 'bcrypt';
import { sequelize} from '../database/mysql.js';
import { generateToken } from '../security/jwt.js';

export  async function login (request, reply) {
    const { email, password } = request.body;

      console.log('================================================');
      console.log('[Login] receive request : ', request.body);
      console.log('================================================');


    if (!email || !password) {
      return reply.status(400).send({ error: 'email and password required' });
    }

    try {
    const rows = await sequelize.query(
          'SELECT * FROM users WHERE email = :email',
          {
            replacements: { email },
            type: sequelize.QueryTypes.SELECT,
          }
        );

      if (rows.length === 0) {
        console.log("[Login] no rows found");

        return reply.status(401).send("[Login] : no rows found ");
      }

      const user = rows[0];
      const match = await compare(password, user.passwordHash);

      if (!match) {
        console.log("[Login] pass error");
        return reply.status(402).send({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = generateToken({ id: user.id, email: user.email });
      
      // log the generated token
      console.log('Generated JWT:', token);
      reply.send({ success: true, token,user });
    } catch (err) {
      reply.status(500).send({ error: err.message });
    }
  };


export async function register (request, reply)  {
 try {

      console.log("[register] =====");


      const { username, password, email,nom ,prenom } = request.body;
      console.log('Request body:', request.body); // <-- log it
      if (!username || !password || !email  || !nom  || !prenom) {
        return reply.status(400).send({ error: 'Username, email and password required' });
      }

   
      const existing =  await sequelize.query(
          'SELECT * FROM users WHERE username = :username',
          {
            replacements: { username },
            type: sequelize.QueryTypes.SELECT,
          }
        );

      if (existing.length > 0) {
        console.log("[register] : User already existe");
        return reply.status(400).send({ error: 'User already exists' });
      }


      const emailRow  = await sequelize.query('SELECT * FROM users WHERE email = :email',
        {
          replacements:{ email},
          type: sequelize.QueryTypes.SELECT,
        }
      )

      if(emailRow.length > 0)
      {
        console.log(" email already exist ",email); 
        return reply.status(400).send({error : 'Email already existe'});

      }

      console.log(" =======[REGISTER]  user - pass - email :",username,password,email);

      const hashed = await hash(password, 10);
      const [insertId] = await sequelize.query(
        'INSERT INTO users (username, passwordHash,email, name, lastName) VALUES (:username, :hashed, :email, :nom,:prenom)',
         {
          replacements :{username, hashed,email,nom,prenom},
          type: sequelize.QueryTypes.INSERT
        }
      );
      
      console.log("[register] : User Created : ", insertId);
      reply.send({ success: true, userId: insertId });

    } catch (err) {
      console.log("[register] : err ", err);
      reply.status(500).send({ error: err.message });
    }
  };
