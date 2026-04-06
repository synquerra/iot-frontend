import React, { createContext, useContext, useState, type ReactNode } from "react";

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
  const [message, setMessage] = useState("Loading...");

  const setIsLoading = (loading: boolean, msg?: string) => {
    if (loading && msg) {
      setMessage(msg);
    }
    setIsLoadingState(loading);
  };

  return (
    <GlobalLoadingContext.Provider value={{ setIsLoading }}>
      {children}

      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[320px] border border-border animate-in fade-in zoom-in-95 duration-300">
            {/* Custom GIF Loader */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <img 
                src="/images/saving.gif" 
                alt="Loading..." 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Message */}
            {message && (
              <div className="text-center">
                <p className="text-lg font-medium text-foreground animate-pulse">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </GlobalLoadingContext.Provider>
  );
};