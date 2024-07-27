import request from "supertest";

import {
  IncomingMessage,
  ServerResponse,
  createServer as createHttpServer,
} from "http";
import MainRoute from "../src/routes";
import Response from "../src/utils/response";
import LoggerMiddleware from "../src/middlewares/logger.middleware";

describe("File API", () => {
  beforeAll(() => {
    const mainRoute = new MainRoute();

    const httpPort = 8080;

    createHttpServer((req: IncomingMessage, res: ServerResponse) => {
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
    })
      .on("request", LoggerMiddleware.info)
      .listen(httpPort, () => {
        console.log(`HTTP server listening on port ${httpPort}`);
      });
  });

  describe("GET /file/list", () => {
    it("Saved files should be listed", async () => {
      const response = await request("http://localhost:8080").get("/file/list");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("files");
    });
  });

  describe("GET /file/get", () => {
    it("Saved files should be listed", async () => {
      const response = await request("http://localhost:8080")
        .get("/file/get")
        .query({
          filename: "upload-1722069652170.json",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("fileDetails");
      expect(response.body.fileDetails).toHaveProperty("name");
      expect(response.body.fileDetails.name).toEqual(
        "upload-1722069652170.json"
      );
    });
  });

  describe("POST /file/upload", () => {
    it("Uploaded file should be saved", async () => {
      const response = await request("http://localhost:8080")
        .post("/file/upload")
        .set("Content-Type", "application/json")
        .send({
          tokens: ["usdt", "eth"],
          amount: "0.000001",
          network: "bsc",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toEqual("File uploaded successfully");
    });
  });

  describe("DELETE /file/delete", () => {
    it("Saved files should be listed", async () => {
      const response = await request("http://localhost:8080")
        .delete("/file/delete")
        .query({
          filename: "upload-1722069652170.json",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toEqual("File deleted successfully");
    });
  });
});
