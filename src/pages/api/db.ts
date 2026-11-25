import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const dbPath = path.join(process.cwd(), "data", "db.json");
const backupsDir = path.join(process.cwd(), "data", "backups");

// Helper to ensure database file exists
function getDb(): Record<string, any[]> {
  try {
    if (!fs.existsSync(dbPath)) {
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2), "utf8");
    }
    const content = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(content || "{}");
  } catch (e) {
    console.error("Error reading db.json:", e);
    return {};
  }
}

function saveDb(data: Record<string, any[]>): void {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    // Write atomically
    const tempPath = `${dbPath}.tmp.${Date.now()}`;
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, jsonStr, "utf8");
    fs.renameSync(tempPath, dbPath);

    // AUTO-BACKUP REALTIME: Automatically mirrors to data/backups/
    try {
      if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
      // 1. Realtime latest mirror backup file (perfect for syncing with Google Drive / OneDrive)
      const realtimeBackupPath = path.join(backupsDir, "optimus_realtime_backup.json");
      fs.writeFileSync(realtimeBackupPath, jsonStr, "utf8");
      
      // 2. Daily dated backup file for history preservation
      const dateStr = new Date().toISOString().split("T")[0];
      const dailyBackupPath = path.join(backupsDir, `optimus_daily_backup_${dateStr}.json`);
      fs.writeFileSync(dailyBackupPath, jsonStr, "utf8");

      // 3. REALTIME GOOGLE DRIVE DIRECT SYNC (G:\My Drive)
      const gdriveTarget = path.join("G:", "My Drive", "BACKUP_OPTIMUS_RSUD_ALMULK");
      if (fs.existsSync(path.join("G:", "My Drive"))) {
        if (!fs.existsSync(gdriveTarget)) fs.mkdirSync(gdriveTarget, { recursive: true });
        fs.writeFileSync(path.join(gdriveTarget, "db_latest.json"), jsonStr, "utf8");
        fs.writeFileSync(path.join(gdriveTarget, `db_${dateStr}.json`), jsonStr, "utf8");
      }
    } catch (bErr) {
      console.warn("Auto-backup snapshot error:", bErr);
    }
  } catch (e) {
    console.error("Error saving db.json:", e);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow local CORS if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const db = getDb();

  // GET request: simple select or export
  if (req.method === "GET") {
    const { table, exportAll, getBackupStatus, syncGdriveNow } = req.query;

    const gdrivePath = path.join("G:", "My Drive", "BACKUP_OPTIMUS_RSUD_ALMULK");
    const gdriveAvailable = fs.existsSync(path.join("G:", "My Drive"));

    if (syncGdriveNow === "true") {
      try {
        if (!gdriveAvailable) {
          return res.status(404).json({ success: false, error: "Drive G:\\My Drive tidak terdeteksi." });
        }
        if (!fs.existsSync(gdrivePath)) fs.mkdirSync(gdrivePath, { recursive: true });
        const jsonStr = JSON.stringify(db, null, 2);
        fs.writeFileSync(path.join(gdrivePath, "db_latest.json"), jsonStr, "utf8");
        const dateStr = new Date().toISOString().split("T")[0];
        fs.writeFileSync(path.join(gdrivePath, `db_${dateStr}.json`), jsonStr, "utf8");
        return res.status(200).json({
          success: true,
          message: "Data berhasil disinkronkan ke Google Drive!",
          targetPath: gdrivePath,
          timestamp: new Date().toISOString()
        });
      } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    if (getBackupStatus === "true") {
      const stats = {
        lastModified: null as string | null,
        fileSizeKb: 0,
        realtimeBackupExists: false,
        totalTables: Object.keys(db).length,
        totalRecords: Object.values(db).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0),
        realtimeBackupPath: "data/backups/optimus_realtime_backup.json",
        gdriveMounted: gdriveAvailable,
        gdriveBackupPath: gdrivePath
      };
      if (fs.existsSync(dbPath)) {
        const s = fs.statSync(dbPath);
        stats.lastModified = s.mtime.toISOString();
        stats.fileSizeKb = Math.round(s.size / 1024);
      }
      const realtimeFile = path.join(backupsDir, "optimus_realtime_backup.json");
      stats.realtimeBackupExists = fs.existsSync(realtimeFile);
      return res.status(200).json(stats);
    }

    if (exportAll === "true") {
      return res.status(200).json(db);
    }

    if (!table || typeof table !== "string") {
      return res.status(400).json({ error: "Parameter 'table' diperlukan" });
    }

    const items = db[table] || [];
    return res.status(200).json({ data: items, count: items.length });
  }

  // POST request: handles select, insert, update, upsert, delete, migrate, restore
  if (req.method === "POST") {
    const { action, table, records, data: updateData, filters = [], order, limit, offset, payload } = req.body || {};

    // 1. Direct Full Database Restore
    if (action === "restore") {
      if (!payload || typeof payload !== "object") {
        return res.status(400).json({ error: "Payload restore tidak valid." });
      }

      try {
        // Save safety backup of current state
        const backupSnapshot = `${dbPath}.bak.${Date.now()}`;
        if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, backupSnapshot);
        }

        // Clean & ensure tables exist
        const restoredDb: Record<string, any[]> = {};
        for (const [key, val] of Object.entries(payload)) {
          if (Array.isArray(val)) {
            restoredDb[key] = val;
          }
        }

        saveDb(restoredDb);
        return res.status(200).json({
          success: true,
          message: "Database berhasil dipulihkan secara menyeluruh.",
          tablesRestored: Object.keys(restoredDb),
          snapshot: path.basename(backupSnapshot),
        });
      } catch (err: any) {
        return res.status(500).json({ error: "Gagal memulihkan database: " + err.message });
      }
    }

    if (action === "migrate_localStorage") {
      const payload = req.body.payload || {};
      let changed = false;

      // 1. Migrate manajemen_risiko
      if (Array.isArray(payload.manajemen_risiko) && payload.manajemen_risiko.length > 0) {
        db.manajemen_risiko = db.manajemen_risiko || [];
        for (const item of payload.manajemen_risiko) {
          const exists = db.manajemen_risiko.find((r: any) => r.id === item.id);
          if (!exists) {
            db.manajemen_risiko.push(item);
            changed = true;
          }
        }
      }

      // 2. Migrate survei_budaya
      if (Array.isArray(payload.survei_budaya) && payload.survei_budaya.length > 0) {
        db.survei_budaya = db.survei_budaya || [];
        for (const item of payload.survei_budaya) {
          const exists = db.survei_budaya.find((r: any) => r.id === item.id);
          if (!exists) {
            db.survei_budaya.push(item);
            changed = true;
          }
        }
      }

      // 3. Migrate supervisi_k3rs
      if (Array.isArray(payload.supervisi_k3rs) && payload.supervisi_k3rs.length > 0) {
        db.supervisi_k3rs = db.supervisi_k3rs || [];
        for (const item of payload.supervisi_k3rs) {
          const exists = db.supervisi_k3rs.find((r: any) => r.id === item.id);
          if (!exists) {
            db.supervisi_k3rs.push(item);
            changed = true;
          }
        }
      }

      // 4. Migrate hospital_logo
      if (payload.hospital_logo && typeof payload.hospital_logo === "string") {
        db.settings = db.settings || [];
        const logoSetting = db.settings.find((s: any) => s.key === "hospital_logo");
        if (logoSetting) {
          logoSetting.value = payload.hospital_logo;
        } else {
          db.settings.push({ key: "hospital_logo", value: payload.hospital_logo });
        }
        changed = true;
      }

      if (changed) {
        saveDb(db);
      }
      return res.status(200).json({ success: true, message: "Sinkronisasi data lokal selesai" });
    }

    if (!table || typeof table !== "string") {
      return res.status(400).json({ error: "Parameter 'table' diperlukan" });
    }

    if (!db[table]) {
      db[table] = [];
    }

    let tableData = db[table];

    // Helper filter function
    const applyFilters = (list: any[]) => {
      return list.filter((item) => {
        for (const f of filters) {
          const val = item[f.column];
          if (f.operator === "eq") {
            if (String(val) !== String(f.value)) return false;
          } else if (f.operator === "neq") {
            if (String(val) === String(f.value)) return false;
          } else if (f.operator === "ilike") {
            const pattern = String(f.value).replace(/%/g, "").toLowerCase();
            if (!String(val || "").toLowerCase().includes(pattern)) return false;
          } else if (f.operator === "in") {
            if (Array.isArray(f.value) && !f.value.includes(val)) return false;
          }
        }
        return true;
      });
    };

    switch (action) {
      case "select": {
        let results = applyFilters(tableData);

        if (order && order.column) {
          results.sort((a, b) => {
            const valA = a[order.column] ?? "";
            const valB = b[order.column] ?? "";
            if (order.ascending) {
              return valA > valB ? 1 : valA < valB ? -1 : 0;
            } else {
              return valA < valB ? 1 : valA > valB ? -1 : 0;
            }
          });
        }

        if (typeof offset === "number" && offset > 0) {
          results = results.slice(offset);
        }

        if (typeof limit === "number" && limit > 0) {
          results = results.slice(0, limit);
        }

        return res.status(200).json({ data: results, count: results.length, error: null });
      }

      case "insert": {
        const toInsert = Array.isArray(records) ? records : [records];
        const insertedList: any[] = [];

        for (const item of toInsert) {
          if (!item) continue;
          const newItem = {
            ...item,
            id: item.id || crypto.randomUUID(),
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          tableData.push(newItem);
          insertedList.push(newItem);
        }

        saveDb(db);
        return res.status(200).json({ data: insertedList, error: null });
      }

      case "update": {
        let updatedCount = 0;
        tableData = tableData.map((item) => {
          let match = true;
          for (const f of filters) {
            if (f.operator === "eq" && String(item[f.column]) !== String(f.value)) match = false;
            if (f.operator === "neq" && String(item[f.column]) === String(f.value)) match = false;
          }
          if (match) {
            updatedCount++;
            return {
              ...item,
              ...updateData,
              updated_at: new Date().toISOString(),
            };
          }
          return item;
        });

        db[table] = tableData;
        saveDb(db);
        return res.status(200).json({ data: updateData, updatedCount, error: null });
      }

      case "upsert": {
        const toUpsert = Array.isArray(records) ? records : [records];
        const upsertedList: any[] = [];

        for (const item of toUpsert) {
          if (!item) continue;
          const keyField = item.id !== undefined ? "id" : item.key !== undefined ? "key" : null;
          let existingIdx = -1;
          if (keyField) {
            existingIdx = tableData.findIndex((row: any) => String(row[keyField]) === String(item[keyField]));
          }

          if (existingIdx !== -1) {
            tableData[existingIdx] = {
              ...tableData[existingIdx],
              ...item,
              updated_at: new Date().toISOString(),
            };
            upsertedList.push(tableData[existingIdx]);
          } else {
            const newItem = {
              ...item,
              id: item.id || (keyField === "id" ? crypto.randomUUID() : undefined),
              created_at: item.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            tableData.push(newItem);
            upsertedList.push(newItem);
          }
        }

        db[table] = tableData;
        saveDb(db);
        return res.status(200).json({ data: upsertedList, error: null });
      }

      case "delete": {
        const beforeLen = tableData.length;
        tableData = tableData.filter((item) => {
          let match = true;
          for (const f of filters) {
            if (f.operator === "eq" && String(item[f.column]) !== String(f.value)) match = false;
            if (f.operator === "neq" && String(item[f.column]) === String(f.value)) match = false;
          }
          return !match;
        });

        const deletedCount = beforeLen - tableData.length;
        db[table] = tableData;
        saveDb(db);
        return res.status(200).json({ deletedCount, error: null });
      }

      default:
        return res.status(400).json({ error: `Aksi tidak dikenali: ${action}` });
    }
  }

  return res.status(405).json({ error: "Metode tidak diizinkan" });
}
