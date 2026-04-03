import React, { createContext, useContext, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface GlobalLoadingContextType {
  setIsLoading: (isLoading: boolean, message?: string) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export const useGlobalLoading = () => {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error("useGlobalLoading must be used within a GlobalLoadingProvider");
  }
  return context;
};

export const GlobalLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [message, setMessage] = useState("Please wait");

  const setIsLoading = (loading: boolean, msg?: string) => {
    if (loading) {
      setMessage(msg || "Please wait");
    }
    setIsLoadingState(loading);
  };

  return (
    <GlobalLoadingContext.Provider value={{ setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-500 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          
          <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in-90 duration-500">
            {/* Main Premium SVG Loader */}
            <div className="relative h-24 w-24">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                {/* Outer ring */}
                <circle
                  className="stroke-primary/20"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Rotating accent ring */}
                <circle
                  className="stroke-primary animate-[spin_2s_linear_infinite]"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeWidth="4"
                  strokeDasharray="100 200"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Middle ring rotating opposite */}
                <circle
                  className="stroke-primary/40 animate-[spin_3s_linear_infinite_reverse]"
                  cx="50"
                  cy="50"
                  r="35"
                  strokeWidth="4"
                  strokeDasharray="140 100"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Inner glowing core */}
                <circle
                  className="fill-primary animate-pulse"
                  cx="50"
                  cy="50"
                  r="10"
                />
              </svg>
              {/* Central Loader2 icon rotating slowly */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white/80 animate-[spin_4s_linear_infinite]" />
              </div>
            </div>

            {/* Text details */}
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-foreground transition-all duration-300 drop-shadow-sm">
                {message}
              </h2>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
};
