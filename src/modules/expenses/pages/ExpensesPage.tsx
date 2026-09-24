import {
  AddRounded,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

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

import {
  cancelExpense,
  completeExpense,
  createExpense,
  getExpense,
  getExpenseCategories,
  getExpenses,
  updateExpense,
} from "../services/expenseService";

import type { GridPaginationModel, } from "@mui/x-data-grid";
import { Navigate } from "react-router-dom"; 
import { useBranchStore, } from "../../branches/store/branchStore"; 
import { useCompanyStore, } from "../../companies/store/companyStore"; 
import { ExpensesGridCard, } from "../components/ExpensesGridCard"; 
import type { Expense, ExpenseFormValues } from "../types/expense";
import axios from "axios";

import { OpenCashSessionSelect } from "../../cash/components/OpenCashSessionSelect";
import { getCashSessions } from "../../cash/services/cashService";

import { showSuccessAlert, showErrorAlert } from "../../../shared/alerts/appAlerts";
import { ExpenseFormDialog, } from "../components/ExpenseFormDialog";
import { getSuppliers, } from "../../purchases/suppliers/services/supplierService";
import Swal from "sweetalert2";

type SaveExpenseVariables = {
  expenseId: string | null;
  values: ExpenseFormValues;
};

export function ExpensesPage() {

    const queryClient = useQueryClient();
    const selectedCompany = useCompanyStore( (state) => state.selectedCompany, );
    const selectedBranch = useBranchStore( (state) => state.selectedBranch, );
    const [search, setSearch] = useState("");

    const [
        debouncedSearch,
        setDebouncedSearch,
    ] = useState("");

    const [
        paginationModel,
        setPaginationModel,
    ] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });


    const openCashSessionsQuery = useQuery({
        queryKey: [
            "cash-sessions",
            "expense",
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


    /*
    * Búsqueda con debounce.
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
    * Reinicia paginación
    * al cambiar de empresa.
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
    ]);


    /*
    * Reinicia paginación
    * al cambiar de sucursal.
    */
    useEffect(() => {
        setPaginationModel(
        (current) => ({
            ...current,
            page: 0,
        }),
        );
    }, [
        selectedBranch?.id,
    ]);

    const [
        isExpenseDialogOpen,
        setIsExpenseDialogOpen,
    ] = useState(false);

    const [
        formError,
        setFormError,
    ] = useState<string | null>(null,);

    const [ editingExpenseId, setEditingExpenseId, ] = useState<string | null>( null, );

    const isEditing = editingExpenseId !== null;

    const categoriesQuery = useQuery({
        queryKey: [
            "expense-categories",
            selectedCompany?.id,
        ],

        queryFn: () => {
            if (!selectedCompany) {
                throw new Error( "No existe una empresa seleccionada.", );
            }

            return getExpenseCategories({
                companyId: selectedCompany.id, 
                isActive: true, 
                page: 1, 
                pageSize: 100,
            });
        },

        enabled: Boolean( selectedCompany?.id, ) && isExpenseDialogOpen,
    });

    const expenseCategories = categoriesQuery.data?.results ?? []; 

    const suppliersQuery = useQuery({
        queryKey: [
            "expense-suppliers",
            selectedCompany?.id,
        ],

        queryFn: () => {
            if (!selectedCompany) {
                throw new Error( "No existe una empresa seleccionada.", );
            }

            return getSuppliers({
                companyId: selectedCompany.id, 
                isActive: true, 
                page: 1, 
                pageSize: 100, 
                ordering: "name",
            });
        },

        enabled: Boolean( selectedCompany?.id, ) && isExpenseDialogOpen,
    });

    const expenseDetailQuery =
        useQuery({
            queryKey: [
            "expense-detail",
            editingExpenseId,
        ],

        queryFn: () => getExpense( editingExpenseId!, ),

        enabled: isExpenseDialogOpen && Boolean( editingExpenseId, ),
    });

    const expenseInitialValues = useMemo< ExpenseFormValues | undefined >(() => {
        const expense =
        expenseDetailQuery.data;

        if (!expense) {
        return undefined;
        }

        return {
        category_id:
            expense.category_id,

        supplier_id:
            expense.supplier_id ??
            "",

        description:
            expense.description ??
            "",

        amount:
            expense.amount ?? "",

        expense_date:
            expense.expense_date,

        payment_method:
            expense.payment_method,

        reference:
            expense.reference ?? "",

        notes:
            expense.notes ?? "",
        };
    }, [
        expenseDetailQuery.data,
    ]);


    const suppliers = suppliersQuery.data?.results ?? [];

    const saveExpenseMutation = useMutation< Expense, Error, SaveExpenseVariables >({
        mutationFn: ({ expenseId, values, }) => {
            if (!selectedCompany) {
                throw new Error( "No existe una empresa seleccionada.", );
            }

            if (!selectedBranch) {
                throw new Error( "No existe una sucursal seleccionada.", );
            }

            const payload = {
                category_id: values.category_id, 
                supplier_id: values.supplier_id || null, 
                description: values.description.trim(), 
                amount: values.amount, 
                expense_date: values.expense_date, 
                payment_method: values.payment_method, 
                reference: values.reference.trim(), 
                notes: values.notes.trim(),
            };

            if (expenseId) {
                return updateExpense( expenseId, payload, );
            }

            return createExpense({
                company_id: selectedCompany.id,
                branch_id: selectedBranch.id,
                ...payload,
            });
        },

        onSuccess: async ( savedExpense, variables, ) => {
        const wasEditing = variables.expenseId !== null; 
        setFormError(null); 
        setIsExpenseDialogOpen( false, ); 
        setEditingExpenseId( null, );

        if (!wasEditing) {
            setPaginationModel(
                (current) => ({
                    ...current,
                    page: 0,
                }),
            );
        }

        await queryClient.invalidateQueries({
            queryKey: [
                "expenses",
                selectedCompany?.id,
                selectedBranch?.id,
            ],
        });

        if (variables.expenseId) {
            queryClient.removeQueries({
                queryKey: [
                    "expense-detail",
                    variables.expenseId,
                ],
            });
        }

        void showSuccessAlert({
            title:
            wasEditing
                ? "Gasto actualizado correctamente"
                : "Gasto guardado correctamente",

            text:
            wasEditing
                ? `Los cambios de "${savedExpense.description}" se guardaron correctamente.`
                : `"${savedExpense.description}" fue registrado como borrador.`,
        });
        },

        onError: ( error, variables, ) => {
        setFormError(
            getApiErrorMessage(
                error, 
                variables.expenseId
                    ? "No fue posible actualizar el gasto."
                    : "No fue posible crear el gasto.",
                ),
            );
        },
    });

    type CompleteExpenseMutationVariables = {
        expense: Expense;
        cashSessionId?: string;
    };

    const completeExpenseMutation = useMutation<Expense, Error, CompleteExpenseMutationVariables>({
        mutationFn: ({ expense, cashSessionId }) => {
            return completeExpense(expense.id, cashSessionId);
        },

        onSuccess: async (completedExpense) => {
            await Promise.all([
            queryClient.invalidateQueries({
                queryKey: [
                "expenses",
                selectedCompany?.id,
                selectedBranch?.id,
                ],
            }),

            queryClient.invalidateQueries({
                queryKey: ["cash-movements"],
            }),

            queryClient.invalidateQueries({
                queryKey: ["cash-session-summary"],
            }),
            ]);

            queryClient.removeQueries({
            queryKey: [
                "expense-detail",
                completedExpense.id,
            ],
            });

            void showSuccessAlert({
            title: "Gasto completado",
            text: `"${completedExpense.description}" fue completado correctamente.`,
            });
        },

        onError: (error) => {
            void showErrorAlert({
            title: "No fue posible completar el gasto",
            text: getApiErrorMessage(
                error,
                "Ocurrió un error al completar el gasto.",
            ),
            });
        },
    });

    const cancelExpenseMutation = useMutation< Expense, Error, Expense >({
        mutationFn: (expense) => cancelExpense( expense.id, ),

        onSuccess: async ( cancelledExpense, ) => {
            await queryClient.invalidateQueries({
                queryKey: [
                    "expenses",
                    selectedCompany?.id,
                    selectedBranch?.id,
                ],
            });

            queryClient.removeQueries({
                queryKey: [
                "expense-detail",
                cancelledExpense.id,
                ],
            });

            void showSuccessAlert({
                title: "Gasto cancelado", 
                text:
                `"${cancelledExpense.description}" fue cancelado correctamente.`,
            });
        },

        onError: (error) => {
            void showErrorAlert({
                title:
                "No fue posible cancelar el gasto",

                text:
                getApiErrorMessage(
                    error,
                    "Ocurrió un error al cancelar el gasto.",
                ),
            });
        },
    });

    const handleOpenCreate = () => {
        setEditingExpenseId(null);
        setFormError(null);
        setIsExpenseDialogOpen( true, );
    };

    const handleCloseDialog = () => {
        if ( saveExpenseMutation.isPending ) {
            return;
        }

        setIsExpenseDialogOpen( false, ); 
        setEditingExpenseId( null, ); 
        setFormError(null);
    };

    /*
    * Listado de gastos.
    */
    const {
        data: expensesResponse,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useQuery({
        queryKey: [
        "expenses",
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

        return getExpenses({
            companyId:
            selectedCompany.id,

            branchId:
            selectedBranch.id,

            search:
            debouncedSearch ||
            undefined,

            page:
            paginationModel.page + 1,

            pageSize:
            paginationModel.pageSize,

            ordering:
            "-expense_date",
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


    const expenses =
        expensesResponse?.results ?? [];

    const totalExpenses =
        expensesResponse?.count ?? 0;


    /*
    * Formateador de moneda
    * según la empresa seleccionada.
    */
    const currencyFormatter =
        useMemo(() => {
        return new Intl.NumberFormat(
            "es-GT",
            {
            style: "currency",

            currency:
                selectedCompany
                ?.currency ??
                "GTQ",

            minimumFractionDigits: 2,
            },
        );
        }, [
        selectedCompany?.currency,
        ]);


    const formatCurrency =
        useCallback(
        (value: string) => {
            const numberValue =
            Number(value);

            if (
            Number.isNaN(
                numberValue,
            )
            ) {
            return value;
            }

            return currencyFormatter
            .format(numberValue);
        },
        [
            currencyFormatter,
        ],
        );


    /*
    * Estas acciones las conectaremos
    * al formulario y mutations
    * en el siguiente paso.
    */
     const handleEditExpense = ( expense: Expense, ) => {
        setFormError(null); 
        setEditingExpenseId( expense.id, ); 
        setIsExpenseDialogOpen( true, );
    };


    const handleCompleteExpense = async (expense: Expense) => {
        if (expense.payment_method === "CASH") {
            if (!selectedCompany || !selectedBranch) {
            void showErrorAlert({
                title: "No fue posible completar el gasto",
                text: "No hay una empresa o sucursal seleccionada.",
            });

            return;
            }

            try {
            const response = await getCashSessions({
                companyId: selectedCompany.id,
                branchId: selectedBranch.id,
                status: "OPEN",
                ordering: "-opened_at",
                page: 1,
                pageSize: 100,
            });

            const openCashSessions = response.results;

            if (openCashSessions.length === 0) {
                void Swal.fire({
                title: "No hay cajas abiertas",
                text: "Debes abrir una caja antes de completar un gasto en efectivo.",
                icon: "warning",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#064A57",
                });

                return;
            }

            const cashSessionOptions = Object.fromEntries(
                openCashSessions.map((session) => [
                session.id,
                `${session.cash_register_name} (${session.cash_register_code})`,
                ]),
            );

            const result = await Swal.fire({
                title: "¿Completar gasto?",
                text: `Selecciona la caja de donde saldrá el efectivo para "${expense.description}".`,
                icon: "question",
                input: "select",
                inputOptions: cashSessionOptions,
                inputPlaceholder: "Selecciona una caja",
                showCancelButton: true,
                confirmButtonText: "Sí, completar",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                confirmButtonColor: "#064A57",
                inputValidator: (value) => {
                if (!value) {
                    return "Debes seleccionar una caja.";
                }

                return null;
                },
            });

            if (!result.isConfirmed) {
                return;
            }

            completeExpenseMutation.mutate({
                expense,
                cashSessionId: result.value,
            });

            return;
            } catch (error) {
            void showErrorAlert({
                title: "No fue posible consultar las cajas",
                text: getApiErrorMessage(
                error,
                "Ocurrió un error al consultar las cajas abiertas.",
                ),
            });

            return;
            }
        }

        const result = await Swal.fire({
            title: "¿Completar gasto?",
            text: `El gasto "${expense.description}" quedará confirmado y ya no podrá editarse.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, completar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            confirmButtonColor: "#064A57",
        });

        if (!result.isConfirmed) {
            return;
        }

        completeExpenseMutation.mutate({
            expense,
        });
    };


    const handleCancelExpense = async ( expense: Expense, ) => {
        const result = await Swal.fire({
            title: "¿Cancelar gasto?",
            text: `El gasto "${expense.description}" quedará cancelado.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cancelar gasto",
            cancelButtonText: "Volver",
            reverseButtons: true,
            confirmButtonColor: "#064A57"

        });

        if (!result.isConfirmed) {
            return;
        }

        cancelExpenseMutation.mutate( expense, );
    };


    if (!selectedCompany) {
        return ( <Navigate to="/companies"  replace />  );
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
                    sx={{
                        fontSize: {
                        xs: "1.65rem",
                        sm: "1.85rem",
                        },
                        fontWeight: 700,
                        mb: 0.4,
                    }}
                >
                   Gastos
                </Typography>

                <Typography
                    sx={{
                    color:
                        "text.secondary",

                    fontSize:
                        "0.9rem",
                    }}
                >
                    Administra los gastos
                    de{" "}
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
                    disabled
                    startIcon={
                    <FileUploadOutlined />
                    }
                    sx={{
                    borderRadius:
                        "5px",

                    bgcolor:
                        "#FFFFFF",
                    }}
                >
                    Importar
                </Button>

                <Button
                    type="button"
                    variant="outlined"
                    disabled
                    startIcon={
                    <FileDownloadOutlined />
                    }
                    sx={{
                    borderRadius:
                        "5px",

                    bgcolor:
                        "#FFFFFF",
                    }}
                >
                    Exportar
                </Button>

                <Button
                    type="button"
                    variant="contained"
                    onClick={handleOpenCreate}
                    startIcon={
                        <AddRounded />
                    }
                    sx={{
                    borderRadius:
                        "5px",
                    }}
                >
                    Nuevo gasto
                </Button>
                </Stack>
            </Stack>


            {!selectedBranch && (
                <Alert severity="warning">
                Selecciona una sucursal
                para consultar los gastos.
                </Alert>
            )}


            {isError && (
                <Alert severity="error">
                No fue posible cargar
                los gastos.
                </Alert>
            )}


            {!isError && selectedBranch && (
                <Paper
                    variant="outlined"
                    sx={{
                        width: "100%",

                        bgcolor: "#FFFFFF",

                        borderRadius: "15px",

                        borderColor: "divider",

                        overflow: "hidden",
                    }}
                >
                    <ExpensesGridCard
                        expenses={ expenses } 
                        totalExpenses={ totalExpenses } 
                        loading={ 
                            isLoading || 
                            isFetching || 
                            completeExpenseMutation.isPending ||
                            cancelExpenseMutation.isPending 
                        }
                        search={ search } 
                        paginationModel={ paginationModel } 
                        onSearchChange={ setSearch } 
                        onPaginationModelChange={ setPaginationModel } 
                        onRefresh={() => { void refetch(); }} 
                        onEdit={ handleEditExpense } 
                        onComplete={ handleCompleteExpense } 
                        onCancel={ handleCancelExpense } 
                        formatCurrency={ formatCurrency }
                    />
                </Paper>
            )}

            <ExpenseFormDialog
                open={ isExpenseDialogOpen } 
                title={
                    isEditing
                    ? "Editar gasto"
                    : "Nuevo gasto"
                }

                submitLabel={
                    isEditing
                    ? "Guardar cambios"
                    : "Guardar gasto"
                }

                initialValues={
                    isEditing
                    ? expenseInitialValues
                    : undefined
                }

                categories={ expenseCategories } 
                suppliers={ suppliers } 
                isSubmitting={ saveExpenseMutation.isPending } 
                isLoadingOptions={ categoriesQuery.isLoading || suppliersQuery.isLoading } 
                isLoadingExpense={ isEditing && expenseDetailQuery.isLoading } 
                submitError={ formError } 
                onClose={ handleCloseDialog } 
                onSubmit={(values) => {
                    setFormError(null);

                    if ( isEditing && !expenseDetailQuery.data ) {
                        setFormError( "No fue posible cargar la información del gasto.", );

                        return;
                    }

                    saveExpenseMutation.mutate({ expenseId: editingExpenseId, values, });
                }}
            />
        </Stack>
    );
}

function getApiErrorMessage( error: unknown, fallbackMessage: string, ): string {
  if ( !axios.isAxiosError(error) ) {
    return fallbackMessage;
  }

  const messages = flattenErrorMessages( error.response?.data, );

  if ( messages.length === 0 ) {
    return fallbackMessage;
  }

  return messages.join(" ");
}


function flattenErrorMessages( value: unknown, ): string[] {
  if ( typeof value === "string" ) {
    return [value];
  }

  if (
    Array.isArray(value)
  ) {
    return value.flatMap(
      flattenErrorMessages,
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.values(
      value,
    ).flatMap(
      flattenErrorMessages,
    );
  }

  return [];
}