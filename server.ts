import "dotenv/config";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import axios from "axios";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Behind a platform proxy (Vercel, Fly, Render), the client IP arrives in
// X-Forwarded-For. Without this the rate limiter buckets every visitor together.
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      // Venue photography is hosted by the venues themselves, and the type ramp
      // is served by Google Fonts. Scripts stay locked to our own origin.
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"]
    }
  }
}));

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "eventive-co-zw"
  });
});

/* ── Quote inquiries ─────────────────────────────────────────────────────── */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const INQUIRY_FROM_EMAIL = process.env.INQUIRY_FROM_EMAIL;
const INQUIRY_TO_EMAIL = process.env.INQUIRY_TO_EMAIL || "events@eventive.co.zw";
const INQUIRY_WEBHOOK_URL = process.env.INQUIRY_WEBHOOK_URL;

const hasDelivery = Boolean((RESEND_API_KEY && INQUIRY_FROM_EMAIL) || INQUIRY_WEBHOOK_URL);

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Rejected submissions count too, so leave room for someone correcting a typo
  // a few times before we lock them out for a quarter of an hour.
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many inquiries from this address. Please try again shortly." }
});

interface Inquiry {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  eventDate: string;
  notes: string;
}

const asString = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Returns the cleaned inquiry, or a list of problems for the client to show. */
function parseInquiry(body: unknown): { inquiry: Inquiry } | { errors: string[] } {
  const raw = (body ?? {}) as Record<string, unknown>;
  const inquiry: Inquiry = {
    name: asString(raw.name, 120),
    email: asString(raw.email, 200),
    phone: asString(raw.phone, 60),
    occasion: asString(raw.occasion, 80),
    eventDate: asString(raw.eventDate, 40),
    notes: asString(raw.notes, 4000)
  };

  const errors: string[] = [];
  if (inquiry.name.length < 2) errors.push("Please tell us your name.");
  // Deliberately loose: the goal is to catch typos, not to police valid addresses.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    errors.push("Please enter an email address we can reply to.");
  }
  if (!inquiry.occasion) errors.push("Please choose an occasion.");

  return errors.length > 0 ? { errors } : { inquiry };
}

async function deliver(inquiry: Inquiry) {
  const lines = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone || "—"}`,
    `Occasion: ${inquiry.occasion}`,
    `Event date: ${inquiry.eventDate || "—"}`,
    "",
    `Notes: ${inquiry.notes || "—"}`
  ].join("\n");

  if (RESEND_API_KEY && INQUIRY_FROM_EMAIL) {
    await axios.post(
      "https://api.resend.com/emails",
      {
        from: INQUIRY_FROM_EMAIL,
        to: [INQUIRY_TO_EMAIL],
        reply_to: inquiry.email,
        subject: `Quote request — ${inquiry.occasion}`,
        text: lines
      },
      { headers: { Authorization: `Bearer ${RESEND_API_KEY}` }, timeout: 10000 }
    );
    return;
  }

  if (INQUIRY_WEBHOOK_URL) {
    await axios.post(
      INQUIRY_WEBHOOK_URL,
      { text: `New Eventive quote request\n\n${lines}`, inquiry },
      { timeout: 10000 }
    );
  }
}

app.post("/api/inquiry", inquiryLimiter, async (req: Request, res: Response) => {
  const parsed = parseInquiry(req.body);
  if ("errors" in parsed) {
    return res.status(400).json({ error: parsed.errors.join(" ") });
  }

  // No transport configured yet. Say so explicitly so the browser can fall back
  // to mailto rather than showing a success message for a lost inquiry.
  if (!hasDelivery) {
    return res.status(503).json({
      error: "Inquiry delivery is not configured on this server.",
      code: "delivery_not_configured"
    });
  }

  try {
    await deliver(parsed.inquiry);
    return res.status(202).json({ status: "received" });
  } catch (error) {
    console.error("Failed to deliver inquiry:", error instanceof Error ? error.message : error);
    return res.status(502).json({
      error: "We could not send that just now.",
      code: "delivery_failed"
    });
  }
});

/* ── Static site ─────────────────────────────────────────────────────────── */

const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("✅ Eventive.co.zw running on port " + PORT);
  if (!hasDelivery) {
    console.warn(
      "⚠️  No inquiry delivery configured — /api/inquiry will return 503 and the " +
      "site will fall back to mailto. Set RESEND_API_KEY + INQUIRY_FROM_EMAIL, " +
      "or INQUIRY_WEBHOOK_URL, to receive quote requests."
    );
  }
});
