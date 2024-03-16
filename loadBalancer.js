import express from "express";
import httpProxy from "http-proxy";
import { promisify } from "util";

// Configuration
const LB_PORT = 80; // Port on which the load balancer listenst
const BACKEND_HOSTS = ["localhost:3000", "localhost:3001"]; // List of backend server hosts
let currentBackendIndex = 0;

const app = express();
const proxy = httpProxy.createProxyServer({});

const proxyWebAsync = promisify(proxy.web.bind(proxy));

function getNextBackendServer() {
  const backendServer = BACKEND_HOSTS[currentBackendIndex];
  currentBackendIndex = (currentBackendIndex + 1) % BACKEND_HOSTS.length;
  return backendServer;
}

app.use(async (req, res, next) => {
  console.log("Received request: ", req.ip);
  try {
    // Forward request to backend server's /health endpoint using async/await
    await proxyWebAsync(req, res, {
      target: `http://${getNextBackendServer()}`,
    });
  } catch (error) {
    console.error("Error forwarding request to backend server:", error);
    res.status(500).send("Internal Server Error");
  }
});

proxy.on("proxyRes", (proxyRes, req, res) => {
  let data = "";
  proxyRes.on("data", (chunk) => {
    data += chunk;
  });
  proxyRes.on("end", () => {
    console.log("Response from server: " + proxyRes.statusCode);
    console.log("Data from server:", data.toString());
  });
});

app.listen(LB_PORT, () => {
  console.log("Load balancer running on port " + LB_PORT);
});
