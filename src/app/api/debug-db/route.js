import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);
    
    // Check if club.db exists in cwd
    const dbPath = path.resolve(cwd, 'club.db');
    const exists = fs.existsSync(dbPath);
    
    let dbDetails = {};
    if (exists) {
      const stats = fs.statSync(dbPath);
      dbDetails = {
        size: stats.size,
        exists: true,
      };
    } else {
      dbDetails = {
        exists: false,
      };
    }
    
    // Look for club.db recursively in parent or subdirectories
    let foundPath = null;
    const searchFile = (dir, depth = 0) => {
      if (depth > 3) return;
      try {
        const list = fs.readdirSync(dir);
        if (list.includes('club.db')) {
          foundPath = path.join(dir, 'club.db');
          return;
        }
        for (const item of list) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            searchFile(fullPath, depth + 1);
            if (foundPath) return;
          }
        }
      } catch (e) {}
    };
    searchFile(cwd);

    return NextResponse.json({
      cwd,
      files,
      dbPath,
      exists,
      dbDetails,
      foundPath,
      env: {
        VERCEL: process.env.VERCEL || null,
        NODE_ENV: process.env.NODE_ENV || null,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
