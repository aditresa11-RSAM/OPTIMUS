import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  try {
    const { base64Data, fileName, mimeType, bucket } = req.body || {};

    if (!base64Data) {
      return res.status(400).json({ error: "Data file (base64) diperlukan" });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Extract extension or clean file name
    const ext = fileName ? path.extname(fileName) : ".png";
    const baseName = fileName ? path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_") : "upload";
    const uniqueName = `${baseName}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const targetPath = path.join(uploadsDir, uniqueName);

    // Strip data prefix if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: uniqueName,
      fullUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message || "Gagal mengunggah file" });
  }
}
