import {
  Box,
  Button,
  Dialog,
  DialogActions, 
  Typography,
} from "@mui/material"; 
import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useRef } from "react";

export function PwaUpdatePrompt() {
  const registrationRef =
    useRef<ServiceWorkerRegistration | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,

    onRegisteredSW: (_url, registration) => {
      registrationRef.current =
        registration ?? null;

      void registration?.update();
    },
  });

  useEffect(() => {
    const checkForWaitingWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      const registration =
        await navigator.serviceWorker.getRegistration();

      if (!registration) {
        return;
      }

      registrationRef.current = registration;

      if (registration.waiting) {
        setNeedRefresh(true);
      }
    };

    const checkForUpdate = () => {
      if (
        document.visibilityState === "visible"
      ) {
        void registrationRef.current?.update();
      }
    };

    void checkForWaitingWorker();

    const intervalId = window.setInterval(
      checkForUpdate,
      60_000,
    );

    document.addEventListener(
      "visibilitychange",
      checkForUpdate,
    );

    return () => {
      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        checkForUpdate,
      );
    };
  }, [setNeedRefresh]);

  return (
    <Dialog
      open={!needRefresh}
      onClose={() => setNeedRefresh(false)}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
            sx: {
            borderRadius: "24px",
            overflow: "hidden",
            mx: 2,

            "& .MuiDialogContent-root": {
                border: "0 !important",
                borderTop: "0 !important",
                borderBottom: "0 !important",
            },
            },
        },
    }}
    >
      <Box
        sx={{
          position: "relative",
          height: {
            xs: 220,
            sm: 250,
          },
          backgroundColor: "rgba(6, 74, 87, 0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderBottom: "none",
        }}
      >
        <Box
        component="img"
        src="/rocket.svg"
        alt="Nueva actualización"
        sx={{
            width: {
            xs: 180,
            sm: 220,
            },
            height: {
            xs: 180,
            sm: 220,
            },
            objectFit: "contain",
            display: "block",
            mb: 5,
        }}
        />

       <Box
        sx={{
            position: "absolute",
            bottom: -13,
            left: 0,
            width: "100%",
            height: 82,
            lineHeight: 0,
        }}
        >
        <svg
            viewBox="0 0 1440 180"
            preserveAspectRatio="none"
            width="100%"
            height="100%"
            style={{
                display: "block",
            }}
            aria-hidden="true"
            >
        <path
            fill="#064A57"
            fillOpacity="0.14"
            d="
            M0 34
            C120 0 240 0 360 34
            C480 68 600 68 720 34
            C840 0 960 0 1080 34
            C1200 68 1320 68 1440 34
            V180 H0 Z
            "
        />

        <path
            fill="#064A57"
            fillOpacity="0.24"
            d="
            M0 54
            C140 20 260 20 400 54
            C540 88 680 88 820 54
            C960 20 1100 20 1240 54
            C1320 74 1380 74 1440 60
            V180 H0 Z
            "
        />

        <path
            fill="#064A57"
            fillOpacity="0.35"
            d="
            M0 76
            C110 44 230 44 350 76
            C470 108 590 108 710 76
            C830 44 950 44 1070 76
            C1190 108 1320 108 1440 78
            V180 H0 Z
            "
        />

        <path
            fill="#064A57"
            d="
            M0 100
            C120 68 240 68 360 100
            C480 132 600 132 720 100
            C840 68 960 68 1080 100
            C1200 132 1320 132 1440 100
            V180 H0 Z
            "
        />

        {/* Máscara inferior ondulada */}
        <path
            fill="#FFFFFF"
            d="
            M0 135
            C180 116 360 116 540 135
            C720 154 900 154 1080 135
            C1260 116 1350 119 1440 132
            V180
            H0
            Z
            "
        />
        </svg>
        </Box>
      </Box>

      <Box
        sx={{
            position: "relative",
            zIndex: 1,
            marginTop: "-1px",
            backgroundColor: "#FFFFFF",
            border: 0,
            boxShadow: "none",
            textAlign: "center",
            px: {
            xs: 3,
            sm: 4,
            },
            pt: 2,
            pb: 1,
        }}
        >
        <Typography
            variant="h5"
            sx={{
            fontWeight: 600,
            color: "#252832",
            }}
        >
            Nueva actualización
        </Typography>

        <Typography
            sx={{
            mt: 2,
            color: "text.secondary",
            lineHeight: 1.6,
            fontSize: "1rem",
            }}
        >
            Para disfrutar una experiencia más rápida
            y segura, instala la última versión de la
            aplicación.
        </Typography>
        </Box>

      <DialogActions
         sx={{
            px: {
            xs: 3,
            sm: 4,
            },
            pb: 3,
            pt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            alignItems: "stretch",
            border: 0,

            "& > :not(style) + :not(style)": {
                marginLeft: 0,
            },
            "& .MuiButton-root": {
                width: "100%",
                marginLeft: 0,
            },
        }}
        
      >
        <Button
          fullWidth
          variant="contained"
          onClick={() =>
            void updateServiceWorker(true)
          }
          sx={{
            minHeight: 52,
            borderRadius: "18px",
            backgroundColor: "#064A57",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#053D47",
            },
          }}
        >
          Actualizar aplicación
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => setNeedRefresh(false)}
          sx={{
            minHeight: 52,
            borderRadius: "18px",
            borderColor: "#064A57",
            color: "#064A57",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              borderColor: "#064A57",
              backgroundColor: "rgba(6, 74, 87, 0.06)",
            },
          }}
        >
          Más tarde
        </Button>
      </DialogActions>
    </Dialog>
  );
}