import {
  GridOnRounded,
  PictureAsPdfRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import { type GridPaginationModel } from "@mui/x-data-grid";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import { useCompanyStore } from "../../companies/store/companyStore";
import { useBranchStore } from "../../branches/store/branchStore";

import {
    addSalePayment,
    cancelSale,
    downloadAccountsReceivableExcel,
    downloadAccountsReceivablePdf,
    getAccountsReceivable,
    getSaleDetail,
    printSaleReceipt,
    type AddSalePaymentPayload,
} from "../services/salesService";

import { AddSalePaymentDialog } from "../components/AddSalePaymentDialog";

import type { AccountsReceivableItem,  SaleDetail } from "../types/sales.types";

import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../shared/alerts/appAlerts";

import { AccountsReceivableGridCard } from "../components/AccountsReceivableGridCard";
import { SaleDetailDialog } from "../components/SaleDetailDialog";

export function AccountsReceivablePage() {
    const selectedCompany = useCompanyStore( (state) => state.selectedCompany,);
    const selectedBranch = useBranchStore( (state) => state.selectedBranch,);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [  paymentReceivable,  setPaymentReceivable, ] = useState<AccountsReceivableItem | null>(null);

    const [paymentError, setPaymentError] = useState<string | null>(null);

    const [paginationModel, setPaginationModel] =
        useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [viewingSaleId, setViewingSaleId] =
    useState<string | null>(null);

  const [saleToCancel, setSaleToCancel] =
    useState<SaleDetail | null>(null);

  const [isDownloadingReceipt, setIsDownloadingReceipt] =
    useState(false);

  const [isDownloadingExcel, setIsDownloadingExcel] =
    useState(false);

  const [isDownloadingPdf, setIsDownloadingPdf] =
    useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPaginationModel((current) => ({
        ...current,
        page: 0,
      }));
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  }, [
    selectedCompany?.id,
    selectedBranch?.id,
  ]);

  const receivablesQuery = useQuery({
    queryKey: [
      "accounts-receivable",
      selectedCompany?.id,
      selectedBranch?.id,
      debouncedSearch,
      paginationModel.page,
      paginationModel.pageSize,
    ],

    queryFn: () => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      if (!selectedBranch) {
        throw new Error(
          "No existe una sucursal seleccionada.",
        );
      }

      return getAccountsReceivable({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        search: debouncedSearch || undefined,
        ordering: "-created_at",
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),

    placeholderData: keepPreviousData,
  });

  const saleDetailQuery = useQuery({
    queryKey: [
      "sale-detail",
      viewingSaleId,
    ],

    queryFn: () => getSaleDetail(viewingSaleId!),

    enabled: Boolean(viewingSaleId),
  });

  const cancelSaleMutation = useMutation({
    mutationFn: (saleId: string) => {
      return cancelSale(saleId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts-receivable"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["sale-detail"],
      });

      setSaleToCancel(null);
      setViewingSaleId(null);

      await showSuccessAlert({
        title: "Venta cancelada",
        text: "La venta fue cancelada correctamente.",
      });
    },

    onError: async () => {
      await showErrorAlert({
        title: "No se pudo cancelar la venta",
        text: "Ocurrió un error al cancelar la venta.",
      });
    },
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({
        saleId,
        payload,
    }: {
        saleId: string;
        payload: AddSalePaymentPayload;
    }) => {
        return addSalePayment(saleId, payload);
    },

    onSuccess: async () => {
        await queryClient.invalidateQueries({
        queryKey: ["accounts-receivable"],
        });

        await queryClient.invalidateQueries({
        queryKey: ["sale-detail"],
        });

        await queryClient.invalidateQueries({
        queryKey: ["cash-sessions"],
        });

        setPaymentReceivable(null);
        setPaymentError(null);

        await showSuccessAlert({
        title: "Abono registrado",
        text: "El pago fue registrado correctamente.",
        });
    },

    onError: () => {
        setPaymentError(
        "No se pudo registrar el abono.",
        );
    },
    });

  const receivables =
    receivablesQuery.data?.results ?? [];

  const totalReceivables =
    receivablesQuery.data?.count ?? 0;

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: selectedCompany?.currency ?? "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [selectedCompany?.currency]);

  const formatCurrency = useCallback(
    (value: string | number) => {
      const amount = Number(value);

      if (!Number.isFinite(amount)) {
        return currencyFormatter.format(0);
      }

      return currencyFormatter.format(amount);
    },
    [currencyFormatter],
  );

  const formatDateTime = useCallback(
    (value: string | null | undefined) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return new Intl.DateTimeFormat("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    [],
  );

  const handleViewSale = useCallback(
    (receivable: AccountsReceivableItem) => {
      setViewingSaleId(receivable.id);
    },
    [],
  );

  const handleAddPayment = useCallback(
    (receivable: AccountsReceivableItem) => {
        setPaymentError(null);
        setPaymentReceivable(receivable);
    },
    [],
    );

  const handleCloseDetail = () => {
    if (isDownloadingReceipt) {
      return;
    }

    setViewingSaleId(null);
  };

  const handlePrintReceipt = async (
    sale:
      | SaleDetail
      | {
          id: string;
          sale_number: string;
          status?: string;
        },
  ) => {
    if (
      sale.status &&
      sale.status !== "COMPLETED"
    ) {
      await showErrorAlert({
        title: "Comprobante no disponible",
        text: "Solo las ventas completadas pueden generar comprobante.",
      });

      return;
    }

    try {
      setIsDownloadingReceipt(true);
      await printSaleReceipt(sale.id);
    } catch {
      await showErrorAlert({
        title: "No se pudo imprimir el comprobante",
        text: "Ocurrió un error al preparar el recibo.",
      });
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedCompany || !selectedBranch) {
      return;
    }

    try {
      setIsDownloadingExcel(true);

      await downloadAccountsReceivableExcel({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        search: debouncedSearch || undefined,
      });
    } catch {
      await showErrorAlert({
        title: "No se pudo descargar el Excel",
        text: "Ocurrió un error al generar el archivo.",
      });
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedCompany || !selectedBranch) {
      return;
    }

    try {
      setIsDownloadingPdf(true);

      await downloadAccountsReceivablePdf({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        search: debouncedSearch || undefined,
      });
    } catch {
      await showErrorAlert({
        title: "No se pudo descargar el PDF",
        text: "Ocurrió un error al generar el archivo.",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const hasActiveFilters = Boolean(search.trim());

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");

    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  };

  if (!selectedCompany) {
    return (
      <Navigate
        to="/companies"
        replace
      />
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.5}
        sx={{
          alignItems: {
            xs: "stretch",
            md: "center",
          },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: {
                xs: "1.65rem",
                sm: "1.85rem",
              },
              fontWeight: 600,
              mb: 0.4,
            }}
          >
            Cuentas por cobrar
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Consulta las ventas pendientes de pago de{" "}
            {selectedCompany.name}
            {selectedBranch
              ? ` en ${selectedBranch.name}.`
              : "."}
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={
              isDownloadingExcel ? (
                <CircularProgress size={18} />
              ) : (
                <GridOnRounded />
              )
            }
            onClick={handleDownloadExcel}
            disabled={
              !selectedBranch ||
              isDownloadingExcel ||
              isDownloadingPdf
            }
            sx={{
              borderRadius: "5px",
              bgcolor: "#FFFFFF",
            }}
          >
            Excel
          </Button>

          <Button
            type="button"
            variant="outlined"
            startIcon={
              isDownloadingPdf ? (
                <CircularProgress size={18} />
              ) : (
                <PictureAsPdfRounded />
              )
            }
            onClick={handleDownloadPdf}
            disabled={
              !selectedBranch ||
              isDownloadingExcel ||
              isDownloadingPdf
            }
            sx={{
              borderRadius: "5px",
              bgcolor: "#FFFFFF",
            }}
          >
            PDF
          </Button>
        </Stack>
      </Stack>

      {!selectedBranch && (
        <Alert severity="warning">
          Selecciona una sucursal para consultar las cuentas por cobrar.
        </Alert>
      )}

      {receivablesQuery.isError && (
        <Alert severity="error">
          No fue posible cargar las cuentas por cobrar.
        </Alert>
      )}

      {selectedBranch &&
        !receivablesQuery.isError && (
          <AccountsReceivableGridCard
            receivables={receivables}
            totalReceivables={totalReceivables}
            loading={
              receivablesQuery.isLoading ||
              receivablesQuery.isFetching ||
              isDownloadingReceipt
            }
            search={search}
            paginationModel={paginationModel}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={setSearch}
            onPaginationModelChange={
              setPaginationModel
            }
            onClearFilters={handleClearFilters}
            onRefresh={() => {
              void receivablesQuery.refetch();
            }}
            onView={handleViewSale}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            onAddPayment={handleAddPayment}
          />
        )}

      <SaleDetailDialog
        open={Boolean(viewingSaleId)}
        sale={saleDetailQuery.data}
        loading={saleDetailQuery.isLoading}
        error={saleDetailQuery.isError}
        downloading={isDownloadingReceipt}
        cancelling={cancelSaleMutation.isPending}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
        onClose={handleCloseDetail}
        onDownloadReceipt={handlePrintReceipt}
        onCancel={(sale) => {
          setSaleToCancel(sale);
        }}
      />

      <AddSalePaymentDialog
        open={Boolean(paymentReceivable)}
        saleNumber={
            paymentReceivable?.sale_number ?? ""
        }
        balanceDue={
            paymentReceivable?.balance_due ?? 0
        }
        companyId={selectedCompany.id}
        branchId={selectedBranch?.id ?? ""}
        isSubmitting={addPaymentMutation.isPending}
        error={paymentError}
        onClose={() => {
            if (!addPaymentMutation.isPending) {
            setPaymentReceivable(null);
            setPaymentError(null);
            }
        }}
        onSubmit={(payload) => {
            if (!paymentReceivable) {
            return;
            }

            setPaymentError(null);

            addPaymentMutation.mutate({
            saleId: paymentReceivable.id,
            payload,
            });
        }}
        />

      <Dialog
        open={Boolean(saleToCancel)}
        onClose={() => {
          if (!cancelSaleMutation.isPending) {
            setSaleToCancel(null);
          }
        }}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: "5px",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Cancelar venta
        </DialogTitle>

        <DialogContent>
          <Typography>
            ¿Deseas cancelar la venta{" "}
            <strong>
              {saleToCancel?.sale_number}
            </strong>
            ?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              fontSize: "0.85rem",
            }}
          >
            La venta dejará de aparecer en cuentas por cobrar.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            disabled={cancelSaleMutation.isPending}
            onClick={() => {
              setSaleToCancel(null);
            }}
            sx={{
              borderRadius: "5px",
              textTransform: "none",
            }}
          >
            Volver
          </Button>

          <Button
            type="button"
            variant="contained"
            color="error"
            disabled={
              cancelSaleMutation.isPending ||
              !saleToCancel
            }
            onClick={() => {
              if (!saleToCancel) {
                return;
              }

              cancelSaleMutation.mutate(
                saleToCancel.id,
              );
            }}
            startIcon={
              cancelSaleMutation.isPending ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : undefined
            }
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {cancelSaleMutation.isPending
              ? "Cancelando..."
              : "Sí, cancelar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}