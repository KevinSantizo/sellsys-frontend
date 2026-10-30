import {
  CheckCircleRounded,
  CloseRounded,
  CropFree
} from "@mui/icons-material";

import {
  Alert,
  Box,
  IconButton,
  Paper,
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

type BarcodeScannerInlineProps = {
  open: boolean;
  onClose: () => void;
  onDetected: ( barcode: string, ) => Promise<boolean>;
  successLabel?: string;
};

export function BarcodeScannerInline({
  open,
  onClose,
  onDetected,
  successLabel = "Producto agregado",
}: BarcodeScannerInlineProps) {

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  const processingRef =
    useRef(false);

  const lastBarcodeRef =
    useRef<string | null>(null);

  const resumeTimeoutRef =
    useRef<number | null>(null);

  const successTimeoutRef =
    useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      processingRef.current = false;
      lastBarcodeRef.current = null;

      setError(null);
      setSuccess(null);
    }

    return () => {
      if (
        resumeTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          resumeTimeoutRef.current,
        );
      }

      if (
        successTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          successTimeoutRef.current,
        );
      }
    };
  }, [open]);

  const playSuccessSound = async () => {
    try {
      const AudioContextClass = window.AudioContext;
      const audioContext =new AudioContextClass();
      if (audioContext.state ==="suspended") {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(
        gainNode,
      );

      gainNode.connect(
        audioContext.destination,
      );

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        880,
        audioContext.currentTime,
      );

      gainNode.gain.setValueAtTime(
        0.12,
        audioContext.currentTime,
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
          0.12,
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime +0.12,);
      oscillator.addEventListener(
        "ended",
        () => {
          void audioContext.close();
        },
      );
    } catch {
      // El sonido es solo feedback.
      // Si el navegador lo bloquea,
      // el escaneo continúa normalmente.
    }
  };

  const successFeedback = async (
    barcode: string,
  ) => {
    setSuccess(`${successLabel} · ${barcode}`);

    setError(null);
    if ("vibrate" in navigator) {
      navigator.vibrate(80);
    }

    await playSuccessSound();

    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current,);
    }

    successTimeoutRef.current =
      window.setTimeout(() => {
        setSuccess(null);
      }, 1500);
  };

  const resumeScanner = ( barcode: string, delay = 800, ) => {
    if ( resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current,);
    }

  resumeTimeoutRef.current =
    window.setTimeout(() => {
      processingRef.current = false; 
      window.setTimeout(() => {
        if ( lastBarcodeRef.current ===  barcode ) {
          lastBarcodeRef.current = null;
        }
      }, 700);
    }, delay);
  };

  if (!open) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 2,
        borderRadius: "12px", 
        border: "1px solid",
        borderColor: "divider", 
        bgcolor: "#FFFFFF",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5, 
          alignItems: "center", 
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <CropFree />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            Escanear productos
          </Typography>
        </Stack>

        <IconButton
          type="button"
          size="small"
          onClick={onClose}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </Stack>

      {success && (
        <Alert
          severity="success"
          icon={ <CheckCircleRounded /> }
          sx={{ mb: 1.5, }}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 1.5, }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          position: "relative", 
          width: "100%",
          height: 175, 
          overflow: "hidden", 
          borderRadius: "12px", 
          bgcolor: "#000000",
        }}
      >
        <Scanner
          constraints={{
            facingMode: {
              ideal: "environment",
            },
          }}
          formats={[
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_128",
            "code_39",
            "itf",
          ]}
          components={{
            finder: false,
            torch: true,
            zoom: true,
          }}
          onScan={async ( detectedCodes, ) => {
            const barcode =
              detectedCodes[0]
                ?.rawValue
                ?.trim();

            if (!barcode) {
              return;
            }

            if (processingRef.current) {
              return;
            }

            if (lastBarcodeRef.current === barcode) {
              return;
            }

            processingRef.current = true;
            lastBarcodeRef.current =
              barcode;

            setError(null);

            try {
              const added =
                await onDetected(
                  barcode,
                );

              if (added) {
                await successFeedback(
                  barcode,
                );

                resumeScanner(
                  barcode,
                  700,
                );

                return;
              }

              setSuccess(null); 
              setError(`No se encontró un producto con el código ${barcode}.`,); 
              resumeScanner(
                barcode,
                1200,
              );
            } catch {
              setSuccess(null);
              setError("No fue posible procesar el código de barras.",);

              resumeScanner(
                barcode,
                1200,
              );
            }
          }}
          onError={(
            scannerError,
          ) => { setError(scannerError.message ||"No fue posible iniciar la cámara."); }}
        />

        {/* Marco para apuntar */}
        <Box
          sx={{
            pointerEvents: "none", 
            position: "absolute",
            inset: 0, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "90%",
              height: 125, 
              border: success
                  ? "2px solid #2e7d32"
                  : "2px solid #FFFFFF", 
              borderRadius: "10px", 
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.18)", 
              transition: "border-color 0.2s ease",
            }}
          />
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          mt: 1.2, 
          color: "text.secondary", 
          textAlign: "center",
        }}
      >
        Apunta la cámara al código de barras del producto.
      </Typography>
    </Paper>
  );
}