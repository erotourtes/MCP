import EventEmitter from "node:events";
import net from "node:net";

export enum MessageType {
  data,
  signIn,
}

export type data = {
  rotation: number;
  speed: number;
  isHeadLightsOn: boolean;
};

export class MCPClient {
  socket: net.Socket | null = null;

  connect(host: string, port: number) {
    this.socket = new net.Socket();
    const socket = this.socket;

    const promise = new Promise<void>((resolve) => {
      socket
        .connect(port, host, () => {
          resolve();
          console.log("Connected to server");
        })
        .on("close", () => {
          console.log("Connection closed");
        });
    });
    return promise;
  }

  send(data: data) {
    if (!this.socket) throw new Error("Not connected to server");
    this.checkData(data);

    const buffer = new ArrayBuffer(3);

    const uView = new Uint8Array(buffer);
    uView[1] = data.speed;

    const iView = new Int8Array(buffer);
    iView[0] = MessageType.data & Number(data.isHeadLightsOn);
    iView[2] = data.rotation;

    this.socket.write(Buffer.from(buffer).toString("binary"));
    return this;
  }

  auth(password: string) {
    if (!this.socket) throw new Error("Not connected to server");

    const messageType = String.fromCharCode(MessageType.signIn << 7);
    const message = messageType + password;

    this.socket.write(Buffer.from(message, "binary"));
    return this;
  }

  private checkData(data: data) {
    if (data.rotation < -127 || data.rotation > 127)
      throw new Error("Rotation must be between -127 and 127");
    if (data.speed < 0 || data.speed > 255)
      throw new Error("Speed must be between 0 and 255");
  }
}

export class MCPServer extends EventEmitter {
  private server: net.Server | null = null;

  listen(port: number) {
    this.server = net.createServer((socket) => {
      socket
        .on("close", () => {
          this.emit("close", socket);
        })
        .on("data", (buffer) => {
          const messageType = this.messageType(buffer);
          let data;

          switch (messageType) {
            case MessageType.data:
              data = this.parseData(buffer);
              break;
            case MessageType.signIn:
              data = buffer.toString().substring(1);
              break;
          }

          this.emit(messageType.toString(), data, socket);
        });
    });

    this.server.listen(port);
  }

  private messageType(buffer: Buffer): MessageType {
    return (buffer[0]! & (1 << 7)) === 0
      ? MessageType.data
      : MessageType.signIn;
  }

  private parseData(buffer: Buffer): data {
    return {
      isHeadLightsOn: (buffer.readInt8(0)! & 1) === 1,
      rotation: buffer.readInt8(2)!,
      speed: buffer.readUint8(1)!,
    };
  }
}
