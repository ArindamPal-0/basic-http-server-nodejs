import http from "http";
import fs from "fs/promises";

const HOSTNAME = "127.0.0.1";
const PORT = 3000;

const server = http.createServer(async function (req, res) {
  console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);

  // if invalid url
  res.statusCode = 404;

  if (req.method === "GET") {
    if (req.url === "/") {
      res.statusCode = 200;
    } else if (req.url.startsWith("/echo/")) {
      const found = req.url.match(/\/echo\/(?<param>.+)/);
      const param = found.groups["param"];
      console.log(`found param: ${param}`);

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(param);
    } else if (req.url === "/user-agent") {
      const userAgent = req.headers["user-agent"];

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(userAgent);
    } else if (req.url.startsWith("/files/")) {
      const found = req.url.match(/\/files\/(?<file>.+)/);
      const fileParam = found.groups["file"];
      console.log(`file param: ${fileParam}`);

      let stats = await fs.stat("files");
      if (stats.isDirectory()) {
        try {
          let fileContents = await fs.readFile(`files/${fileParam}`);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/octet-stream");
          res.end(fileContents);
        } catch (err) {
          res.statusCode = 404;
        }
      }
    }
  } else if (req.method === "POST") {
    if (req.url.startsWith("/files/")) {
      const found = req.url.match(/\/files\/(?<file>.+)/);
      const fileParam = found.groups["file"];
      console.log(`file param: ${fileParam}`);

      const contentsLength = parseInt(req.headers["content-length"], 10);

      const stats = await fs.stat("files");
      if (stats.isDirectory()) {
        if (req.readable) {
          req.setEncoding("utf-8");
          const contents = req.read();
          console.log(`contents: `, contents);

          try {
            await fs.writeFile(`files/${fileParam}`, contents, "utf-8");
            res.statusCode = 200;
            res.end();
          } catch (err) {
            res.statusCode = 404;
            res.end();
          }
        }
      }
    }
  }

  res.end();
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
