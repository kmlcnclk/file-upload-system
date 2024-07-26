import { ServerResponse } from "http";

class Response {
  static send(
    res: ServerResponse,
    { data = {}, status = 200, contentType = "application/json" }
  ) {
    res.writeHead(status, { "Content-Type": contentType });
    res.write(JSON.stringify(data));
    res.end();
  }
}

export default Response;
