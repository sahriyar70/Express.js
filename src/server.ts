
import express, { Request, Response } from 'express';
import { Pool } from 'pg';


const app = express();
const port = 5000;


const pool = new Pool({
  connectionString: `psql postgresql://neondb_owner:npg_xU6uEDIwda5h@ep-dry-glitter-ahihjmvz-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
});

//parser 
app.use(express.json())

app.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ success: true, dbTime: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});

// ...existing code...