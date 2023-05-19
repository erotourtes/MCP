import { MCPServer, MessageType, data } from "./mcp";
import net from "node:net";

const PORT = 8080;
const SERVER_PASSWORD = "1234";
const clients = new Map<net.Socket, Boolean>();

const server = new MCPServer();
server.listen(PORT);

server.on(MessageType.data.toString(), (data: data, socket) => {
  if (!clients.has(socket) || !clients.get(socket)) {
    clients.delete(socket);
    return;
  }

  console.dir(data);
});

server.on(MessageType.signIn.toString(), (password: string, socket) => {
  clients.set(socket, password === SERVER_PASSWORD);
});

server.on("close", (socket) => {
  console.log("Client disconnected");
  clients.delete(socket);
});
