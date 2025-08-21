import express from "express";
import cron from "node-cron";
import next from "next";
import fetch from "node-fetch";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // ✅ Cron job: runs every 2 seconds for testing
  cron.schedule("0 0 * * 0", async () => {
    console.log("🔥 Cron running...");
    try {
      const res = await fetch("http://localhost:3000/api/superadmin/check-weekly-reports",{
        method:"POST"
      });
      console.log("✅ API Hit Status:", res.status);
    } catch (err) {
      console.error("❌ Error hitting API:", err.message);
    }
  });

  // ✅ Express handles Next.js pages
  server.use((req, res) => handle(req, res));

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("✅ Server ready on http://localhost:3000");
  });
});
