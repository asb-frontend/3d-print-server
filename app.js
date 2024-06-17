const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // Assuming you're using PostgreSQL

// Database connection (replace with your credentials)
const pool = new Pool({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

// ... other middleware and routes

// Registration route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Input validation (omitted for brevity)

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt

    const newUser = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [
      username,
      email,
      hashedPassword,
    ]);

    res.json({ message: 'User created successfully!', user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);

    if (!user.rows[0]) {
      return res.status(401).json({ message: 'Invalid username or email' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password); // Compare hashed passwords

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token (optional, omitted for brevity)

    res.json({ message: 'Login successful!', user: user.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// ... other routes

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});