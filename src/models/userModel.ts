import pool from '../config/db';

export interface User {
  id: string;
  email: string;
  password: string;
}

const createUser = async (email: string, hashedPassword: string): Promise<any> => {
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
    [email, hashedPassword]
  );
  return result.rows[0];
};

const findUserByEmail = async (email: string): Promise<any> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export { createUser, findUserByEmail };