// Minimal standalone process: exposes ONLY the DB-truth gauges on /metrics.
// Runs as a single-replica Deployment, separate from the traffic-serving
// backend/admin-backend pods, so DB polling never duplicates across HPA
// replicas and Grafana never has to worry about sum() vs max() semantics
// for these specific metrics.
const express = require("express");
const mongoose = require("mongoose");
const { register } = require("../metrics");
const { startMetricsCollector } = require("./metricsCollector");

const app = express();
const PORT = process.env.METRICS_PORT || 9200;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("metrics-exporter connected to MongoDB");
    startMetricsCollector(); // polls Mongo every 30s, sets Gauges — see existing metricsCollector.js
  })
  .catch((err) => {
    console.error("metrics-exporter Mongo connection error:", err);
    process.exit(1);
  });

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

app.listen(PORT, () => console.log(`metrics-exporter listening on ${PORT}`));