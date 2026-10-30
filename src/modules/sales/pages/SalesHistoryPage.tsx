import {DownloadRounded} from "@mui/icons-material";

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

import {
  type GridPaginationModel,
} from "@mui/x-data-grid";

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

import {Navigate} from "react-router-dom";
import {useCompanyStore} from "../../companies/store/companyStore";
import {useBranchStore} from "../../branches/store/branchStore";
import {
  getSaleDetail,
  getSales,
  printSaleReceipt,
  cancelSale,
} from "../services/salesService";

import type {SaleDetail, SaleListItem} from "../types/sales.types";
import {showErrorAlert, showSuccessAlert,} from "../../../shared/alerts/appAlerts";
import {SalesGridCard, type SaleStatusFilter} from "../components/SalesGridCard";
import {SaleDetailDialog} from "../components/SaleDetailDialog";


export function SalesHistoryPage() {
  const selectedCompany =
    useCompanyStore(
      (state) =>
        state.selectedCompany,
    );

  const selectedBranch =
    useBranchStore(
      (state) =>
        state.selectedBranch,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<SaleStatusFilter>(
      "ALL",
    );

  const [
    paginationModel,
    setPaginationModel,
  ] =
    useState<GridPaginationModel>({
      page: 0,
      pageSize: 10,
    });

  const [
    viewingSaleId,
    setViewingSaleId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isDownloadingReceipt,
    setIsDownloadingReceipt,
  ] = useState(false);

  const queryClient = useQueryClient();

  const [saleToCancel, setSaleToCancel] =
  useState<SaleDetail | null>(null);

  const cancelSaleMutation = useMutation({
    mutationFn: (saleId: string) => {
      return cancelSale(saleId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["sales-history"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["sale-detail"],
      });

      setSaleToCancel(null);

      await showSuccessAlert({
        title: "Venta cancelada",
        text: "La venta fue cancelada correctamente y el inventario fue restaurado.",
      });
    },

    onError: async () => {
      await showErrorAlert({
        title: "No se pudo cancelar la venta",
        text: "Ocurrió un error al cancelar la venta.",
      });
    },
  });

  /*
   * Debounce de búsqueda.
   */
  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        setDebouncedSearch(
          search.trim(),
        );

        setPaginationModel(
          (current) => ({
            ...current,
            page: 0,
          }),
        );
      }, 400);

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [search]);

  /*
   * Al cambiar empresa,
   * sucursal o estado,
   * regresamos a página 1.
   */
  useEffect(() => {
    setPaginationModel(
      (current) => ({
        ...current,
        page: 0,
      }),
    );
  }, [
    selectedCompany?.id,
    selectedBranch?.id,
    statusFilter,
  ]);

  /*
   * Listado de ventas.
   */
  const salesQuery = useQuery({
    queryKey: [
      "sales-history",
      selectedCompany?.id,
      selectedBranch?.id,
      debouncedSearch,
      statusFilter,
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

      return getSales({
        companyId:
          selectedCompany.id,

        branchId:
          selectedBranch.id,

        search:
          debouncedSearch ||
          undefined,

        status:
          statusFilter ===
          "ALL"
            ? undefined
            : statusFilter,

        ordering:
          "-created_at",

        page:
          paginationModel.page +
          1,

        pageSize:
          paginationModel.pageSize,
      });
    },

    enabled:
      Boolean(
        selectedCompany?.id,
      ) &&
      Boolean(
        selectedBranch?.id,
      ),

    placeholderData:
      keepPreviousData,
  });

  /*
   * Detalle de la venta.
   */
  const saleDetailQuery =
    useQuery({
      queryKey: [
        "sale-detail",
        viewingSaleId,
      ],

      queryFn: () =>
        getSaleDetail(
          viewingSaleId!,
        ),

      enabled:
        Boolean(
          viewingSaleId,
        ),
    });

  const sales =
    salesQuery.data
      ?.results ?? [];

  const totalSales =
    salesQuery.data
      ?.count ?? 0;

  /*
   * Formato monetario.
   */
  const currencyFormatter =
    useMemo(() => {
      return new Intl.NumberFormat(
        "es-GT",
        {
          style:
            "currency",

          currency:
            selectedCompany
              ?.currency ??
            "GTQ",

          minimumFractionDigits:
            2,

          maximumFractionDigits:
            2,
        },
      );
    }, [
      selectedCompany
        ?.currency,
    ]);

  const formatCurrency =
    useCallback(
      (
        value:
          | string
          | number,
      ) => {
        const amount =
          Number(value);

        if (
          !Number.isFinite(
            amount,
          )
        ) {
          return currencyFormatter.format(
            0,
          );
        }

        return currencyFormatter.format(
          amount,
        );
      },
      [
        currencyFormatter,
      ],
    );

  /*
   * Formato de fecha.
   */
  const formatDateTime =
    useCallback(
      (
        value:
          | string
          | null
          | undefined,
      ) => {
        if (!value) {
          return "-";
        }

        const date =
          new Date(value);

        if (
          Number.isNaN(
            date.getTime(),
          )
        ) {
          return value;
        }

        return new Intl.DateTimeFormat(
          "es-GT",
          {
            day:
              "2-digit",

            month:
              "2-digit",

            year:
              "numeric",

            hour:
              "2-digit",

            minute:
              "2-digit",
          },
        ).format(date);
      },
      [],
    );

  /*
   * Abrir detalle.
   */
  const handleViewSale =
    useCallback(
      (
        sale:
          SaleListItem,
      ) => {
        setViewingSaleId(
          sale.id,
        );
      },
      [],
    );

  /*
   * Cerrar detalle.
   */
  const handleCloseDetail =
    () => {
      if (
        isDownloadingReceipt
      ) {
        return;
      }

      setViewingSaleId(
        null,
      );
    };

  /*
   * Descargar / imprimir recibo.
   */
  const handlePrintReceipt =
    async (
        sale:
        | SaleListItem
        | {
            id: string;
            sale_number: string;
            status?: string;
            },
    ) => {
        if (
        sale.status &&
        sale.status !==
            "COMPLETED"
        ) {
        await showErrorAlert({
            title:
            "Comprobante no disponible",

            text:
            "Solo las ventas completadas pueden generar comprobante.",
        });

        return;
        }

        try {
        setIsDownloadingReceipt(
            true,
        );

        await printSaleReceipt(
            sale.id,
        );
        } catch {
        await showErrorAlert({
            title:
            "No se pudo imprimir el comprobante",

            text:
            "Ocurrió un error al preparar el recibo para impresión.",
        });
        } finally {
        setIsDownloadingReceipt(
            false,
        );
        }
    };

  /*
   * Existen filtros activos.
   */
  const hasActiveFilters =
    Boolean(
      search.trim(),
    ) ||
    statusFilter !==
      "ALL";

  /*
   * Limpiar filtros.
   */
  const handleClearFilters =
    () => {
      setSearch("");

      setDebouncedSearch(
        "",
      );

      setStatusFilter(
        "ALL",
      );

      setPaginationModel(
        (current) => ({
          ...current,
          page: 0,
        }),
      );
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
      {/* HEADER */}

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

          justifyContent:
            "space-between",
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

              fontWeight: 700,
              mb: 0.4,
            }}
          >
            Ventas
          </Typography>

          <Typography
            sx={{
              color:
                "text.secondary",

              fontSize:
                "0.9rem",
            }}
          >
            Consulta las ventas
            de{" "}
            {
              selectedCompany.name
            }
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
            disabled
            startIcon={
              <DownloadRounded />
            }
            sx={{
              borderRadius:
                "5px",

              bgcolor:
                "#FFFFFF",

              textTransform:
                "none",
            }}
          >
            Exportar
          </Button>
        </Stack>
      </Stack>

      {/* SIN SUCURSAL */}

      {!selectedBranch && (
        <Alert severity="warning">
          Selecciona una
          sucursal para
          consultar las ventas.
        </Alert>
      )}

      {/* ERROR */}

      {salesQuery.isError && (
        <Alert severity="error">
          No fue posible cargar
          las ventas.
        </Alert>
      )}

      {/* GRID */}

      {selectedBranch &&
        !salesQuery.isError && (
          <SalesGridCard
            sales={sales}
            totalSales={
              totalSales
            }
            loading={
              salesQuery.isLoading ||
              salesQuery.isFetching ||
              isDownloadingReceipt
            }
            search={search}
            statusFilter={
              statusFilter
            }
            paginationModel={
              paginationModel
            }
            hasActiveFilters={
              hasActiveFilters
            }
            onSearchChange={
              setSearch
            }
            onStatusFilterChange={
              setStatusFilter
            }
            onPaginationModelChange={
              setPaginationModel
            }
            onClearFilters={
              handleClearFilters
            }
            onRefresh={() => {
              void salesQuery.refetch();
            }}
            onView={
              handleViewSale
            }
            onPrint={(
              sale,
            ) => {
              void handlePrintReceipt(
                sale,
              );
            }}
            formatCurrency={
              formatCurrency
            }
            formatDateTime={
              formatDateTime
            }
          />
        )}

      {/* DETALLE */}

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
              Los productos serán devueltos al inventario
              y a los lotes originales utilizados en la venta.
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
              disabled={
                cancelSaleMutation.isPending
              }
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
                fontWeight: 700,
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