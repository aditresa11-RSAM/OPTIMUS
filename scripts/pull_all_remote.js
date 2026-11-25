const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PROJECTS = [
  {
    ref: 'qkawsfzwmvemqnigzujb',
    url: 'https://qkawsfzwmvemqnigzujb.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXdzZnp3bXZlbXFuaWd6dWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDY2MjgsImV4cCI6MjA5MDM4MjYyOH0.7LYHwo610o7pok1CvIri_0ghkU2FKgIe2nK8BWRqNmY'
  },
  {
    ref: 'ubggxzjptfhtswrlgfov',
    url: 'https://ubggxzjptfhtswrlgfov.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZ2d4empwdGZodHN3cmxnZm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMDEwMzcsImV4cCI6MjEwNTU3NzAzN30.MxZmAmD6YGRBnCYZW_90ZluGfDKndeXN9b-iyAWuNCg'
  },
  {
    ref: 'xiazllrhqxgoewtbxqvv',
    url: 'https://xiazllrhqxgoewtbxqvv.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpYXpsbHJocXhnb2V3dGJ4cXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTg3MjEsImV4cCI6MjA5OTE3NDcyMX0.HBfGfOgHejWPVXtZqPIHTCCCMrwpHzA9PsJ-A_5XfIA'
  },
  {
    ref: 'fkycaekjwdcbfyengmco',
    url: 'https://fkycaekjwdcbfyengmco.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZreWNhZWtqd2RjYmZ5ZW5nbWNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MTA2NjksImV4cCI6MjA5MTk4NjY2OX0.WIhgqt4XhidUZFOT31P7Jiwlf6P40ubpBczJL_usLC8'
  }
];

function fetchJson(urlStr, headers = {}) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.request(u, { method: 'GET', headers }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch(e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      });
      req.on('error', (err) => resolve({ error: err.message }));
      req.setTimeout(8000, () => { req.destroy(); resolve({ error: 'timeout' }); });
      req.end();
    } catch(e) {
      resolve({ error: e.message });
    }
  });
}

function postJson(urlStr, payload, headers = {}) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const postData = JSON.stringify(payload);
      const req = https.request(u, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch(e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      });
      req.on('error', (err) => resolve({ error: err.message }));
      req.setTimeout(8000, () => { req.destroy(); resolve({ error: 'timeout' }); });
      req.write(postData);
      req.end();
    } catch(e) {
      resolve({ error: e.message });
    }
  });
}

function downloadBinary(fileUrl, destPath) {
  return new Promise((resolve) => {
    try {
      const u = new URL(fileUrl);
      const proto = u.protocol === 'https:' ? https : http;
      const req = proto.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadBinary(res.headers.location, destPath).then(resolve);
        }
        if (res.statusCode !== 200) {
          return resolve(false);
        }
        const fileStream = fs.createWriteStream(destPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => resolve(true));
        });
      });
      req.on('error', () => resolve(false));
      req.setTimeout(15000, () => { req.destroy(); resolve(false); });
    } catch(e) {
      resolve(false);
    }
  });
}

const POSSIBLE_TABLES = [
  'master_indikator',
  'indicator_inputs',
  'units',
  'survei_budaya',
  'manajemen_risiko',
  'welcome_settings',
  'settings',
  'indikator_master',
  'data_indikator',
  'visite_dpjp',
  'ikp_laporan',
  'laporan_ikp',
  'insiden_keselamatan_pasien',
  'users',
  'profiles'
];

const POSSIBLE_BUCKETS = [
  'logos',
  'backgrounds',
  'public',
  'ikp',
  'media',
  'videos',
  'images',
  'uploads',
  'files',
  'documents'
];

async function main() {
  console.log('=== STARTING DEEP SUPABASE AUDIT & EXTRACTION ===');
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const dbPath = path.join(__dirname, '..', 'data', 'db.json');
  let currentDb = {};
  if (fs.existsSync(dbPath)) {
    try {
      currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch(e) {}
  }

  const collectedData = {};
  const downloadedFiles = [];

  for (const proj of PROJECTS) {
    console.log(`\n--- Inspecting Project: ${proj.ref} (${proj.url}) ---`);
    const headers = {
      'apikey': proj.key,
      'Authorization': `Bearer ${proj.key}`
    };

    // 1. Check Tables
    for (const table of POSSIBLE_TABLES) {
      const res = await fetchJson(`${proj.url}/rest/v1/${table}?select=*`, headers);
      if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
        console.log(`  [MATCH] Table '${table}' has ${res.data.length} records!`);
        if (!collectedData[table]) collectedData[table] = [];
        
        // Merge records by id or JSON representation
        for (const item of res.data) {
          const exists = collectedData[table].some(existing => {
            if (item.id && existing.id) return String(item.id) === String(existing.id);
            return JSON.stringify(item) === JSON.stringify(existing);
          });
          if (!exists) {
            collectedData[table].push(item);
          }
        }
      }
    }

    // 2. Check Storage Buckets via REST
    for (const bucket of POSSIBLE_BUCKETS) {
      // Try listing bucket files via /storage/v1/object/list/:bucket
      const listRes = await postJson(`${proj.url}/storage/v1/object/list/${bucket}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
        prefix: ''
      }, headers);

      if (listRes.status === 200 && Array.isArray(listRes.data) && listRes.data.length > 0) {
        console.log(`  [BUCKET FOUND] '${bucket}' contains ${listRes.data.length} files:`);
        for (const f of listRes.data) {
          if (!f.name || f.id === null) continue; // skip folders
          const publicUrl = `${proj.url}/storage/v1/object/public/${bucket}/${f.name}`;
          console.log(`    File: ${f.name} (${f.metadata?.size || 'unknown'} bytes)`);
          const dest = path.join(uploadDir, f.name);
          const ok = await downloadBinary(publicUrl, dest);
          if (ok) {
            console.log(`    -> Successfully downloaded to public/uploads/${f.name}`);
            downloadedFiles.push({ bucket, name: f.name, publicUrl, localPath: `/uploads/${f.name}` });
          } else {
            console.log(`    -> Failed to download from ${publicUrl}`);
          }
        }
      }
    }
  }

  console.log('\n=== SCANNING TABLE DATA FOR ANY MEDIA / S3 / SUPABASE URLS ===');
  // Check any URLs inside collected data (e.g. welcome_settings, indicator_inputs, etc.)
  for (const [table, rows] of Object.entries(collectedData)) {
    for (const row of rows) {
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))) {
          try {
            const u = new URL(v);
            const filename = path.basename(u.pathname);
            if (filename && filename.includes('.')) {
              const dest = path.join(uploadDir, filename);
              console.log(`  Found media link in ${table}.${k}: ${v}`);
              if (!fs.existsSync(dest)) {
                console.log(`  Downloading remote media: ${v} -> ${filename}`);
                const ok = await downloadBinary(v, dest);
                if (ok) {
                  console.log(`  -> Downloaded ${filename}`);
                  downloadedFiles.push({ table, field: k, name: filename, originalUrl: v, localPath: `/uploads/${filename}` });
                }
              }
              // Replace URL with local /uploads/ URL
              row[k] = `/uploads/${filename}`;
            }
          } catch(e) {}
        }
      }
    }
  }

  console.log('\n=== MERGING COLLECTED REMOTE DATA INTO LOCAL DB ===');
  for (const [table, rows] of Object.entries(collectedData)) {
    if (!currentDb[table]) {
      currentDb[table] = [];
    }
    let addedCount = 0;
    let updatedCount = 0;

    for (const r of rows) {
      const idx = currentDb[table].findIndex(existing => {
        if (r.id && existing.id) return String(r.id) === String(existing.id);
        return false;
      });

      if (idx >= 0) {
        currentDb[table][idx] = { ...currentDb[table][idx], ...r };
        updatedCount++;
      } else {
        currentDb[table].push(r);
        addedCount++;
      }
    }
    console.log(`Table '${table}': ${rows.length} remote rows processed (${addedCount} added, ${updatedCount} updated, total local: ${currentDb[table].length})`);
  }

  // Save merged DB
  fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');
  console.log(`\nSaved updated database to ${dbPath}`);

  // Summary report
  console.log('\n=== MIGRATION AUDIT SUMMARY ===');
  for (const [table, rows] of Object.entries(currentDb)) {
    console.log(`- ${table}: ${rows.length} records`);
  }
  console.log(`Downloaded files: ${downloadedFiles.length}`);
  for (const f of downloadedFiles) {
    console.log(`  - ${f.name} -> ${f.localPath}`);
  }
}

main().catch(console.error);
