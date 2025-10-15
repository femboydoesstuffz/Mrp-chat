const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app); // HTTP server for both HTTP and WS

const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Client connected. Total clients:", clients.size);

  ws.send(JSON.stringify({ type: "status", message: "Connected to MRP chat server." }));

  ws.on("message", (data) => {
    let message;

    // Convert Buffer (for all non-string incoming messages, which are usually Buffers)
    if (Buffer.isBuffer(data)) {
      message = data.toString(); // Always treat as text
    } else {
      message = data;
    }

    // Broadcast as string to all
    for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected. Total clients:", clients.size);
  });
});

// Optional: Simple homepage response
app.get("/", (req, res) => {
  res.send("MRP Chat WebSocket server running.");
});

// Listen on the correct port
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
