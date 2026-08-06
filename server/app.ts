import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { timesheetRouter } from "./timesheetRoutes";

const isProduction = process.env.NODE_ENV === "production";

export const app = express();

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
