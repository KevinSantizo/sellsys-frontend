import {
  AddRounded,
  DownloadRounded,
  UploadRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import {
  closeCashSession,
  createCashRegister,
  createManualCashMovement,
  getCashMovements,
  getCashRegisters,
  getCashSessions,
  openCashSession,
  updateCashRegister,
} from "../services/cashService";

import { type GridPaginationModel,} from "@mui/x-data-grid";
import { useEffect, useState,} from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CashRegistersGridCard } from "../components/CashRegistersGridCard";
import type { CashRegister, CashMovementDirection, CashMovementType, CashRegisterFormValues, CashSession } from "../types/cash";
import { useCompanyStore } from "../../companies/store/companyStore";
import { useBranchStore } from "../../branches/store/branchStore"; 
import { CashRegisterFormDialog } from "../components/CashRegisterFormDialog";
import { showSuccessAlert } from "../../../shared/alerts/appAlerts";
import { OpenCashSessionDialog } from "../components/OpenCashSessionDialog";
import { OpenCashSessionCard } from "../components/OpenCashSessionCard";
import { CloseCashSessionDialog } from "../components/CloseCashSessionDialog";
import { ManualCashMovementDialog } from "../components/ManualCashMovementDialog";
import { CashMovementsGridCard } from "../components/CashMovementsGridCard";
import { CashSessionsHistoryGridCard } from "../components/CashSessionsHistoryGridCard";
import { CashSessionDetailDialog } from "../components/CashSessionDetailDialog";
import { getApiErrorMessage } from "../../../shared/utils/getApiErrorMessage";

export function CashPage() {

    const queryClient = useQueryClient();
    const [movementSearch, setMovementSearch] = useState("");
    const [debouncedMovementSearch, setDebouncedMovementSearch] = useState("");
    const [movementType, setMovementType] = useState<CashMovementType | "">("");
    const [movementDirection, setMovementDirection] = useState<CashMovementDirection | "">("");
    const [movementCashRegisterId, setMovementCashRegisterId] = useState("");
    const [movementPaginationModel, setMovementPaginationModel] = useState({ page: 0, pageSize: 10, });
    const [manualMovementSession, setManualMovementSession] = useState<CashSession | null>(null);
    const [manualMovementDirection, setManualMovementDirection] = useState<CashMovementDirection>("IN");
    const [manualMovementError, setManualMovementError] = useState<string | null>(null);
    const [closingCashSession, setClosingCashSession] = useState<CashSession | null>(null);
    const [closeSessionError, setCloseSessionError] = useState<string | null>(null);
    const [isCashRegisterDialogOpen, setIsCashRegisterDialogOpen] = useState(false);
    const [editingCashRegister, setEditingCashRegister] = useState<CashRegister | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const selectedCompany = useCompanyStore((state) => state.selectedCompany);
    const selectedBranch = useBranchStore((state) => state.selectedBranch);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [openingCashRegister, setOpeningCashRegister] = useState<CashRegister | null>(null);
    const [openSessionError, setOpenSessionError] = useState<string | null>(null);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10, });
    const [sessionHistoryCashRegisterId, setSessionHistoryCashRegisterId] = useState("");
    const [sessionHistoryPaginationModel, setSessionHistoryPaginationModel] = useState({ page: 0, pageSize: 10, });
    const [detailCashSession, setDetailCashSession] = useState<CashSession | null>(null);


    const handleViewCashSessionDetail = (cashSession: CashSession) => {
        setDetailCashSession(cashSession);
    };

    const handleCloseCashSessionDetail = () => {
        setDetailCashSession(null);
    };


    const cashSessionHistoryQuery = useQuery({
        queryKey: [
            "cash-sessions",
            "history",
            selectedCompany?.id,
            selectedBranch?.id,
            sessionHistoryCashRegisterId,
            sessionHistoryPaginationModel.page,
            sessionHistoryPaginationModel.pageSize,
        ],
        queryFn: () => getCashSessions({
            companyId: selectedCompany!.id,
            branchId: selectedBranch!.id,
            cashRegisterId: sessionHistoryCashRegisterId || undefined,
            status: "CLOSED",
            ordering: "-opened_at",
            page: sessionHistoryPaginationModel.page + 1,
            pageSize: sessionHistoryPaginationModel.pageSize,
        }),
        enabled: Boolean(selectedCompany?.id && selectedBranch?.id),
        placeholderData: keepPreviousData,
    }); 

    const cashSessionHistory = cashSessionHistoryQuery.data?.results ?? [];
    const totalCashSessionHistory = cashSessionHistoryQuery.data?.count ?? 0;

    const handleSessionHistoryCashRegisterChange = (value: string) => {
        setSessionHistoryCashRegisterId(value);
        setSessionHistoryPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    };

    const handleClearSessionHistoryFilters = () => {
        setSessionHistoryCashRegisterId("");
        setSessionHistoryPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    };


    const cashRegistersFilterQuery = useQuery({
        queryKey: [
            "cash-registers",
            "filter",
            selectedCompany?.id,
            selectedBranch?.id,
        ],
        queryFn: () => getCashRegisters({
            companyId: selectedCompany!.id,
            branchId: selectedBranch!.id,
            page: 1,
            pageSize: 100,
        }),
        enabled: Boolean(selectedCompany?.id && selectedBranch?.id),
        placeholderData: keepPreviousData,
    });

    const cashRegistersForFilters = cashRegistersFilterQuery.data?.results ?? [];

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedMovementSearch(movementSearch);
            setMovementPaginationModel((current) => ({
            ...current,
            page: 0,
            }));
        }, 400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [movementSearch]);


    const cashMovementsQuery = useQuery({
        queryKey: [
            "cash-movements",
            selectedCompany?.id,
            selectedBranch?.id,
            debouncedMovementSearch,
            movementType,
            movementDirection,
            movementCashRegisterId,
            movementPaginationModel.page,
            movementPaginationModel.pageSize,
        ],
        queryFn: () => getCashMovements({
            companyId: selectedCompany!.id,
            branchId: selectedBranch!.id,
            cashRegisterId: movementCashRegisterId || undefined,
            movementType: movementType || undefined,
            direction: movementDirection || undefined,
            search: debouncedMovementSearch || undefined,
            ordering: "-created_at",
            page: movementPaginationModel.page + 1,
            pageSize: movementPaginationModel.pageSize,
        }),
        enabled: Boolean(selectedCompany?.id && selectedBranch?.id),
        placeholderData: keepPreviousData,
    });


    const cashMovements = cashMovementsQuery.data?.results ?? [];
    const totalCashMovements = cashMovementsQuery.data?.count ?? 0;

    const handleMovementTypeChange = (value: CashMovementType | "") => {
        setMovementType(value);
        setMovementPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    };

    const handleMovementDirectionChange = (value: CashMovementDirection | "") => {
        setMovementDirection(value);
        setMovementPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    };

    const handleMovementCashRegisterChange = (value: string) => {
        setMovementCashRegisterId(value);
        setMovementPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    };

    const handleClearMovementFilters = () => {
        setMovementSearch("");
        setDebouncedMovementSearch("");
        setMovementType("");
        setMovementDirection("");
        setMovementCashRegisterId("");

        setMovementPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    };

    const cashRegisterInitialValues: CashRegisterFormValues | undefined = editingCashRegister
    ? {
        name: editingCashRegister.name,
        code: editingCashRegister.code,
        is_active: editingCashRegister.is_active,
        }
    : undefined;

    useEffect(() => {
        const timeout = window.setTimeout(() => {
        setDebouncedSearch(search);
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        setPaginationModel((current) => ({
        ...current,
        page: 0,
        }));
    }, [
        selectedCompany?.id,
        selectedBranch?.id,
        debouncedSearch,
    ]);

    const cashRegistersQuery = useQuery({
        queryKey: [
            "cash-registers",
            selectedCompany?.id,
            selectedBranch?.id,
            debouncedSearch,
            paginationModel.page,
            paginationModel.pageSize,
        ],
        queryFn: () => getCashRegisters({
            companyId: selectedCompany!.id,
            branchId: selectedBranch!.id,
            search: debouncedSearch || undefined, 
            page: paginationModel.page + 1,
            pageSize: paginationModel.pageSize,
        }),
        enabled: Boolean(
            selectedCompany?.id &&
            selectedBranch?.id
        ),
        placeholderData: keepPreviousData,
    });


    const openCashSessionsQuery = useQuery({
        queryKey: [
            "cash-sessions",
            "open",
            selectedCompany?.id,
            selectedBranch?.id,
        ],
        queryFn: () => getCashSessions({
            companyId: selectedCompany!.id,
            branchId: selectedBranch!.id,
            status: "OPEN",
            ordering: "-opened_at",
            page: 1,
            pageSize: 100,
        }),
        enabled: Boolean(
            selectedCompany?.id &&
            selectedBranch?.id
        ),
    });

    const openCashSessions = openCashSessionsQuery.data?.results ?? [];
    const cashRegisters = cashRegistersQuery.data?.results ?? [];
    const totalCashRegisters = cashRegistersQuery.data?.count ?? 0;
 
 
    const closeCashSessionMutation = useMutation({
        mutationFn: ({ cashSessionId, countedAmount }: {
            cashSessionId: string;
            countedAmount: string;
        }) => {
            return closeCashSession(cashSessionId, {
            counted_amount: countedAmount,
            notes: "Cierre de caja",
            });
        },

        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["cash-sessions"] }),
                queryClient.invalidateQueries({ queryKey: ["cash-session-summary"] }),
                queryClient.invalidateQueries({ queryKey: ["cash-registers"] }),
                queryClient.invalidateQueries({ queryKey: ["cash-movements"] }),
            ]);

            setClosingCashSession(null);
            setCloseSessionError(null);

            await showSuccessAlert({title: "Caja cerrada correctamente."});
        },

        onError: (error) => {
            setCloseSessionError(
                getApiErrorMessage(
                    error,
                    "No fue posible cerrar la caja.",
                ),
            );
        },
    }); 

    const handleCloseManualMovementDialog = () => {
        if (manualCashMovementMutation.isPending) {
            return;
        }

        setManualMovementError(null);
        setManualMovementSession(null);
    };

    const handleSubmitManualMovement = (values: {
        amount: string;
        reference: string;
        notes: string;
        }) => {
        if (!manualMovementSession) {
            return;
        }

        setManualMovementError(null);

        manualCashMovementMutation.mutate({
            cashSessionId: manualMovementSession.id,
            direction: manualMovementDirection,
            amount: values.amount,
            reference: values.reference,
            notes: values.notes,
        });
    };

    const openCashSessionMutation = useMutation({
        mutationFn: ({ openingAmount, notes }: { openingAmount: string; notes: string }) => {
            if (!selectedCompany || !selectedBranch || !openingCashRegister) {
            throw new Error("No hay empresa, sucursal o caja seleccionada.");
            }

            return openCashSession({
            company_id: selectedCompany.id,
            branch_id: selectedBranch.id,
            cash_register_id: openingCashRegister.id,
            opening_amount: openingAmount,
            notes,
            });
        },
        onSuccess: async () => { 
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["cash-sessions"] }),
                queryClient.invalidateQueries({ queryKey: ["cash-registers"] }),
            ]);

            setOpeningCashRegister(null);
            setOpenSessionError(null);

            await showSuccessAlert({title: "Caja abierta correctamente."});
        },
        onError: (error) => {
            setOpenSessionError(
                getApiErrorMessage(
                    error,
                    "No fue posible abrir la caja.",
                ),
            );
        },
    });

    const createCashRegisterMutation = useMutation({
        mutationFn: (values: CashRegisterFormValues) => {
            if (!selectedCompany || !selectedBranch) {
                throw new Error("No hay empresa o sucursal seleccionada.");
            }

            return createCashRegister({
                company_id: selectedCompany.id,
                branch_id: selectedBranch.id,
                name: values.name,
                code: values.code,
                is_active: values.is_active,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["cash-registers"] });

            setIsCashRegisterDialogOpen(false);
            setEditingCashRegister(null);
            setFormError(null);

            await showSuccessAlert({title: "Caja creada correctamente."});
        },
        onError: (error) => {
            setFormError(
                getApiErrorMessage(
                    error,
                    "No fue posible crear la caja.",
                ),
            );
        },
    });

    const updateCashRegisterMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: CashRegisterFormValues }) => {
            return updateCashRegister(id, {
            name: values.name,
            code: values.code,
            is_active: values.is_active,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["cash-registers"] });

            setIsCashRegisterDialogOpen(false);
            setEditingCashRegister(null);
            setFormError(null);

            await showSuccessAlert({title: "Caja actualizada correctamente."});
        },
        onError: (error) => {
            setFormError(
                getApiErrorMessage(
                    error,
                    "No fue posible actualizar la caja.",
                ),
            );
        },
    });

    const manualCashMovementMutation = useMutation({
        mutationFn: ({
            cashSessionId,
            direction,
            amount,
            reference,
            notes,
        }: {
            cashSessionId: string;
            direction: CashMovementDirection;
            amount: string;
            reference: string;
            notes: string;
        }) => {
            return createManualCashMovement({
            cash_session_id: cashSessionId,
            direction,
            amount,
            reference,
            notes,
            });
        },

        onSuccess: async () => {
            await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["cash-session-summary"] }),
            queryClient.invalidateQueries({ queryKey: ["cash-movements"] }),
            ]);

            setManualMovementError(null);
            setManualMovementSession(null);

            await showSuccessAlert(
                {
                    title: manualMovementDirection === "IN"
                    ? "Entrada registrada correctamente."
                    : "Salida registrada correctamente."
                },
            );
        },

        onError: (error) => {
            setManualMovementError(
                getApiErrorMessage(
                    error,
                    "No fue posible registrar el movimiento.",
                ),
            );
        },
    });

    const formatCurrency = (value: string | number) => {
        const amount = Number(value);

        return new Intl.NumberFormat("es-GT", {
            style: "currency",
            currency: selectedCompany?.currency ?? "GTQ",
            minimumFractionDigits: 2,
        }).format(Number.isFinite(amount) ? amount : 0);
    };


    const handleManualEntry = (cashSession: CashSession) => {
        setManualMovementError(null);
        setManualMovementDirection("IN");
        setManualMovementSession(cashSession);
    };

    const handleManualExit = (cashSession: CashSession) => {
        setManualMovementError(null);
        setManualMovementDirection("OUT");
        setManualMovementSession(cashSession);
    };

    const handleCloseSession = (cashSession: CashSession) => {
        setCloseSessionError(null);
        setClosingCashSession(cashSession);
    };

    const handleCloseCashSessionDialog = () => {
        if (closeCashSessionMutation.isPending) {
            return;
        }

        setCloseSessionError(null);
        setClosingCashSession(null);
    };

    const handleSubmitCloseCashSession = (countedAmount: string) => {
        if (!closingCashSession) {
            return;
        }

        setCloseSessionError(null);

        closeCashSessionMutation.mutate({
            cashSessionId: closingCashSession.id,
            countedAmount,
        });
    };

    const handleOpenCashSession = (cashRegister: CashRegister) => {
        setOpeningCashRegister(cashRegister);
        setOpenSessionError(null);
    };

    const handleCloseOpenCashSessionDialog = () => {
        if (openCashSessionMutation.isPending) return;

        setOpeningCashRegister(null);
        setOpenSessionError(null);
    };

    const handleSubmitOpenCashSession = (values: { opening_amount: string }) => {
        setOpenSessionError(null);

        openCashSessionMutation.mutate({
            openingAmount: values.opening_amount,
            notes: "Apertura de caja",
        });
    };

    const handleCreateCashRegister = () => {
        setEditingCashRegister(null);
        setFormError(null);
        setIsCashRegisterDialogOpen(true);
    };

    const handleEditCashRegister = (cashRegister: CashRegister) => {
        setEditingCashRegister(cashRegister);
        setFormError(null);
        setIsCashRegisterDialogOpen(true);
    };

    const handleCloseCashRegisterDialog = () => {
        if (createCashRegisterMutation.isPending || updateCashRegisterMutation.isPending) return;

        setIsCashRegisterDialogOpen(false);
        setEditingCashRegister(null);
        setFormError(null);
    };

    const handleSubmitCashRegister = (values: CashRegisterFormValues) => {
        setFormError(null);

        if (editingCashRegister) {
            updateCashRegisterMutation.mutate({
            id: editingCashRegister.id,
            values,
            });

            return;
        }

        createCashRegisterMutation.mutate(values);
    };

    const isCashRegisterSubmitting = createCashRegisterMutation.isPending || updateCashRegisterMutation.isPending;

    const handleRefresh = () => {
        cashRegistersQuery.refetch();
    };

    return (
        <Box>
            <Box
                sx={{
                mb: 3,
                display: "flex",
                flexDirection: {
                    xs: "column",
                    md: "row",
                },
                alignItems: {
                    xs: "stretch",
                    md: "center",
                },
                justifyContent: "space-between",
                gap: 2,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: {
                            xs: "1.65rem",
                            sm: "1.85rem",
                            },
                            fontWeight: 700,
                            mb: 0.4,
                        }}
                    >
                        Cajas
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                        mt: 0.5,
                        fontSize: "0.875rem",
                        }}
                    >
                        Administra las cajas disponibles de la sucursal seleccionada.
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={ 1 }
                    sx={{
                        flexWrap: "wrap",
                    }}
                >
                    
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: {
                            xs: "column",
                            sm: "row",
                            },
                            gap: 1,
                            width: {
                            xs: "100%",
                            sm: "auto",
                            },
                        }}
                        >
                        <Box
                            sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 1,
                            width: {
                                xs: "100%",
                                sm: "auto",
                            },
                            }}
                        >
                            <Button
                            variant="outlined"
                            disabled
                            sx={{
                                borderRadius: "5px",
                                flex: {
                                xs: 1,
                                sm: "initial",
                                },
                            }}
                            >
                            Importar
                            </Button>

                            <Button
                            variant="outlined"
                            disabled
                            sx={{
                                borderRadius: "5px",
                                flex: {
                                xs: 1,
                                sm: "initial",
                                },
                            }}
                            >
                            Exportar
                            </Button>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={ <AddRounded /> }
                            onClick={ handleCreateCashRegister }
                            sx={{
                            borderRadius: "5px",
                            width: {
                                xs: "100%",
                                sm: "auto",
                            },
                            whiteSpace: "nowrap",
                            }}
                        >
                            Nueva caja
                        </Button>
                    </Box>
                </Stack>
            </Box>

            {openCashSessions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography
                    sx={{
                        mb: 1.5,
                        fontSize: "1rem",
                        fontWeight: 700,
                    }}
                    >
                    Cajas abiertas
                    </Typography>

                    <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                        xs: "1fr",
                        xl: openCashSessions.length > 1
                            ? "repeat(2, minmax(0, 1fr))"
                            : "1fr",
                        },
                        gap: 2,
                    }}
                    >
                    {openCashSessions.map((cashSession) => (
                        <OpenCashSessionCard
                        key={ cashSession.id }
                        cashSession={ cashSession }
                        formatCurrency={ formatCurrency }
                        onManualEntry={ handleManualEntry }
                        onManualExit={ handleManualExit }
                        onCloseSession={ handleCloseSession }
                        />
                    ))}
                    </Box>
                </Box>
                
            )}

            <Box sx={{ mt: 3 }}>
                <CashMovementsGridCard
                    cashMovements={ cashMovements }
                    cashRegisters={ cashRegisters }
                    totalCashMovements={ totalCashMovements }
                    loading={ cashMovementsQuery.isFetching }
                    search={ movementSearch }
                    movementType={ movementType }
                    direction={ movementDirection }
                    cashRegisterId={ movementCashRegisterId }
                    paginationModel={ movementPaginationModel }
                    formatCurrency={ formatCurrency }
                    onSearchChange={ setMovementSearch }
                    onMovementTypeChange={ handleMovementTypeChange }
                    onDirectionChange={ handleMovementDirectionChange }
                    onCashRegisterChange={ handleMovementCashRegisterChange }
                    onClearFilters={ handleClearMovementFilters }
                    onPaginationModelChange={ setMovementPaginationModel }
                />
            </Box>
            <Box sx={{ mt: 3 }} >
                <CashRegistersGridCard
                    cashRegisters={ cashRegisters }
                    openCashSessions={ openCashSessions }
                    totalCashRegisters={ totalCashRegisters }
                    loading={
                        cashRegistersQuery.isLoading ||
                        cashRegistersQuery.isFetching ||
                        openCashSessionsQuery.isLoading
                    }
                    search={ search }
                    paginationModel={ paginationModel }
                    onSearchChange={ setSearch }
                    onPaginationModelChange={ setPaginationModel }
                    onRefresh={ handleRefresh }
                    onEdit={ handleEditCashRegister }
                    onOpenSession={ handleOpenCashSession }
                />
            </Box>
            

            <CashRegisterFormDialog
                open={ isCashRegisterDialogOpen }
                title={ editingCashRegister ? "Editar caja" : "Nueva caja" }
                submitLabel={ editingCashRegister ? "Guardar cambios" : "Guardar" }
                branchName={ selectedBranch?.name ?? "" }
                initialValues={ cashRegisterInitialValues }
                isSubmitting={ isCashRegisterSubmitting }
                error={ formError }
                onClose={ handleCloseCashRegisterDialog }
                onSubmit={ handleSubmitCashRegister }
            />

            <OpenCashSessionDialog
                open={ Boolean(openingCashRegister) }
                cashRegister={ openingCashRegister }
                isSubmitting={ openCashSessionMutation.isPending }
                error={ openSessionError }
                onClose={ handleCloseOpenCashSessionDialog }
                onSubmit={ handleSubmitOpenCashSession }
            />

            {closingCashSession && (
                <CloseCashSessionDialog
                    open={ true }
                    cashSession={ closingCashSession }
                    loading={ closeCashSessionMutation.isPending }
                    error={ closeSessionError }
                    formatCurrency={ formatCurrency }
                    onClose={ handleCloseCashSessionDialog }
                    onSubmit={ handleSubmitCloseCashSession }
                />
            )}

            {manualMovementSession && (
                <ManualCashMovementDialog
                    open={ true }
                    cashSession={ manualMovementSession }
                    direction={ manualMovementDirection }
                    loading={ manualCashMovementMutation.isPending }
                    error={ manualMovementError }
                    onClose={ handleCloseManualMovementDialog }
                    onSubmit={ handleSubmitManualMovement }
                />
            )}

            <Box sx={{ mt: 3 }}>
                <CashSessionsHistoryGridCard
                    cashSessions={ cashSessionHistory }
                    cashRegisters={ cashRegistersForFilters }
                    totalCashSessions={ totalCashSessionHistory }
                    loading={ cashSessionHistoryQuery.isFetching }
                    cashRegisterId={ sessionHistoryCashRegisterId }
                    paginationModel={ sessionHistoryPaginationModel }
                    formatCurrency={ formatCurrency }
                    onCashRegisterChange={ handleSessionHistoryCashRegisterChange }
                    onClearFilters={ handleClearSessionHistoryFilters }
                    onPaginationModelChange={ setSessionHistoryPaginationModel }
                    onViewDetail={ handleViewCashSessionDetail }
                />
            </Box>
            {detailCashSession && (
                <CashSessionDetailDialog
                    open={ true }
                    cashSession={ detailCashSession }
                    formatCurrency={ formatCurrency }
                    onClose={ handleCloseCashSessionDetail }
                />
            )}
        </Box>
    );
}