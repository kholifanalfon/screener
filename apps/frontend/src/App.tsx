import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import reactLogo from "@/assets/react.svg";
import viteLogo from "@/assets/vite.svg";
import { Layers, Server, Database, BookOpen, Activity, LogOut, User as UserIcon } from "lucide-react";
import { api } from "@/shared/config/axios";
import "./App.css";
import LoginPage from "@/features/auth/pages/auth-login.page";
import RegisterPage from "@/features/auth/pages/auth-register.page";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { PublicRoute } from "@/shared/components/public-route";
import { useMe, useLogout } from "@/features/auth/hooks/use-auth";
import StockScreenerPage from "@/features/stocks/pages/stock-screener.page";

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

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'screener'>('dashboard');
  const [count, setCount] = useState(0);
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { data: user } = useMe();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBackendInfo = async () => {
      try {
        const apiUrl = import.meta.env.FE_API_URL || "http://localhost:3000";
        const response = await api.get(apiUrl, { baseURL: "" });
        setBackendInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch backend info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendInfo();
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/login"),
    });
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-5xl w-full flex items-center justify-between border-b border-slate-800 pb-6 mb-12 z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-500" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-650 bg-clip-text text-transparent">Screener Trade</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm">
            <UserIcon className="w-4 h-4 text-slate-450" />
            <span className="text-slate-300 font-medium">{user?.fullName || user?.email}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/50 text-indigo-300 capitalize">{user?.role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-900/40 hover:border-red-950 text-red-400 hover:bg-red-950/20 active:bg-red-950/30 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-5xl w-full flex gap-4 border-b border-slate-800 pb-px mb-8 z-10">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-indigo-500 text-indigo-405 font-bold'
              : 'border-transparent text-slate-450 hover:text-slate-205'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('screener')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'screener'
              ? 'border-indigo-500 text-indigo-405 font-bold'
              : 'border-transparent text-slate-450 hover:text-slate-205'
          }`}
        >
          Stock Screener
        </button>
      </div>

      <div className="max-w-5xl w-full space-y-12 z-10">
        {activeTab === 'dashboard' ? (
          <div className="space-y-16 text-center">
            {/* Logo Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-colors shadow-sm">
                  <img
                    src={viteLogo}
                    className="h-16 w-16 mx-auto transition-transform hover:scale-110"
                    alt="Vite logo"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-colors shadow-sm">
                  <img
                    src={reactLogo}
                    className="h-16 w-16 mx-auto transition-transform hover:scale-110 animate-[spin_10s_linear_infinite]"
                    alt="React logo"
                  />
                </div>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-slate-100">
                Screener-Trade
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Advanced Software Engineering Architecture
              </p>
            </div>

            {/* Backend Info Section */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-8 shadow-sm max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h2 className="font-bold text-xl text-slate-200">Backend API Status</h2>
              </div>
              
              {loading ? (
                <p className="text-slate-455 animate-pulse text-sm">Connecting to backend server...</p>
              ) : backendInfo ? (
                <div className="text-left space-y-4 bg-slate-950/80 p-6 rounded-lg border border-slate-800">
                  <div>
                    <p className="font-semibold text-indigo-400">{backendInfo.name}</p>
                    <p className="text-sm text-slate-455">{backendInfo.message}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-850">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Environment</p>
                      <p className="font-mono text-sm px-2 py-1 bg-slate-900 rounded-md inline-block border border-slate-800 text-slate-300">{backendInfo.environment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Bun</p>
                      <p className="font-mono text-sm px-2 py-1 bg-slate-900 rounded-md inline-block border border-slate-800 text-slate-300">v{backendInfo.versions.bun}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Node</p>
                      <p className="font-mono text-sm px-2 py-1 bg-slate-900 rounded-md inline-block border border-slate-800 text-slate-300">v{backendInfo.versions.node}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Express</p>
                      <p className="font-mono text-sm px-2 py-1 bg-slate-900 rounded-md inline-block border border-slate-800 text-slate-300">v{backendInfo.versions.express}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-950/30 text-red-400 rounded-lg border border-red-900/30 text-sm">
                  Failed to connect to backend server. Make sure it's running on port 3000.
                </div>
              )}
            </div>

            {/* Tech Stack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {techStacks.map((stack, index) => (
                <div
                  key={index}
                  className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-sm hover:border-slate-700/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                      {stack.icon}
                    </div>
                    <h2 className="font-bold text-lg text-slate-200">{stack.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {stack.items.map((item, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Interactive Section */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 shadow-sm max-w-md mx-auto space-y-6">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="w-full bg-indigo-650 hover:bg-indigo-600 active:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-indigo-950/40 text-sm"
              >
                Count is {count}
              </button>
              <p className="text-sm text-slate-450">
                Edit{" "}
                <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400 border border-slate-850 font-mono">
                  src/App.tsx
                </code>{" "}
                and save to test HMR
              </p>
            </div>
          </div>
        ) : (
          <div className="text-left">
            <StockScreenerPage />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
