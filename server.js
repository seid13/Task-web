const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const oracledb = require("oracledb");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); 

const taskDbConfig = {
  user: "admin",                
  password: "1234",         
  connectString: "localhost/5500" 
};

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let connection;

  try {
    connection = await oracledb.getConnection(taskDbConfig);

    const result = await connection.execute(
      `SELECT username, password_hash FROM users WHERE username = :username`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.send("İstifadəçi tapılmadı");
    }

    const dbPasswordHash = result.rows[0][1]; // password_hash sütunu
    const match = await bcrypt.compare(password, dbPasswordHash);

    if (match) {
      res.redirect("/dashboard.html"); // uğurlu login → dashboard
    } else {
      res.send("Şifrə səhvdir");
    }
  } catch (err) {
    console.error(err);
    res.send("Database xətası");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Server portu
app.listen(5500, () => {
  console.log("Server işləyir: http://localhost:3000");
});