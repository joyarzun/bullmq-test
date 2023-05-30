const cluster = require("cluster");
const { Queue, Worker } = require("bullmq");

const REDIS_CONFIG = {
  connection: {
    host: "localhost",
    port: 6379,
  },
};

const WORKER_QTY = 30;
const MESSAGES_GENERATED = 10000;
const MESSAGE_DELAY = 0;
const SIMULATED_PROCESS_TIME_MS = 100;

if (cluster.isMaster) {
  let hrstart;

  for (let i = 0; i++ < WORKER_QTY; ) {
    let worker = cluster.fork();

    worker.on("message", (msg) => {
      const { start, end } = msg;

      if (start) {
        hrstart = process.hrtime();
        console.log("started queue");
      }
      if (end) {
        let hrend = process.hrtime(hrstart);
        console.log(`finished queue in ${hrend[0]}s ${hrend[1] / 1000000}ms`);
      }
    });
  }
} else {
  (async () => {
    const queue = new Queue("queue", REDIS_CONFIG);

    if (cluster.worker.id === 1) {
      console.log(`cluster ${cluster.worker.id} pushing`);
      let promises = [];

      process.send({ start: true });
      for (let i = 0; i++ < MESSAGES_GENERATED; )
        promises.push(queue.add("job", { i }, { delay: MESSAGE_DELAY }));

      await Promise.all(promises);
    } else {
      console.log(`cluster ${cluster.worker.id} reading`);

      const worker = new Worker(
        "queue",
        async (job) => {
          const { i } = job.data;

          await new Promise((r) => setTimeout(r, SIMULATED_PROCESS_TIME_MS));

          if (i === 10000) process.send({ end: true });
        },
        REDIS_CONFIG
      );
    }
  })();
}
