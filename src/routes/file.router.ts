import { IncomingMessage, ServerResponse } from "http";
import FileController from "../controllers/file.controller";
import Response from "../utils/response";
import { parse } from "url";

class FileRouter {
  private fileController: FileController;

  constructor() {
    this.fileController = new FileController();
  }

  public routes = (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || "", true);
    const { pathname } = parsedUrl;

    if (pathname === "/file/upload" && req.method === "POST") {
      this.fileController.handleUpload(req, res);
    } else if (pathname === "/file/list" && req.method === "GET") {
      this.fileController.handleList(req, res);
    } else if (pathname === "/file/get" && req.method === "GET") {
      this.fileController.handleGet(req, res, parsedUrl.query);
    } else if (pathname === "/file/delete" && req.method === "DELETE") {
      this.fileController.handleDelete(req, res, parsedUrl.query);
    } else {
      Response.send(res, {
        status: 404,
        data: { message: "Route not found" },
      });
    }
  };
}

export default FileRouter;
