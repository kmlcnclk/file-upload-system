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
import { redirectToHttps } from "./utils/http";

const mainRoute = new MainRoute();

const initializeServer = async () => {
  try {
    const httpsOptions = {
      key: readFileSync("cert/key.pem"),
      cert: readFileSync("cert/cert.pem"),
    };

    const httpPort = 8080;
    const httpsPort = 8443;

    // HTTP Server
    createHttpServer((req, res) => {
      redirectToHttps(req, res, httpsPort);
    }).listen(httpPort, () => {
      console.log(`HTTP server listening on port ${httpPort}`);
    });

    // HTTPS Server
    createHttpsServer(
      httpsOptions,
      (req: IncomingMessage, res: ServerResponse) => {
        const url = req.url || "";
        const method = req.method || "";

        if (url && method) {
          mainRoute.handleRequests(req, res);
        } else {
          Response.send(res, {
            status: 404,
            data: { message: "Route not found" },
          });
        }
      }
    )
      .on("request", LoggerMiddleware.info)
      .listen(httpsPort, () => {
        console.log(`HTTPS server listening on port ${httpsPort}`);
      });
  } catch (error) {
    console.error("Error during server initialization:", error);
    process.exit(1); // Exit the process with an error code
  }
};

initializeServer();
