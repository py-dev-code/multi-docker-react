const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // Below option is to retry connecting to redis server after every 1 sec whenever connection is lost
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// Whenever a new message is found, invoke this callback function
sub.on("message", (channel, message) => {
    // Create a Hash Set named as "values". Key will be message, value will be calculated from the fib function.
    redisClient.hset("values", message, fib(parseInt(message)));
});
// Subscribing the Duplicate client connection to watch for any new insert
sub.subscribe("insert");
