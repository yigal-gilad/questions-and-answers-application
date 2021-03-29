var dotenv = require('dotenv');
dotenv.config({ path: ".env" });

console.log(process.env);
const envData = {
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
    ddos_burst: process.env.DDOS_BURST,
    ddos_limit: process.env.DDOS_LIMIT,
    dbUrl: process.env.DBURL,
    elastic_client_user: process.env.ELASTIC_CLIENT_USER,
    elastic_client_password: process.env.ELASTIC_CLIENT_PASSWORD,
    elastic_client_url: process.env.ELASTIC_CLIENT_URL
}

module.exports = envData;