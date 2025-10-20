// seed.js
/* import { ensureDatabase } from './initDb.js';
import { sequelize } from './mysql.js';
import '../models/User.js';
import '../models/Admin.js';
import '../models/Product.js';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await ensureDatabase();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const passHash = await bcrypt.hash('admin123', 10);
  const [admin] = await Admin.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: { username: 'admin', email: 'admin@example.com', passwordHash: passHash },
  });

  const [shirt] = await Product.findOrCreate({
    where: { name: 'Classic T-Shirt', category: 'T-Shirt' },
    defaults: { price: 19.99, quantity: 50, description: 'Cotton classic tee' },
  });

  console.log('Seed done', { admin: admin.email, product: shirt.name });
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
 */