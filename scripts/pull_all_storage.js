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
      req.setTimeout(30000, () => { req.destroy(); resolve(false); });
    } catch(e) {
      resolve(false);
    }
  });
}

async function listRecursive(proj, bucket, prefix = '') {
  const headers = {
    'apikey': proj.key,
    'Authorization': `Bearer ${proj.key}`
  };
  const res = await postJson(`${proj.url}/storage/v1/object/list/${bucket}`, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
    prefix: prefix
  }, headers);

  let files = [];
  if (res.status === 200 && Array.isArray(res.data)) {
    for (const item of res.data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        // It's a directory!
        const subFiles = await listRecursive(proj, bucket, fullPath);
        files = files.concat(subFiles);
      } else {
        files.push({
          bucket,
          path: fullPath,
          name: item.name,
          size: item.metadata?.size
        });
      }
    }
  }
  return files;
}

const BUCKETS = [
  'logos',
  'backgrounds',
  'public',
  'ikp',
  'media',
  'videos',
  'images',
  'uploads',
  'files',
  'documents',
  'avatars'
];

async function main() {
  console.log('=== RECURSIVE STORAGE MEDIA SYNC ===');
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const allFiles = [];

  for (const proj of PROJECTS) {
    console.log(`\nScanning project: ${proj.ref}`);
    for (const bucket of BUCKETS) {
      try {
        const files = await listRecursive(proj, bucket, '');
        if (files.length > 0) {
          console.log(`  Bucket [${bucket}] found ${files.length} file(s):`);
          for (const f of files) {
            const publicUrl = `${proj.url}/storage/v1/object/public/${bucket}/${f.path}`;
            console.log(`    Downloading: ${f.path} (${f.size || 0} bytes)`);
            const localDest = path.join(uploadDir, path.basename(f.name));
            const ok = await downloadBinary(publicUrl, localDest);
            console.log(`    -> Status: ${ok ? 'SUCCESS' : 'FAILED'} (saved to ${path.basename(f.name)})`);
            allFiles.push({ project: proj.ref, bucket, path: f.path, name: f.name, success: ok, size: f.size });
          }
        }
      } catch(e) {
        console.error(`  Error scanning bucket ${bucket}:`, e.message);
      }
    }
  }

  console.log('\n=== DOWNLOAD SUMMARY ===');
  console.log(`Total files found across all storage buckets: ${allFiles.length}`);
  for (const f of allFiles) {
    console.log(`  [${f.project}] ${f.bucket}/${f.path} -> ${f.name} (${f.success ? 'OK' : 'FAIL'})`);
  }
}

main().catch(console.error);
