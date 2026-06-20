import express from "express";

const app = express();

app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working" });
});

// tRPC endpoint - will add after testing
app.post("/api/trpc/auth.loginLocal", async (req, res) => {
  try {
    const { json } = req.body;
    const { email, nickname } = json;
    
    console.log("[API] Login attempt:", { email, nickname });
    
    // For now, just return success
    res.json([{ result: { data: { success: true, message: "Test response" } } }]);
  } catch (error) {
    console.error("[API] Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
