import * as dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
    server: process.env.AZURE_SQL_SERVER,
    // port: parseInt(process.env.AZURE_SQL_PORT),
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    options: {
        encrypt: true
    }
};