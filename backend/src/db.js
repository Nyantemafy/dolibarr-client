import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'stk',
    user: 'postgres',
    password: 'antema',
});

pool.connect()
    .then(() => console.log('Connexion à PostgreSQL réussie'))
    .catch(err => console.error('Erreur de connexion à PostgreSQL', err.stack));

export default {
    query: (text, params) => pool.query(text, params),
};
