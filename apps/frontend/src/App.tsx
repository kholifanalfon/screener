import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import { Layers, Server, Database, BookOpen, Activity } from "lucide-react";
import axios from "axios";
import "./App.css";

interface BackendInfo {
  name: string;
  message: string;
  versions: {
    bun: string;
    node: string;
    express: string;
  };
  environment: string;
  timestamp: string;
}

function App() {
  const [count, setCount] = useState(0);
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBackendInfo = async () => {
      try {
        const apiUrl = import.meta.env.FE_API_URL || "http://localhost:3000";
        const response = await axios.get(apiUrl);
        setBackendInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch backend info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendInfo();
  }, []);

  const techStacks = [
    {
      title: "Frontend",
      icon: <Layers className="w-6 h-6 text-blue-500" />,
      items: [
        "React + TypeScript (Vite)",
        "Tailwind CSS & Shadcn UI",
        "React Router",
        "React Hook Form + Zod",
        "Zustand",
        "TanStack Query",
      ],
    },
    {
      title: "Backend",
      icon: <Server className="w-6 h-6 text-green-500" />,
      items: [
        "Express + Bun",
        "Drizzle ORM",
        "Zod & Jose",
        "Pino & Dotenv",
      ],
    },
    {
      title: "Database",
      icon: <Database className="w-6 h-6 text-purple-500" />,
      items: [
        "PostgreSQL",
        "Enterprise Connection Pooling",
      ],
    },
    {
      title: "Documentation",
      icon: <BookOpen className="w-6 h-6 text-orange-500" />,
      items: [
        "Docusaurus (Architecture & SOP)",
        "Scalar (Interactive API Reference)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 md:p-12">
      <div className="max-w-5xl w-full space-y-16 text-center">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
            <a
              href="https://vitejs.dev"
              target="_blank"
              rel="noreferrer"
              className="group"
            >
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border group-hover:border-primary/50 transition-colors shadow-sm">
                <img
                  src={viteLogo}
                  className="h-16 w-16 mx-auto transition-transform group-hover:scale-110"
                  alt="Vite logo"
                />
              </div>
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noreferrer"
              className="group"
            >
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border group-hover:border-primary/50 transition-colors shadow-sm">
                <img
                  src={reactLogo}
                  className="h-16 w-16 mx-auto transition-transform group-hover:scale-110 animate-[spin_10s_linear_infinite]"
                  alt="React logo"
                />
              </div>
            </a>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-primary">
            Screener-Trade
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced Software Engineering Architecture
          </p>
        </div>

        {/* Backend Info Section */}
        <div className="bg-secondary/30 border border-border rounded-xl p-8 shadow-sm max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-xl">Backend API Status</h2>
          </div>
          
          {loading ? (
            <p className="text-muted-foreground animate-pulse">Connecting to backend server...</p>
          ) : backendInfo ? (
            <div className="text-left space-y-4 bg-card p-6 rounded-lg border border-border">
              <div>
                <p className="font-semibold text-primary">{backendInfo.name}</p>
                <p className="text-sm text-muted-foreground">{backendInfo.message}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Environment</p>
                  <p className="font-mono text-sm px-2 py-1 bg-secondary rounded-md inline-block">{backendInfo.environment}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bun</p>
                  <p className="font-mono text-sm px-2 py-1 bg-secondary rounded-md inline-block">v{backendInfo.versions.bun}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Node</p>
                  <p className="font-mono text-sm px-2 py-1 bg-secondary rounded-md inline-block">v{backendInfo.versions.node}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Express</p>
                  <p className="font-mono text-sm px-2 py-1 bg-secondary rounded-md inline-block">v{backendInfo.versions.express}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
              Failed to connect to backend server. Make sure it's running on port 3000.
            </div>
          )}
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {techStacks.map((stack, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary rounded-lg">
                  {stack.icon}
                </div>
                <h2 className="font-bold text-lg">{stack.title}</h2>
              </div>
              <ul className="space-y-2">
                {stack.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Interactive Section */}
        <div className="bg-secondary/30 border border-border rounded-xl p-8 shadow-sm max-w-md mx-auto space-y-6">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            Count is {count}
          </button>
          <p className="text-sm text-muted-foreground">
            Edit{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">
              src/App.tsx
            </code>{" "}
            and save to test HMR
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
