const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool;

async function getConnection() {
  try {
    if (pool?.connected) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    console.log("Conectado correctamente a SQL Server");
    return pool;
  } catch (error) {
    console.error("Error al conectar con SQL Server:", error.message);
    throw error;
  }
}

module.exports = {
  sql,
  getConnection,
};