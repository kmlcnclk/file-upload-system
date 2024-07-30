import { IncomingMessage, ServerResponse } from "http";
import { UrlWithParsedQuery, parse } from "url";

class FileMiddleware {
  constructor() {}

  public parsedUrlQuery = (
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
  ) => {
    const parsedUrl: UrlWithParsedQuery = parse(req.url || "", true);
    const { query } = parsedUrl;

    // @ts-ignore
    req.query = query;
    return next(req, res);
  };
}

export default FileMiddleware;
