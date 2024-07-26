import { IncomingHttpHeaders } from "http";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path, { extname, join } from "path";

class FileService {
  private static uploadDir = path.join(__dirname, "../../uploads");

  constructor() {
    if (!existsSync(FileService.uploadDir)) {
      mkdirSync(FileService.uploadDir);
    }
  }

  public saveFile = (fileName: string, content: Buffer | string): string => {
    const filePath = path.join(FileService.uploadDir, fileName);
    writeFileSync(filePath, content);
    return filePath;
  };

  public parseJsonBody = (body: string): any => {
    try {
      return JSON.parse(body);
    } catch (error) {
      throw new Error("Invalid JSON format");
    }
  };

  private getTypes = (json: any): { [key: string]: string } => {
    const types: { [key: string]: string } = {};
    for (const key in json) {
      if (Array.isArray(json[key])) {
        types[key] = `array (${json[key].length} items)`;
      } else if (typeof json[key] === "object" && json[key] !== null) {
        types[key] = `object (${
          Object.keys(json[key]).length
        } key-value pairs)`;
      } else {
        types[key] = typeof json[key];
      }
    }
    return types;
  };

  public getFileDetails = (
    filePath: string
  ): {
    name: string;
    lastModified: Date;
    created: Date;
    size: {
      bytes: number;
      sizeInMB: number;
      sizeInGB: number;
    };
  } => {
    const stats = statSync(filePath);

    const sizeInMB = stats.size / (1024 * 1024);
    const sizeInGB = stats.size / (1024 * 1024 * 1024);

    return {
      name: path.basename(filePath),
      size: {
        bytes: stats.size,
        sizeInGB,
        sizeInMB,
      },
      lastModified: stats.mtime,
      created: stats.ctime,
    };
  };

  public parseMultipartFormData = (
    headers: IncomingHttpHeaders,
    body: Buffer
  ): {
    files: { [key: string]: string };
    fields: { [key: string]: string };
  } => {
    const boundary = this.getBoundary(headers["content-type"] || "");
    if (!boundary) throw new Error("Boundary not found in Content-Type header");

    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = [];
    let start = body.indexOf(boundaryBuffer) + boundaryBuffer.length;
    let end = body.indexOf(boundaryBuffer, start);

    while (end !== -1) {
      const part = body.subarray(start, end);
      parts.push(part);
      start = end + boundaryBuffer.length;
      end = body.indexOf(boundaryBuffer, start);
    }

    const files: { [key: string]: string } = {};
    const fields: { [key: string]: string } = {};

    parts.forEach((part) => {
      const headerEnd = part.indexOf("\r\n\r\n");
      const header = part.subarray(0, headerEnd).toString();
      const content = part.subarray(headerEnd + 4);
      const contentDisposition = header
        .split("\r\n")
        .find((header) => header.startsWith("Content-Disposition"));
      const match = /filename="(.+?)"/.exec(contentDisposition as string);

      if (match) {
        const filename = match[1];
        const contentBuffer = content.subarray(0, content.lastIndexOf("\r\n"));
        const filePath = this.saveFile(filename, contentBuffer);
        files[filename] = filePath;
      } else {
        const nameMatch = /name="(.+?)"/.exec(contentDisposition as string);
        if (nameMatch) {
          const name = nameMatch[1];
          fields[name] = content.toString().trim();
        }
      }
    });

    return { files, fields };
  };

  private getBoundary = (contentType: string): string | null => {
    const boundaryMatch = contentType.match(/boundary=(.*)/);
    return boundaryMatch ? boundaryMatch[1] : null;
  };

  public handleJsonUpload = (
    body: string
  ): {
    status: number;
    message?: string;
    fileDetails?: {
      path: string;
      keys: string[];
      types: { [key: string]: string };
      name: string;
      lastModified: Date;
      created: Date;
      size: {
        bytes: number;
        sizeInMB: number;
        sizeInGB: number;
      };
      mimeType: string;
    };
    error?: string;
  } => {
    try {
      const jsonBody = this.parseJsonBody(body);
      const content = Buffer.from(body, "utf-8");

      const fileName = `upload-${Date.now()}.json`;
      const filePath = this.saveFile(fileName, content);

      const mimeType = this.getMimeType(filePath);

      const fileDetails = {
        path: filePath,
        keys: Object.keys(jsonBody),
        types: this.getTypes(jsonBody),
        ...this.getFileDetails(`${FileService.uploadDir}/${fileName}`),
        mimeType,
      };

      return {
        status: 201,
        message: "File uploaded successfully",
        fileDetails,
      };
    } catch (error: any) {
      return { status: 400, error: error.message };
    }
  };

  public handleImageUpload = (
    imageData: Buffer,
    contentType: string
  ): {
    status: number;
    message?: string;
    path?: string;
    error?: string;
    fileDetails?: {
      name: string;
      lastModified: Date;
      created: Date;
      size: {
        bytes: number;
        sizeInMB: number;
        sizeInGB: number;
      };
      mimeType: string;
    };
  } => {
    const ext = contentType.split("/")[1];
    const fileName = `image_${Date.now()}.${ext}`;
    const filePath = this.saveFile(fileName, imageData);

    const fileDetails = this.getFileDetails(
      `${FileService.uploadDir}/${fileName}`
    );

    const mimeType = this.getMimeType(filePath);

    this.saveFile(fileName, imageData);

    return {
      status: 201,
      message: "File uploaded successfully",
      path: filePath,
      fileDetails: {
        ...fileDetails,
        mimeType,
      },
    };
  };

  public handleMultipartUpload = (
    headers: IncomingHttpHeaders,
    body: Buffer
  ): {
    status: number;
    files?: { [key: string]: string };
    fields?: { [key: string]: string };
    error?: string;
    fileDetails?: {
      name: string;
      lastModified: Date;
      created: Date;
      size: {
        bytes: number;
        sizeInMB: number;
        sizeInGB: number;
      };
      mimeType: string;
    };
  } => {
    try {
      const { files, fields } = this.parseMultipartFormData(headers, body);

      const fileDetails = this.getFileDetails(
        `${FileService.uploadDir}/${Object.keys(files)[0]}`
      );

      const mimeType = this.getMimeType(
        `${FileService.uploadDir}/${Object.keys(files)[0]}`
      );

      return {
        status: 201,
        files,
        fields,
        fileDetails: { ...fileDetails, mimeType },
      };
    } catch (error: any) {
      return { status: 400, error: error.message };
    }
  };

  public handleList = () => {
    return readdirSync(FileService.uploadDir);
  };

  public handleGet = (filename: string) => {
    const filepath = join(FileService.uploadDir, filename);
    if (existsSync(filepath)) {
      const fileDetails = this.getFileDetails(filepath);
      const mimeType = this.getMimeType(filepath);

      return {
        status: 200,
        fileDetails: {
          ...fileDetails,
          mimeType,
        },
      };
    } else {
      return { status: 404, message: "File not found" };
    }
  };

  private getMimeType = (filePath: string): string => {
    const ext = extname(filePath).toLowerCase();

    switch (ext) {
      case ".html":
        return "text/html";
      case ".css":
        return "text/css";
      case ".js":
        return "application/javascript";
      case ".json":
        return "application/json";
      case ".png":
        return "image/png";
      case ".jpg":
        return "image/jpeg";
      case ".jpeg":
        return "image/jpeg";
      case ".gif":
        return "image/gif";
      case ".svg":
        return "image/svg+xml";
      case ".txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  };

  public handleDelete = (filename: string) => {
    const filepath = join(FileService.uploadDir, filename);
    if (existsSync(filepath)) {
      unlinkSync(filepath);
      return { status: 200, message: "File deleted successfully" };
    } else {
      return { status: 404, message: "File not found" };
    }
  };
}

export default FileService;
