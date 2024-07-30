import { IncomingMessage, ServerResponse } from "http";
import FileRouter from "./file.router";
import Response from "../utils/response";

class MainRouter {
  private fileRoute: FileRouter;

  constructor() {
    this.fileRoute = new FileRouter();
  }

  public handleRequests = (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || "";

    const route = url.split("/")[1];

    if (route == "file") return this.fileRoute.routes(req, res);

    return Response.send(res, {
      status: 404,
      data: { message: "Route not found" },
    });
  };
}

export default MainRouter;
