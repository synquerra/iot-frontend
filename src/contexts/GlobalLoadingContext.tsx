import React, { createContext, useContext, useState, type ReactNode } from "react";
import { Image, Overlay, Paper, Portal, Stack, Text } from "@mantine/core";

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
        <Portal>
          <Overlay fixed blur={4} backgroundOpacity={0.45} zIndex={9998} />
          <Stack
            align="center"
            justify="center"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <Paper
              withBorder
              shadow="xl"
              radius="xl"
              p="xl"
              miw={320}
              style={{ pointerEvents: "auto" }}
            >
              <Stack align="center" gap="lg">
                <Image
                  src="/images/saving.gif"
                  alt="Loading..."
                  h={192}
                  w={192}
                  fit="contain"
                />
                {message && (
                  <Text ta="center" fw={600} size="lg">
                    {message}
                  </Text>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Portal>
      )}
    </GlobalLoadingContext.Provider>
  );
};
