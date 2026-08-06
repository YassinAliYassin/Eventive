import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { timesheetRouter } from "./server/timesheetRoutes";

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet({
  // Vite's dev server injects inline HMR scripts and opens a websocket, both of
  // which the production CSP would block — only lock it down for real deploys.
  contentSecurityPolicy: isProduction
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"]
        }
      }
    : false
}));

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "eventive-co-zw"
  });
});

app.use("/api/timesheet", timesheetRouter);

const distPath = path.join(process.cwd(), "dist");

async function start() {
  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log("✅ Eventive.co.zw running on port " + PORT);
  });
}

start();
