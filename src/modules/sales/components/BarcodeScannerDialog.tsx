import {
  CameraAltRounded,
  CloseRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import {
  Scanner,
} from "@yudiel/react-qr-scanner";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type BarcodeScannerDialogProps = {
  open: boolean;

  onClose: () => void;

  onDetected: (
    barcode: string,
  ) => Promise<boolean>;
};

export function BarcodeScannerDialog({
  open,
  onClose,
  onDetected,
}: BarcodeScannerDialogProps) {
  const [
    paused,
    setPaused,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const processingRef =
    useRef(false);

  const resumeTimeoutRef =
    useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      processingRef.current = false;

      setPaused(false);
      setError(null);
    }

    return () => {
      if (
        resumeTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          resumeTimeoutRef.current,
        );
      }
    };
  }, [open]);

  const resumeScanner = () => {
    resumeTimeoutRef.current =
      window.setTimeout(() => {
        processingRef.current = false;

        setPaused(false);
      }, 1200);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <CameraAltRounded />

          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            Escanear producto
          </Typography>
        </Stack>

        <IconButton
          type="button"
          onClick={onClose}
        >
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "#111111",
        }}
      >
        {error && (
          <Alert
            severity="warning"
            sx={{
              flexShrink: 0,
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            borderRadius: "12px",
            bgcolor: "#000000",
          }}
        >
          <Scanner
            paused={paused}
            constraints={{
              facingMode: {
                ideal: "environment",
              },
            }}
            formats={[
              "retail_codes",
              "code_128",
              "code_39",
              "itf",
            ]}
            components={{
              finder: true,
              torch: true,
              zoom: true,
            }}
            onScan={async (
              detectedCodes,
            ) => {
              if (
                processingRef.current
              ) {
                return;
              }

              const barcode =
                detectedCodes[0]
                  ?.rawValue
                  ?.trim();

              if (!barcode) {
                return;
              }

              processingRef.current =
                true;

              setPaused(true);
              setError(null);

              try {
                const added =
                  await onDetected(
                    barcode,
                  );

                if (added) {
                  onClose();

                  return;
                }

                setError(
                  `No se encontró un producto con el código ${barcode}.`,
                );

                resumeScanner();
              } catch {
                setError(
                  "No fue posible procesar el código de barras.",
                );

                resumeScanner();
              }
            }}
            onError={(scannerError) => {
              setError(
                scannerError.message ||
                  "No fue posible iniciar la cámara.",
              );
            }}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          Apunta la cámara al código de barras del producto.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}