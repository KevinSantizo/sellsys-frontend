import { Alert, Button, Snackbar } from "@mui/material";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useRef } from "react";

export function PwaUpdatePrompt() {

    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        immediate: true, 
        onRegisteredSW: (_url, registration) => {
            registrationRef.current = registration ?? null; 
            void registration?.update();
        },
    });

    useEffect(() => {
    const checkForWaitingWorker = async () => {
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
        if (document.visibilityState === "visible") {
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

    console.log({
        needRefresh,
        waiting: Boolean(
            registrationRef.current?.waiting,
        ),
    });


  return (
    <Snackbar
      open={needRefresh}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={() => setNeedRefresh(false)}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => void updateServiceWorker(true)}
          >
            Actualizar
          </Button>
        }
      >
        Hay una nueva versión disponible.
      </Alert>
    </Snackbar>
  );
}