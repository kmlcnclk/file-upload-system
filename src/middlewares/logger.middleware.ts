import { IncomingMessage, ServerResponse } from "http";

class LoggerMiddleware {
  static info(req: IncomingMessage, res: ServerResponse) {
    console.log(`${req.method} ${req.url}`);
  }
}

export default LoggerMiddleware;
