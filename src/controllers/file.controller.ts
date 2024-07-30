import { IncomingMessage, ServerResponse } from "http";
import FileService from "../services/file.service";
import Response from "../utils/response";
import { ParsedUrlQuery } from "querystring";

class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  public handleUpload = async (req: IncomingMessage, res: ServerResponse) => {
    const contentType = req.headers["content-type"];

    if (contentType === "application/json") {
      let body: any[] = [];

      req.on("data", (chunk) => {
        body.push(chunk);
      });

      req.on("end", () => {
        const data = this.fileService.handleJsonUpload(body.toString());
        return Response.send(res, { status: data.status, data: data });
      });
    } else if (contentType && contentType.startsWith("image/")) {
      let imageData = Buffer.from([]);

      req.on("data", (chunk) => {
        imageData = Buffer.concat([imageData, chunk]);
      });

      req.on("end", () => {
        const data = this.fileService.handleImageUpload(imageData, contentType);
        return Response.send(res, { status: data.status, data: data });
      });
    } else if (contentType && contentType.startsWith("multipart/form-data")) {
      let body: any[] = [];

      req.on("data", (chunk) => {
        body.push(chunk);
      });

      req.on("end", () => {
        let newBody = Buffer.concat(body);
        const data = this.fileService.handleMultipartUpload(
          req.headers,
          newBody
        );
        return Response.send(res, { status: data.status, data: data });
      });
    } else {
      return Response.send(res, {
        status: 400,
        data: { error: "Unsupported Content-Type" },
      });
    }
  };

  public handleList = async (req: IncomingMessage, res: ServerResponse) => {
    const files = await this.fileService.handleList();
    return Response.send(res, { status: 200, data: { status: 200, files } });
  };

  public handleGet = async (req: IncomingMessage, res: ServerResponse) => {
    // @ts-ignore
    const { filename } = req.query;

    if (!filename)
      return Response.send(res, {
        status: 400,
        data: { message: "Filename is required" },
      });

    const data = await this.fileService.handleGet(
      filename as unknown as string
    );

    return Response.send(res, { status: data.status, data });
  };

  public handleDelete = async (req: IncomingMessage, res: ServerResponse) => {
    // @ts-ignore
    const { filename } = req.query;

    if (!filename)
      return Response.send(res, {
        status: 400,
        data: { message: "Filename is required" },
      });

    const data = this.fileService.handleDelete(filename as unknown as string);

    return Response.send(res, { status: data.status, data });
  };
}

export default FileController;
