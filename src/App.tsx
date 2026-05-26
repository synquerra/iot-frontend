import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { UserContextProvider } from "./contexts/UserContext";
import { GlobalLoadingProvider } from "./contexts/GlobalLoadingContext";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
  useMantineColorScheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  primaryColor: "indigo",
  fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
  defaultRadius: "sm",
  headings: {
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
  },
});

const colorSchemeManager = localStorageColorSchemeManager({
  key: "synquerra-color-scheme",
});

function DocumentThemeSync() {
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", colorScheme === "dark");
    root.style.colorScheme = colorScheme;
  }, [colorScheme]);

  return null;
}

function App() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="light"
      colorSchemeManager={colorSchemeManager}
    >
      <DocumentThemeSync />
      <Notifications position="top-right" />
      <UserContextProvider>
        <GlobalLoadingProvider>
          <RouterProvider router={router} />
        </GlobalLoadingProvider>
      </UserContextProvider>
    </MantineProvider>
  );
}

export default App;
