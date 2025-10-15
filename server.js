// Vercel-compatible server with in-memory storage
// This version works on Vercel by storing data in memory during the function lifetime
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for board items
let boardItemsCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 60000; // 1 minute cache

// Simple in-memory list of SSE clients
const sseClients = new Set();

// Helper function to broadcast SSE messages
const broadcastSSE = (message) => {
  for (const client of sseClients) {
    try {
      client.write("event: new-item\n");
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    } catch (_) {}
  }
};

// SSE endpoint
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (res.flushHeaders) res.flushHeaders();

  res.write("event: connected\n");
  res.write('data: "ok"\n\n');

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: ping\n`);
      res.write(`data: ${Date.now()}\n\n`);
    } catch (_) {}
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    try {
      res.end();
    } catch (_) {}
  });
});

// Load board items (from deployed source data)
const loadBoardItems = async () => {
  // Use cache if available and fresh
  const now = Date.now();
  if (boardItemsCache && lastLoadTime && now - lastLoadTime < CACHE_DURATION) {
    return [...boardItemsCache]; // Return copy
  }

  try {
    // Try to load from source data (this works on Vercel for reading)
    const sourceDataPath = path.join(
      __dirname,
      "..",
      "src",
      "data",
      "boardItems.json"
    );
    const sourceData = await fs.readFile(sourceDataPath, "utf8");
    boardItemsCache = JSON.parse(sourceData);
    lastLoadTime = now;
    console.log(`📊 Loaded ${boardItemsCache.length} items from source data`);
    return [...boardItemsCache];
  } catch (error) {
    console.error("Error loading board items:", error);
    // Return empty array if file not found
    if (!boardItemsCache) {
      boardItemsCache = [];
    }
    return [...boardItemsCache];
  }
};

// GET /api/board-items - Get all board items
app.get("/api/board-items", async (req, res) => {
  try {
    const items = await loadBoardItems();
    res.json(items);
  } catch (error) {
    console.error("Error loading board items:", error);
    res.status(500).json({ error: "Failed to load board items" });
  }
});

// POST /api/board-items - Create a new board item
app.post("/api/board-items", async (req, res) => {
  try {
    const { type, x, y, width, height, content, color, rotation, ehrData } =
      req.body;

    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const defaultWidth = type === "text" ? 200 : type === "ehr" ? 550 : 150;
    const defaultHeight = type === "text" ? 100 : type === "ehr" ? 450 : 150;
    const defaultColor =
      type === "sticky" ? "#ffeb3b" : type === "ehr" ? "#e8f5e8" : "#2196f3";
    const defaultContent =
      type === "text"
        ? "Double click to edit"
        : type === "ehr"
        ? "EHR Data"
        : "";

    const newItem = {
      id,
      type,
      x: x || Math.random() * 8000 + 100,
      y: y || Math.random() * 7000 + 100,
      width: width || defaultWidth,
      height: height || defaultHeight,
      content: content || defaultContent,
      color: color || defaultColor,
      rotation: rotation || 0,
      ehrData: type === "ehr" ? ehrData || {} : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    boardItemsCache = items;

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating board item:", error);
    res.status(500).json({ error: "Failed to create board item" });
  }
});

// POST /api/todos - Create a todo (in-memory only)
app.post("/api/todos", async (req, res) => {
  try {
    const { title, description, todo_items } = req.body || {};

    if (!title || !Array.isArray(todo_items)) {
      return res.status(400).json({
        error: "title (string) and todo_items (array) are required",
      });
    }

    const todos = todo_items.map((t) => {
      if (typeof t === "string") return { text: t, status: "todo" };
      if (t && typeof t.text === "string")
        return { text: t.text, status: t.status || "todo" };
      return { text: String(t), status: "todo" };
    });

    const calculateTodoHeight = (todos, description) => {
      const baseHeight = 80;
      const itemHeight = 35;
      const descriptionHeight = description ? 20 : 0;
      const padding = 20;
      const totalItems = todos.length;
      const contentHeight =
        baseHeight + totalItems * itemHeight + descriptionHeight + padding;
      return Math.min(Math.max(contentHeight, 200), 600);
    };

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const dynamicHeight = calculateTodoHeight(todos, description);

    const newItem = {
      id,
      type: "todo",
      x: Math.random() * 8000 + 100,
      y: Math.random() * 7000 + 100,
      width: 420,
      height: dynamicHeight,
      content: "Todo List",
      color: "#ffffff",
      rotation: 0,
      todoData: {
        title,
        description: description || "",
        todos,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    boardItemsCache = items;

    // Broadcast via SSE
    const payload = {
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    };
    for (const client of sseClients) {
      try {
        client.write("event: new-item\n");
        client.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (_) {}
    }

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating todo item:", error);
    res.status(500).json({ error: "Failed to create todo item" });
  }
});

// POST /api/agents - Create agent result
app.post("/api/agents", async (req, res) => {
  try {
    const { title, content } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({
        error: "title (string) and content (string) are required",
      });
    }

    const calculateHeight = (content) => {
      const baseHeight = 80;
      const lineHeight = 20;
      const maxWidth = 520;
      const estimatedLines = Math.ceil(content.length / (maxWidth / 12));
      const contentHeight = Math.max(estimatedLines * lineHeight, 100);
      return Math.min(baseHeight + contentHeight, 800);
    };

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const dynamicHeight = calculateHeight(content);

    const newItem = {
      id,
      type: "agent",
      x: Math.random() * 700 + 100,
      y: Math.random() * 700 + 100,
      width: 520,
      height: dynamicHeight,
      content: content,
      color: "#ffffff",
      rotation: 0,
      agentData: {
        title,
        markdown: content,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    boardItemsCache = items;

    const payload = {
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    };
    broadcastSSE(payload);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating agent item:", error);
    res.status(500).json({ error: "Failed to create agent item" });
  }
});

// POST /api/lab-results - Create lab result
app.post("/api/lab-results", async (req, res) => {
  try {
    const { parameter, value, unit, status, range, trend } = req.body || {};

    if (!parameter || !value || !unit || !status || !range) {
      return res.status(400).json({
        error: "parameter, value, unit, status, and range are required",
      });
    }

    const validStatuses = ["optimal", "warning", "critical"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "status must be one of: optimal, warning, critical",
      });
    }

    if (range.min === undefined || range.max === undefined) {
      return res.status(400).json({
        error: "range must have min and max values",
        received: range
      });
    }
    
    if (typeof range.min !== 'number' || typeof range.max !== 'number') {
      return res.status(400).json({
        error: "range.min and range.max must be numbers",
        received: { min: range.min, max: range.max, types: { min: typeof range.min, max: typeof range.max } }
      });
    }
    
    if (range.min >= range.max) {
      return res.status(400).json({
        error: "range.min must be less than range.max",
        received: { min: range.min, max: range.max }
      });
    }

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const newItem = {
      id,
      type: "lab-result",
      x: Math.random() * 8000 + 100,
      y: Math.random() * 7000 + 100,
      width: 400,
      height: 280,
      content: parameter,
      color: "#ffffff",
      rotation: 0,
      labResultData: {
        parameter,
        value,
        unit,
        status,
        range,
        trend: trend || "stable",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const items = await loadBoardItems();
    items.push(newItem);
    boardItemsCache = items;

    broadcastSSE({
      item: newItem,
      timestamp: new Date().toISOString(),
      action: "created",
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating lab result:", error);
    res.status(500).json({ error: "Failed to create lab result" });
  }
});

// POST /api/focus - Focus item or sub-component
app.post("/api/focus", (req, res) => {
  const { objectId, subComponent } = req.body;

  if (!objectId) {
    return res.status(400).json({ error: "objectId is required" });
  }

  const focusTarget = subComponent ? `${objectId}.${subComponent}` : objectId;
  console.log(`🎯 Focus request: ${focusTarget}`);

  const payload = {
    objectId,
    subComponent,
    focusTarget,
    timestamp: new Date().toISOString(),
  };

  for (const client of sseClients) {
    try {
      client.write("event: focus-item\n");
      client.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (_) {}
  }

  res.json({
    success: true,
    message: `Focusing on: ${focusTarget}`,
    objectId,
    subComponent: subComponent || null,
  });
});

// Reset cache - force reload from file
app.post("/api/reset-cache", async (req, res) => {
  try {
    boardItemsCache = null;
    lastLoadTime = null;
    const items = await loadBoardItems();
    res.json({
      success: true,
      message: "Cache cleared and reloaded",
      itemCount: items.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to reset cache",
      message: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    storage: "in-memory",
    note: "Items persist only during serverless function lifetime",
  });
});

// Export for Vercel serverless
module.exports = app;

// Local development only
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints: http://localhost:${PORT}/api/`);
    console.log(`💾 Data source: src/data/boardItems.json`);
    console.log(`\n🔧 For production (Vercel), use /api/* endpoints`);
  });
}
