import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const dbPath = path.join(process.cwd(), "data", "db.json");

function readDb(): Record<string, any[]> {
  try {
    if (!fs.existsSync(dbPath)) return {};
    return JSON.parse(fs.readFileSync(dbPath, "utf8") || "{}");
  } catch {
    return {};
  }
}

function writeSetting(key: string, value: string): void {
  try {
    const db = readDb();
    if (!Array.isArray(db.settings)) db.settings = [];
    const idx = db.settings.findIndex((s: any) => s.key === key);
    if (idx >= 0) {
      db.settings[idx] = { ...db.settings[idx], value, updated_at: new Date().toISOString() };
    } else {
      db.settings.push({ key, value, updated_at: new Date().toISOString() });
    }
    const tmp = `${dbPath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
    fs.renameSync(tmp, dbPath);
  } catch (err) {
    console.warn("Failed saving setting:", err);
  }
}

function getStoredSetting(key: string): string {
  const db = readDb();
  const found = (db.settings || []).find((s: any) => s.key === key);
  return found?.value ? String(found.value) : "";
}

function resolveApiKey(bodyKey?: string): { key: string; source: "request" | "db" | "env" | "none" } {
  if (bodyKey && bodyKey.trim()) {
    return { key: bodyKey.trim(), source: "request" };
  }
  const dbKey = getStoredSetting("gemini_api_key");
  if (dbKey && dbKey.trim()) {
    return { key: dbKey.trim(), source: "db" };
  }
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  if (envKey.trim()) {
    return { key: envKey.trim(), source: "env" };
  }
  return { key: "", source: "none" };
}

export interface AiNarrativeItemInput {
  key: string;
  category: string;
  title: string;
  target: string;
  reverse?: boolean;
  isMet: boolean | null;
  hasData: boolean;
  currAvg: string;
  prevAvg?: string;
  monthlySummary: string;
  numeratorTotal?: number;
  denominatorTotal?: number;
  units?: string[];
  extraContext?: string;
}

export interface AiNarrativeResult {
  analisa: string;
  rekomendasi: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { periodKey } = req.query;
    const resolved = resolveApiKey();
    let cachedNarratives: Record<string, AiNarrativeResult> = {};
    if (typeof periodKey === "string" && periodKey) {
      const raw = getStoredSetting(`laporan_ai_cache_${periodKey}`);
      if (raw) {
        try {
          cachedNarratives = JSON.parse(raw);
        } catch {
          cachedNarratives = {};
        }
      }
    }
    return res.status(200).json({
      configured: resolved.source !== "none",
      source: resolved.source,
      model: "gemini-3.8-flash",
      cachedNarratives,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, apiKey, periodKey, periodLabel, items, saveNarratives } = req.body || {};

  if (action === "save_key") {
    writeSetting("gemini_api_key", String(apiKey || "").trim());
    const resolved = resolveApiKey();
    return res.status(200).json({
      success: true,
      configured: resolved.source !== "none",
      source: resolved.source,
    });
  }

  if (action === "save_cache" && periodKey && saveNarratives) {
    writeSetting(`laporan_ai_cache_${periodKey}`, JSON.stringify(saveNarratives));
    return res.status(200).json({ success: true });
  }

  if (action === "generate") {
    if (apiKey && String(apiKey).trim()) {
      writeSetting("gemini_api_key", String(apiKey).trim());
    }
    const resolved = resolveApiKey(apiKey);
    if (!resolved.key) {
      return res.status(400).json({
        error:
          "API Key Gemini belum dikonfigurasi. Silakan masukkan API Key Google AI Studio pada tombol 'Pengaturan AI' atau variabel GEMINI_API_KEY di .env.local.",
        missingKey: true,
      });
    }

    const batchItems: AiNarrativeItemInput[] = Array.isArray(items) ? items : [];
    if (batchItems.length === 0) {
      return res.status(400).json({ error: "Tidak ada item indikator untuk dianalisis." });
    }

    const systemPrompt = `Anda adalah Ketua Komite Peningkatan Mutu dan Keselamatan Pasien (PMKP) Rumah Sakit di UOBK RSUD Al-Mulk Kota Sukabumi yang menyusun Laporan Resmi Triwulan/Berkala kepada Direktur dan Dinas Kesehatan.

Acuan standar wajib dalam gaya bahasa dan substansi:
1. Permenkes RI Nomor 80 Tahun 2020 tentang Komite Mutu Rumah Sakit.
2. Permenkes RI Nomor 30 Tahun 2022 tentang Indikator Nasional Mutu (INM).
3. Permenkes RI Nomor 11 Tahun 2017 tentang Keselamatan Pasien.
4. Kepmenkes RI Nomor 129/Menkes/SK/II/2008 tentang Standar Pelayanan Minimal (SPM) Rumah Sakit.
5. Standar Akreditasi Rumah Sakit Kementerian Kesehatan (STARKES) dan pendekatan siklus PDSA (Plan-Do-Study-Act) / Continuous Quality Improvement.

Tugas Anda:
Untuk setiap item indikator/bagian pada daftar input (periode: ${periodLabel || "Periode Berjalan"}), susun:
- "analisa": 1 paragraf formal bahasa Indonesia (3–5 kalimat) yang menjelaskan makna klinis/manajerial indikator terhadap mutu & keselamatan pasien, menyebutkan angka capaian rata-rata dan tren bulanan secara akurat sesuai data input (jangan mengarang angka di luar data input; jika belum ada data input pada periode ini, nyatakan secara objektif bahwa pencatatan/pelaporan unit pada periode tersebut masih nihil/belum terinput di sistem OPTIMUS dan perlu supervisi pengumpulan data), membandingkan terhadap standar/target, serta mengidentifikasi faktor pendukung (bila tercapai) atau akar masalah Man/Method/Machine/Material (bila belum tercapai).
- "rekomendasi": array berisi 3 hingga 5 butir kalimat rekomendasi/rencana tindak lanjut yang operasional, spesifik terhadap unit kerja/PPA/komite terkait di RSUD Al-Mulk, sesuai SPO dan siklus PDSA.

Kembalikan HANYA objek JSON valid dengan format:
{
  "<key_item>": {
    "analisa": "...",
    "rekomendasi": ["...", "...", "..."]
  }
}`;

    const userPrompt = JSON.stringify(
      {
        instansi: "UOBK RSUD Al-Mulk Kota Sukabumi",
        periode: periodLabel,
        daftar_indikator: batchItems,
      },
      null,
      2,
    );

    try {
      const ai = new GoogleGenAI({ apiKey: resolved.key });
      const candidateModels = ["gemini-3.8-flash", "gemini-2.5-flash"];
      let rawText = "";
      let usedModel = candidateModels[0];
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        try {
          usedModel = modelName;
          const response = await ai.models.generateContent({
            model: modelName,
            contents: `${systemPrompt}\n\nDATA INPUT INDIKATOR:\n${userPrompt}`,
            config: {
              responseMimeType: "application/json",
              temperature: 0.25,
            },
          });
          rawText = response.text || "";
          if (rawText) break;
        } catch (mErr: any) {
          lastErr = mErr;
          const msg = String(mErr?.message || "");
          if (msg.includes("API key") || msg.includes("401") || msg.includes("403")) {
            throw mErr;
          }
        }
      }

      if (!rawText) {
        throw lastErr || new Error("Respons kosong dari model Gemini.");
      }

      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const parsed: Record<string, AiNarrativeResult> = JSON.parse(cleaned);

      if (periodKey) {
        const prevRaw = getStoredSetting(`laporan_ai_cache_${periodKey}`);
        let prevCache: Record<string, AiNarrativeResult> = {};
        if (prevRaw) {
          try {
            prevCache = JSON.parse(prevRaw);
          } catch {
            prevCache = {};
          }
        }
        const merged = { ...prevCache, ...parsed };
        writeSetting(`laporan_ai_cache_${periodKey}`, JSON.stringify(merged));
      }

      return res.status(200).json({
        success: true,
        model: usedModel,
        narratives: parsed,
      });
    } catch (err: any) {
      console.error("AI Laporan generation error:", err);
      return res.status(500).json({
        error: `Gagal menghasilkan analisis AI: ${err?.message || "Unknown error"}`,
      });
    }
  }

  return res.status(400).json({ error: "Action tidak dikenali." });
}
