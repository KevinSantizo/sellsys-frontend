import { Alert, Button, Snackbar } from "@mui/material";
import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
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