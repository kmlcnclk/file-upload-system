import { IncomingMessage, ServerResponse } from "http";
import FileController from "../controllers/file.controller";
import Response from "../utils/response";
import { parse, UrlWithParsedQuery } from "url";
import FileMiddleware from "../middlewares/file.middleware";

type Handler = "handleUpload" | "handleList" | "handleGet" | "handleDelete";

class FileRouter {
  private fileController: FileController;
  private fileMiddleware: FileMiddleware;

  constructor() {
    this.fileController = new FileController();
    this.fileMiddleware = new FileMiddleware();
  }

  public routes = (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl: UrlWithParsedQuery = parse(req.url || "", true);
    const { pathname } = parsedUrl;

    const routesMap = new Map([
      ["upload", new Map([["POST", "handleUpload"]])],
      ["list", new Map([["GET", "handleList"]])],
      ["get", new Map([["GET", "handleGet"]])],
      ["delete", new Map([["DELETE", "handleDelete"]])],
    ]);

    const path = pathname?.split("/")[2] ?? "";

    if (!path)
      return Response.send(res, {
        status: 400,
        data: { message: "Path not found" },
      });

    if (!routesMap.get(path))
      return Response.send(res, {
        status: 404,
        data: { message: "Route not found" },
      });

    if (!routesMap.get(path)?.get(req.method as string))
      return Response.send(res, {
        status: 405,
        data: { message: "Method not allowed" },
      });

    const handler: Handler = routesMap
      .get(path)
      ?.get(req.method as string) as Handler;

    if (handler === "handleGet" || handler === "handleDelete")
      return this.fileMiddleware.parsedUrlQuery(
        req,
        res,
        this.fileController[handler]
      );

    return this.fileController[handler](req, res);
  };
}

export default FileRouter;
