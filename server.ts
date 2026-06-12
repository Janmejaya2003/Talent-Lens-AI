import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

// Local Persistence Fallback (SQLite)
const db = new Database("persistence.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    email TEXT NOT NULL,
    score INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jds (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    analysis_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS support_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    page_url TEXT NOT NULL,
    feedback_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS share_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    page_url TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Supabase Configuration
// Note: Standard Supabase URLs end in .co. If you have a custom domain, use it.
const DEFAULT_SUPABASE_URL = 'https://whvuijppslqmhmjcsata.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndodnVpanBwc2xxbWhtamNzYXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NDkzNjAsImV4cCI6MjA5MjUyNTM2MH0.q2MhMOFeJrY2DS9SlTlAvWhcgDEFR5HoxJPJb1qF7I0';

const getValidBackendConfig = () => {
  const envUrl = process.env.SUPABASE_URL;
  const envKey = process.env.SUPABASE_ANON_KEY;

  const isValidUrl = (url: string | undefined): url is string => 
    !!url && url.startsWith('http');

  const url = isValidUrl(envUrl) ? envUrl : DEFAULT_SUPABASE_URL;
  const key = (envKey && envKey.length > 20) ? envKey : DEFAULT_SUPABASE_KEY;

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getValidBackendConfig();

if (!supabaseAnonKey.startsWith('ey')) {
  console.warn('Backend Warning: The Supabase Anon Key provided does not look like a standard JWT (should start with "eyJ"). This may cause authentication errors.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/evaluations", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map((row: any) => ({
        id: row.id,
        candidateName: row.candidate_name,
        email: row.email,
        score: row.score,
        evaluation: row.data_json,
        timestamp: row.created_at
      }));
      res.json(formatted);
    } catch (error: any) {
      const isMissingTable = error.message?.includes("relation") && error.message?.includes("does not exist") || 
                             error.message?.includes("schema cache") && error.message?.includes("find the table");

      if (isMissingTable) {
        console.warn("Supabase Table Missing - Falling back to local SQLite storage.");
        try {
          const rows = db.prepare("SELECT * FROM evaluations ORDER BY created_at DESC").all();
          const formatted = rows.map((row: any) => ({
            id: row.id,
            candidateName: row.candidate_name,
            email: row.email,
            score: row.score,
            evaluation: JSON.parse(row.data_json),
            timestamp: row.created_at,
            isLocal: true
          }));
          return res.json(formatted);
        } catch (sqliteError) {
          console.error("SQLite Fallback Error:", sqliteError);
        }
      }

      res.status(500).json({ 
        error: isMissingTable ? "Database Setup Required" : "Failed to fetch evaluations",
        details: isMissingTable 
          ? "The 'evaluations' table is missing in Supabase. We are currently using local storage fallback. Visit the setup guide in the UI to cloud-sync." 
          : (error.message || "Unknown Supabase error"),
        isSetupNeeded: isMissingTable
      });
    }
  });

  app.post("/api/evaluations", async (req, res) => {
    const { id, candidateName, email, score, evaluation } = req.body;
    
    try {
      const { error } = await supabase
        .from('evaluations')
        .insert([{
          id,
          candidate_name: candidateName,
          email,
          score,
          data_json: evaluation
        }]);

      if (error) throw error;
      res.json({ success: true, persistence: 'supabase' });
    } catch (error: any) {
      const isMissingTable = error.message?.includes("relation") && error.message?.includes("does not exist") || 
                             error.message?.includes("schema cache") && error.message?.includes("find the table");

      if (isMissingTable) {
        console.warn("Supabase Target Missing - Persisting to local SQLite.");
        try {
          db.prepare("INSERT OR REPLACE INTO evaluations (id, candidate_name, email, score, data_json) VALUES (?, ?, ?, ?, ?)")
            .run(id, candidateName, email, score, JSON.stringify(evaluation));
          return res.json({ success: true, persistence: 'sqlite', warning: 'Using local storage' });
        } catch (sqliteError) {
          console.error("SQLite Persistence Error:", sqliteError);
        }
      }

      res.status(500).json({ 
        error: "Failed to persist evaluation",
        details: error.message || "Unknown error"
      });
    }
  });

  app.delete("/api/evaluations", async (req, res) => {
    try {
      // Attempt Supabase delete first
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .neq('id', '0'); // Delete all

      if (error) throw error;
      res.json({ success: true, persistence: 'supabase' });
    } catch (error: any) {
      const isMissingTable = error.message?.includes("relation") && error.message?.includes("does not exist") || 
                             error.message?.includes("schema cache") && error.message?.includes("find the table");

      if (isMissingTable) {
        console.warn("Supabase Target Missing - Deleting from local SQLite.");
        try {
          db.prepare("DELETE FROM evaluations").run();
          return res.json({ success: true, persistence: 'sqlite' });
        } catch (sqliteError) {
          console.error("SQLite Delete Error:", sqliteError);
        }
      }

      res.status(500).json({ 
        error: "Failed to clear evaluations",
        details: error.message || "Unknown error"
      });
    }
  });

  app.delete("/api/evaluations/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true, persistence: 'supabase' });
    } catch (error: any) {
      const isMissingTable = error.message?.includes("relation") && error.message?.includes("does not exist") || 
                             error.message?.includes("schema cache") && error.message?.includes("find the table");

      if (isMissingTable) {
        try {
          db.prepare("DELETE FROM evaluations WHERE id = ?").run(id);
          return res.json({ success: true, persistence: 'sqlite' });
        } catch (sqliteError) {
          console.error("SQLite Individual Delete Error:", sqliteError);
        }
      }
      res.status(500).json({ 
        error: "Failed to delete evaluation",
        details: error.message || "Unknown error"
      });
    }
  });

  // JD Routes
  app.get("/api/jds", async (req, res) => {
    try {
      const { data, error } = await supabase.from('jds').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      // Fallback to SQLite
      try {
        const rows = db.prepare("SELECT * FROM jds ORDER BY created_at DESC").all();
        const formatted = rows.map((row: any) => ({
          ...row,
          analysis_json: JSON.parse(row.analysis_json)
        }));
        res.json(formatted);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch JDs" });
      }
    }
  });

  app.post("/api/jds", async (req, res) => {
    const { id, title, content, analysis_json, user_id } = req.body;
    try {
      const { error } = await supabase.from('jds').insert([{ id, title, content, analysis_json, user_id }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      try {
        db.prepare("INSERT OR REPLACE INTO jds (id, title, content, analysis_json, user_id) VALUES (?, ?, ?, ?, ?)")
          .run(id, title, content, JSON.stringify(analysis_json), user_id);
        res.json({ success: true, persistence: 'sqlite' });
      } catch (err) {
        res.status(500).json({ error: "Failed to save JD" });
      }
    }
  });

  app.delete("/api/jds/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('jds').delete().eq('id', id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      try {
        db.prepare("DELETE FROM jds WHERE id = ?").run(id);
        res.json({ success: true, persistence: 'sqlite' });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete JD" });
      }
    }
  });

  app.post("/api/support", async (req, res) => {
    const { id, name, email, message } = req.body;
    try {
      const { error } = await supabase.from('support_requests').insert([{ id, name, email, message }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      try {
        db.prepare("INSERT INTO support_requests (id, name, email, message) VALUES (?, ?, ?, ?)")
          .run(id, name, email, message);
        res.json({ success: true, persistence: 'sqlite' });
      } catch (err) {
        res.status(500).json({ error: "Failed to save support request" });
      }
    }
  });

  app.post("/api/feedback", async (req, res) => {
    const { id, user_id, page_url, feedback_type } = req.body;
    try {
      const { error } = await supabase.from('feedback').insert([{ id, user_id, page_url, feedback_type }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      try {
        db.prepare("INSERT INTO feedback (id, user_id, page_url, feedback_type) VALUES (?, ?, ?, ?)")
          .run(id, user_id, page_url, feedback_type);
        res.json({ success: true, persistence: 'sqlite' });
      } catch (err) {
        res.status(500).json({ error: "Failed to save feedback" });
      }
    }
  });

  app.post("/api/share-event", async (req, res) => {
    const { id, user_id, page_url, platform } = req.body;
    try {
      const { error } = await supabase.from('share_events').insert([{ id, user_id, page_url, platform }]);
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      try {
        db.prepare("INSERT INTO share_events (id, user_id, page_url, platform) VALUES (?, ?, ?, ?)")
          .run(id, user_id, page_url, platform);
        res.json({ success: true, persistence: 'sqlite' });
      } catch (err) {
        res.status(500).json({ error: "Failed to track share event" });
      }
    }
  });

  app.get("/api/analytics/docs", async (req, res) => {
    try {
      // For local fallback, we'll just use SQLite groups
      const feedback = db.prepare(`
        SELECT page_url, feedback_type, COUNT(*) as count 
        FROM feedback 
        GROUP BY page_url, feedback_type
      `).all();

      const shares = db.prepare(`
        SELECT page_url, platform, COUNT(*) as count 
        FROM share_events 
        GROUP BY page_url, platform
      `).all();

      res.json({ feedback, shares });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // OAuth Callback Route for AI Studio
  app.get("/auth/callback", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #64748b; }
            .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <p>Authentication successful!</p>
            <p style="font-size: 0.8rem;">This window will close automatically.</p>
          </div>
          <script>
            // Send the entire hash/query to the opener
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_SUCCESS',
                hash: window.location.hash,
                search: window.location.search
              }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TalentLens Server running on http://localhost:${PORT}`);
  });
}

startServer();
