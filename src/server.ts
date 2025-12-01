
import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv'
import path from 'path'
import { resourceLimits } from 'worker_threads';
import { subscribe } from 'diagnostics_channel';

dotenv.config({path: path.join(process.cwd(), '.env') });


const app = express();
const port = 5000;
app.use(express.json())

//DB
const pool = new Pool({
  connectionString: `${process.env.CANNECTION_STR}`
});


const initDB  = async()=>{
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INT,
    phone VARCHAR(14),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()

)`)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos(
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      titel VARCHAR(200) NOT NULL,
      description TEXT ,
      completed BOOLEAN DEFAULT  false,
      due_date TIMESTAMP DEFAULT NOW(),
      update_at TIMESTAMP DEFAULT NOW( )

      )
      `)
}
initDB()
//parser 


app.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ success: true, dbTime: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'DB error' });
  }
});
// user CRUD 
app.post('/users', async(req:Request,res:Response)=>{

  const {name, email}= req.body;
  try{
    const result =  await pool.query(`INSERT INTO users( name , email) VALUES($1,$2) 
      RETURNING *`,[name,email])
      // console.log(result.rows[0])
      // res.send({message:"data insarted "})
      res.status(201).json({
      saccess: false,
      message: 'data insrted successfully',
      data : result.rows[0]
    })

  }catch(err:any){
    res.status(404).json({
      saccess: false,
      message: err.message
    })
  }
  
})

app.get('/users/', async (req:Request,res:Response)=>{
  try{
    const result = await pool.query(`SELECT * FROM users`)
    res.status(200).json({
      success: true,
      message:"users retrieved  successfully",
      data: result.rows 
    })

  }catch(err:any){
    res.status(500).json({
      success: false,
      message : err.message,
      datails : err

    })
  }
})

app.get('/users/:id',async (req:Request,res:Response)=>{
  // console.log(req.params)
  // res.send({message:'cool.......... '})
  try{
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`,[req.params.id])
    // console.log(result.rows)
    if(result.rows.length==0){
      res.status(404).json({
        saccess: false,
      message: 'users not found'
      })
    } else{
      res.status(200).json({
        saccess: true,
      message: "users fetched successfully",
      data: result.rows[0]
      })
    }
  }catch(err:any){
    res.status(500).json({
      saccess: false,
      message: err.message
    })
  }
})

app.listen(port,()=>{
  console.log(`runing in ${port}`)
})

// ...existing code...