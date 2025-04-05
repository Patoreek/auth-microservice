import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER as string,
  host: process.env.PG_HOST as string,
  database: process.env.PG_DATABASE as string,
  password: process.env.PG_PASSWORD as string,
  port: parseInt(process.env.PG_PORT as string, 10),
});

export default pool;