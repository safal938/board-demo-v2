// Serverless-optimized Express app for Vercel
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Timeout middleware - ensure responses within 9 seconds
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timeout' });
    }
  }, 9000); // 9 second timeout

  res.on('finish', () => clearTimeout(timeout));
  next();
});

// In-memory storage (per-invocation only on serverless)
let boardItemsCache = null;

// Load board items from bundled data
const loadBoardItems = () => {
  if (boardItemsCache) {
    return boardItemsCache;
  }

  try {
    // Load from bundled data file
    const dataPath = path.join(__dirname, "src", "data", "boardItems.json");
    boardItemsCache = require(dataPath);
    console.log(`📊 Loaded ${boardItemsCache.length} items from data file`);
    return boardItemsCache;
  } catch (error) {
    console.error("Error loading board items:", error);
    // Return empty array if file not found
    boardItemsCache = [];
    return boardItemsCache;
  }
};

// GET /api/health - Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? "vercel" : "local",
    storage: "in-memory-per-invocation",
  });
});

// GET /api/board-items - Get all board items
app.get("/api/board-items", (req, res) => {
  try {
    const items = loadBoardItems();
    res.json(items);
  } catch (error) {
    console.error("Error loading board items:", error);
    res.status(500).json({ error: "Failed to load board items" });
  }
});

// POST /api/board-items - Create a new board item
app.post("/api/board-items", (req, res) => {
  try {
    const { type, x, y, width, height, content, color, rotation, ehrData } =
      req.body;

    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const defaultWidth =
      type === "text" ? 200 : type === "ehr" ? 550 : 150;
    const defaultHeight =
      type === "text" ? 100 : type === "ehr" ? 450 : 150;
    const defaultColor =
      type === "sticky"
        ? "#ffeb3b"
        : type === "ehr"
        ? "#e8f5e8"
        : "#2196f3";
    const defaultContent =
      type === "text"
        ? "Double click to edit"
        : type === "ehr"
        ? "EHR Data"
        : "";

    const newItem = {
      id,
      type,
      x: x !== undefined ? x : Math.random() * 8000 + 100,
      y: y !== undefined ? y : Math.random() * 7000 + 100,
      width: width || defaultWidth,
      height: height || defaultHeight,
      content: content || defaultContent,
      color: color || defaultColor,
      rotation: rotation || 0,
      ehrData: type === "ehr" ? ehrData || {} : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Note: On serverless, this won't persist across invocations
    const items = loadBoardItems();
    items.push(newItem);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating board item:", error);
    res.status(500).json({ error: "Failed to create board item" });
  }
});

// POST /api/todos - Create a todo
app.post("/api/todos", (req, res) => {
  try {
    const { title, description, todo_items, x, y } = req.body || {};

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
      x: x !== undefined ? x : Math.random() * 8000 + 100,
      y: y !== undefined ? y : Math.random() * 7000 + 100,
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

    const items = loadBoardItems();
    items.push(newItem);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating todo item:", error);
    res.status(500).json({ error: "Failed to create todo item" });
  }
});

// POST /api/agents - Create agent result
app.post("/api/agents", (req, res) => {
  try {
    const { title, content, x, y } = req.body || {};

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
      x: x !== undefined ? x : Math.random() * 8000 + 100,
      y: y !== undefined ? y : Math.random() * 7000 + 100,
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

    const items = loadBoardItems();
    items.push(newItem);

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error creating agent item:", error);
    res.status(500).json({ error: "Failed to create agent item" });
  }
});

// POST /api/lab-results - Create lab result
app.post("/api/lab-results", (req, res) => {
  try {
    const { parameter, value, unit, status, range, trend, x, y } =
      req.body || {};

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
        received: range,
      });
    }

    if (typeof range.min !== "number" || typeof range.max !== "number") {
      return res.status(400).json({
        error: "range.min and range.max must be numbers",
        received: {
          min: range.min,
          max: range.max,
          types: { min: typeof range.min, max: typeof range.max },
        },
      });
    }

    if (range.min >= range.max) {
      return res.status(400).json({
        error: "range.min must be less than range.max",
        received: { min: range.min, max: range.max },
      });
    }

    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const newItem = {
      id,
      type: "lab-result",
      x: x !== undefined ? x : Math.random() * 8000 + 100,
      y: y !== undefined ? y : Math.random() * 7000 + 100,
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

    const items = loadBoardItems();
    items.push(newItem);

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

  const focusTarget = subComponent
    ? `${objectId}.${subComponent}`
    : objectId;
  console.log(`🎯 Focus request: ${focusTarget}`);

  // On serverless, we can't broadcast via SSE
  // Return success and let client handle focus
  res.json({
    success: true,
    message: `Focus request received: ${focusTarget}`,
    objectId,
    subComponent: subComponent || null,
    note: "SSE not available on serverless - use client-side focus",
  });
});

// POST /api/reset-cache - Reset cache (reload from file)
app.post("/api/reset-cache", (req, res) => {
  try {
    boardItemsCache = null;
    const items = loadBoardItems();
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

// GET /api/events - SSE not supported on serverless
app.get("/api/events", (req, res) => {
  res.status(501).json({
    error: "SSE not supported on serverless",
    message: "Use polling: GET /api/board-items every N seconds",
    alternative:
      "For real-time updates, use WebSockets or a service like Pusher/Ably",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    availableEndpoints: [
      "GET /api/health",
      "GET /api/board-items",
      "POST /api/board-items",
      "POST /api/agents",
      "POST /api/todos",
      "POST /api/lab-results",
      "POST /api/focus",
      "POST /api/reset-cache",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Export for Vercel serverless
module.exports = app;

// Local development only
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints: http://localhost:${PORT}/api/`);
    console.log(`💾 Data source: src/data/boardItems.json`);
    console.log(`\n🔧 For production (Vercel), use /api/* endpoints`);
  });
}
