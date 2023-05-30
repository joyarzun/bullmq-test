# BullMQ benchmark test

Simple benchmark using local redis

## Usage

```bash
  npm install
  docker run -m 32m --name redis --rm -p 6379:6379 -d redis:6
  node test.js
```

To see redis stats:

```bash
  docker stats
```

## Explanation

`cluster` package will create N node processes using `cluster.fork` method. Master process will receive messages to measure the total time. Forked process Nº1 will produce X messages. Others N-1 forked processes will create a BullMQ Worker to consume the messages and at the last job it will send a message to master process to let it know when to stop the timer and output the total time.

## Config vars

At `test.js` you can change the following config:

- REDIS_CONFIG: Redis config. Default to localhost on port 6379
- WORKER_QTY: How many forked workers will consume messages
- MESSAGES_GENERATED: How many messages will be generated
- MESSAGE_DELAY: How many time the message will be [delayed](https://docs.bullmq.io/guide/jobs/delayed)
- SIMULATED_PROCESS_TIME_MS: How many time the forked workers will simulate a busy time (consumption time)
