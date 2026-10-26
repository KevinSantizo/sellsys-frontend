import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  prepareZXingModule,
} from "@yudiel/react-qr-scanner";

import App from "./App";
import { queryClient } from "./app/queryClient";
import { theme } from "./app/theme";

import "./index.css";

prepareZXingModule({
  overrides: {
    locateFile: (
      path: string,
      prefix: string,
    ) => {
      if (
        path.endsWith(".wasm")
      ) {
        return "/zxing_reader.wasm";
      }

      return prefix + path;
    },
  },
});

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);