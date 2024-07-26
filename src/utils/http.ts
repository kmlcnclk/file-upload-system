import { IncomingMessage, ServerResponse } from "http";

export function redirectToHttps(
  req: IncomingMessage,
  res: ServerResponse,
  httpsPort: number
) {
  const host = req.headers["host"]?.split(":")[0];
  res.writeHead(307, {
    Location: `https://${host}:${httpsPort}${req.url}`,
  });
  res.end();
}
