import { MCPClient } from "./mcp";

const PORT = 8080;
const host = "localhost";

const randInRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const randData = () => ({
  rotation: randInRange(-127, 127),
  speed: randInRange(0, 255),
  isHeadLightsOn: Boolean(randInRange(0, 1)),
});

{
  const data = randData();
  console.log(data);

  const client = new MCPClient();
  client.connect(host, PORT).then(() => {
    client.auth("1234").send(data);
  });
}

{
  const data = randData();
  console.log(data);

  const client = new MCPClient();
  client.connect(host, PORT).then(() => {
    client.auth("12345").send(data);
  });
}

{
  const data = randData();
  console.log(data);

  const client = new MCPClient();
  client.connect(host, PORT).then(() => {
    client.send(data);
  });
}
