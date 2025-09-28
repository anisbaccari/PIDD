const fastify = require('fastify')({ logger: true });
const pool = require('./db');
const bcrypt = require('bcrypt');


fastify.register(require('@fastify/cors'), {
    origin: '*', // allow all origins (for development)
    methods: ['GET', 'POST', 'OPTIONS']
  });

  
fastify.register(require('@fastify/formbody')); // parse POST forms

// --- Register route ---
fastify.post('/register', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password required' });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashed]
        );
        reply.send({ success: true, userId: result.insertId });
    } catch (err) {
        reply.status(500).send({ error: err.message });
    }
});

// --- Login route ---
fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
        return reply.status(400).send({ error: 'Username and password required' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return reply.status(401).send({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return reply.status(401).send({ error: 'Invalid credentials' });
        }

        reply.send({ success: true, message: 'Logged in!' });
    } catch (err) {
        reply.status(500).send({ error: err.message });
    }
});

// Start server
fastify.listen({ port: process.env.PORT || 3000 }, (err, address) => {
    if (err) throw err;
    console.log(`Server running at ${address}`);
});
