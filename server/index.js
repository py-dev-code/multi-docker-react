const keys = require("./keys");

// Express App setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");   // cors stands for Cross-Origin-Resource-Sharing to allow sharing requests between 2 totally different processes

const app = express();
app.use(cors());
app.use(bodyParser.json());     // to parser incoming request and cast their body to JSON

// Postgres Client setup
const { Pool } = require("pg");
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require("redis");
redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express Route Handlers
app.get("/", (req, res) => {
    res.send("Hi");
});

app.get("/values/all", async (req, res) => {
    const values = await pgClient.query("SELECT * FROM values");
    // we will only send the retreived rows to the request as values object will have other query related data as well.
    res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
    // hgetall doesnt have support for await so we are using a callback function
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    });
});

app.post("/values", async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send("Index too high");
    }

    redisClient.hset("values", index, "Nothing yet");
    redisClient.publish("insert", index);
    pgClient.query("INSERT INTO values (number) VALUES ($1)", [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log("Listening on Port 5000");
});