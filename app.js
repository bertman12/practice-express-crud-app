const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

require('dotenv').config();

const port = process.env.PORT;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(async function(req, res, next) {
  try {
    req.db = await pool.getConnection();
    req.db.connection.config.namedPlaceholders = true;

    await req.db.query(`SET SESSION sql_mode = "TRADITIONAL"`);
    await req.db.query(`SET time_zone = '-8:00'`);

    await next();

    req.db.release();
  } catch (err) {
    console.log(err);

    if (req.db) req.db.release();
    throw err;
  }
});

app.use(cors());

app.use(express.json());

app.get('/cars', async function(req, res) {
  try {
    const [cars] = await req.db.query(`SELECT * FROM car`); 
    console.log('/cars/:id');
    res.json(cars);
  } catch (err) {
    
  }
});

app.use(async function(req, res, next) {
  try {
    console.log('Middleware after the get /cars');
  
    await next();

  } catch (err) {

  }
});

app.post('/car', async function(req, res) {
  try {
    const { make, model, year } = req.body;
  
    const query = await req.db.query(
      `INSERT INTO car (make, model, year) 
       VALUES (:make, :model, :year)`,
      {
        make,
        model,
        year,
      }
    );
  
    res.json({ success: true, message: 'Car successfully created', data: null });
  } catch (err) {
    res.json({ success: false, message: err, data: null});
  }
});

app.delete('/car/:id', async function(req,res) {
  try {
    await req.db.query(`DELETE FROM car WHERE id = :id`,
    {
      id: req.params.id
    })
    console.log('req.params /car/:id; You deleted this item...', req.params);

    res.json('Success, item has been deleted! ');
  } catch (err) {
    res.json({ success: false, message: err, data: null});
  }
});

app.put('/car/:id', async function(req,res) {
  try {
    await req.db.query(`UPDATE car SET make = :make, model = :model, year = :year WHERE id = :id`,
    {
      id: req.params.id,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year
    })
    res.json('The item has been updated!!');
  } catch (err) {
    res.json({ success: false, message: err, data: null});
  }
});


app.listen(port, () => console.log(`212 API Example listening on http://localhost:${port}`));
