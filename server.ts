import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { app } from "./server/app";

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
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
    const express = (await import("express")).default;
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
