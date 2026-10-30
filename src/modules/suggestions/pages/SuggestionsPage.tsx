import {
  FeedbackOutlined,
  SendRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useMutation } from "@tanstack/react-query";

import {
  useState,
  type FormEvent,
} from "react";

import { useCompanyStore } from "../../companies/store/companyStore";
import { useBranchStore } from "../../branches/store/branchStore";

import { createSuggestion } from "../services/suggestionService";

import type {
  SuggestionType,
} from "../types/suggestion";

import {
  getApiErrorMessage,
} from "../../../shared/utils/getApiErrorMessage";

import {
  showSuccessAlert,
} from "../../../shared/alerts/appAlerts";


type SuggestionFormValues = {
  suggestion_type: SuggestionType;
  title: string;
  description: string;
};


const initialValues: SuggestionFormValues = {
  suggestion_type: "IMPROVEMENT",
  title: "",
  description: "",
};


export function SuggestionsPage() {
  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const selectedBranch = useBranchStore(
    (state) => state.selectedBranch,
  );

  const [values, setValues] =
    useState<SuggestionFormValues>(
      initialValues,
    );

  const [validationError, setValidationError] =
    useState<string | null>(null);


  const createSuggestionMutation = useMutation({
    mutationFn: () => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      return createSuggestion({
        company: selectedCompany.id,

        branch:
          selectedBranch?.id ?? null,

        suggestion_type:
          values.suggestion_type,

        title:
          values.title.trim(),

        description:
          values.description.trim(),
      });
    },

    onSuccess: async () => {
      setValues(initialValues);

      setValidationError(null);

      await showSuccessAlert({
        title: "Sugerencia enviada",
        text: "Gracias por ayudarnos a mejorar SellSys.",
      });
    },
  });


  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setValidationError(null);

    if (!values.title.trim()) {
      setValidationError(
        "Debes escribir un asunto.",
      );

      return;
    }

    if (!values.description.trim()) {
      setValidationError(
        "Debes escribir tu sugerencia.",
      );

      return;
    }

    if (
      values.description.trim().length < 10
    ) {
      setValidationError(
        "Describe un poco más tu sugerencia.",
      );

      return;
    }

    createSuggestionMutation.mutate();
  };


  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: "1.65rem",
              sm: "1.85rem",
            },
            fontWeight: 700,
            mb: 0.4,
          }}
        >
          Sugerencias
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.9rem",
          }}
        >
          Ayúdanos a mejorar SellSys.
          Cuéntanos qué función te gustaría
          agregar o qué podríamos mejorar.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 720,
          p: {
            xs: 2,
            sm: 3,
          },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "5px",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
        >
          <Stack spacing={2.25}>
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "5px",
                  bgcolor: "primary.light",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <FeedbackOutlined />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                  }}
                >
                  Enviar sugerencia
                </Typography>

                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.76rem",
                  }}
                >
                  Tus comentarios nos ayudan
                  a seguir mejorando.
                </Typography>
              </Box>
            </Stack>

            {validationError && (
              <Alert severity="error">
                {validationError}
              </Alert>
            )}

            {createSuggestionMutation.isError && (
              <Alert severity="error">
                {getApiErrorMessage(
                  createSuggestionMutation.error,
                  "No fue posible enviar la sugerencia.",
                )}
              </Alert>
            )}

            <TextField
              select
              label="Tipo de sugerencia"
              value={values.suggestion_type}
              onChange={(event) => {
                const suggestionType =
                    event.target.value as SuggestionType;

                setValues((current) => ({
                    ...current,
                    suggestion_type: suggestionType,
                }));
                }}
              fullWidth
              disabled={
                createSuggestionMutation.isPending
              }
            >
              <MenuItem value="IMPROVEMENT">
                Mejora
              </MenuItem>

              <MenuItem value="FEATURE">
                Nueva función
              </MenuItem>

              <MenuItem value="BUG">
                Problema
              </MenuItem>

              <MenuItem value="OTHER">
                Otro
              </MenuItem>
            </TextField>

            <TextField
              label="Asunto"
              value={values.title}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  title: event.target.value,
                }));
              }}
              placeholder="Ej. Alertas de productos por vencer"
              fullWidth
              disabled={
                createSuggestionMutation.isPending
              }
              slotProps={{
                htmlInput: {
                    maxLength: 150,
                },
                }}
            />

            <TextField
              label="Descripción"
              value={values.description}
              onChange={(event) => {
                setValues((current) => ({
                  ...current,
                  description:
                    event.target.value,
                }));
              }}
              placeholder="Cuéntanos qué te gustaría mejorar o agregar..."
              multiline
              minRows={5}
              fullWidth
              disabled={
                createSuggestionMutation.isPending
              }
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              sx={{
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendRounded />}
                disabled={
                  createSuggestionMutation.isPending
                }
                sx={{
                  minWidth: 180,
                  minHeight: 42,
                  borderRadius: "5px",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {createSuggestionMutation.isPending
                  ? "Enviando..."
                  : "Enviar sugerencia"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Stack>
  );
}