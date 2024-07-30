import {
  IncomingMessage,
  ServerResponse,
  createServer as createHttpServer,
} from "http";
import MainRoute from "./routes";
import Response from "./utils/response";
import LoggerMiddleware from "./middlewares/logger.middleware";
import { readFileSync } from "fs";
import { createServer as createHttpsServer } from "https";
import envJson from "../env.json";

class Main {
  mainRoute: MainRoute;
  HTTP_PORT: number;
  HTTPS_PORT: number;

  constructor() {
    this.mainRoute = new MainRoute();
    this.HTTP_PORT = envJson.HTTP_PORT;
    this.HTTPS_PORT = envJson.HTTPS_PORT;
  }

  public initializeServer = () => {
    const httpsOptions = {
      key: readFileSync("cert/key.pem"),
      cert: readFileSync("cert/cert.pem"),
    };

    // HTTP Server
    createHttpServer((req, res) => {
      this.redirectToHttps(req, res, this.HTTPS_PORT);
    }).listen(this.HTTP_PORT, () => {
      console.log(`HTTP server listening on port ${this.HTTP_PORT}`);
    });

    // HTTPS Server
    createHttpsServer(
      httpsOptions,
      (req: IncomingMessage, res: ServerResponse) => {
        const url = req.url || "";
        const method = req.method || "";

        if (url && method) {
          this.mainRoute.handleRequests(req, res);
        } else {
          Response.send(res, {
            status: 404,
            data: { message: "Route not found" },
          });
        }
      }
    )
      .on("request", LoggerMiddleware.info)
      .listen(this.HTTPS_PORT, () => {
        console.log(`HTTPS server listening on port ${this.HTTPS_PORT}`);
      });
  };

  private redirectToHttps = (
    req: IncomingMessage,
    res: ServerResponse,
    httpsPort: number
  ) => {
    const host = req.headers["host"]?.split(":")[0];
    res.writeHead(307, {
      Location: `https://${host}:${httpsPort}${req.url}`,
    });
    res.end();
  };
}

const main = new Main();

main.initializeServer();
