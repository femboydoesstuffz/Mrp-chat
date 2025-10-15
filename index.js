const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app); // Create HTTP server

// Create WebSocket server, attached to HTTP server
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected. Total clients:", clients.size);

  ws.send(JSON.stringify({ type: "status", message: "Connected to MRP chat server." }));

  ws.on("message", (data) => {
    for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected. Total clients:", clients.size);
  });
});

app.get("/", (req, res) => {
  res.send("MRP Chat WebSocket server running.");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
