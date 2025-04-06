import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const masterDb = mysql.createPool({
  host: process.env.DB_HOST_MASTER, // Ensure this matches your Docker service name
  user: process.env.DB_MASTER_USER,
  password: process.env.DB_MASTER_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Limit number of connections in the pool
  queueLimit: 0, // Unlimited queue length
});

const slaveDb = mysql.createPool({
  host: process.env.DB_HOST_SLAVE, // Ensure this matches your Docker service name
  user: process.env.DB_SLAVE_USER,
  password: process.env.DB_SLAVE_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Limit number of connections in the pool
  queueLimit: 0, // Unlimited queue length
});

export { masterDb, slaveDb };