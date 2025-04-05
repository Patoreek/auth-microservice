import pool from '../config/db';

export interface User {
  id: string;
  email: string;
  password: string;
}

const createUser = async (email: string, firstName: string, lastName: string, hashedPassword: string): Promise<User | null>=> {
  try {
    const result = await pool.query(
      'INSERT INTO users (email, first_name, last_name, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, firstName, lastName, hashedPassword]
    );
    return result.rows[0];
  } catch(err){
    console.log('ERROR:', err);
    return null;
  }
};

const findUserByEmail = async (email: string): Promise<User> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export { createUser, findUserByEmail };
