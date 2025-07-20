import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';


const app = express();
// Add this near the top of your Express setup
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



// CORS configuration for production
// if (process.env.NODE_ENV === "production") {
//   app.use((req, res, next) => {
//     const allowedOrigins = [
//       process.env.FRONTEND_URL,
//       "https://your-calendar-app.vercel.app" // Replace with your actual Vercel domain
//     ].filter(Boolean);
    
//     const origin = req.headers.origin;
//     if (origin && allowedOrigins.includes(origin)) {
//       res.setHeader('Access-Control-Allow-Origin', origin);
//     }
    
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
    
//     if (req.method === 'OPTIONS') {
//       res.sendStatus(200);
//       return;
//     }
    
//     next();
//   });
// }

// Replace your current CORS configuration with this:
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173", // Vite default port
    "https://your-calendar-app.vercel.app" // Your production domain
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.


  // server.listen({
    //   port,
    //   host: "127.0.0.1",
    //   reusePort: true,
    // }, () => {
      //   log(`serving on http://127.0.0.1:${port}`);
      // });
      
      
  const port = parseInt(process.env.PORT || '5001', 10);
  const isDev = process.env.NODE_ENV !== 'production';

  server.listen(
    {
      port,
      host: isDev ? '127.0.0.1' : '0.0.0.0',
    },
    () => {
      log(`serving on http://${isDev ? '127.0.0.1' : '0.0.0.0'}:${port}`);
    }
  );
})();
