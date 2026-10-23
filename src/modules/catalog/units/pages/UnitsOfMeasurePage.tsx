import {
    AddRounded,
    SearchRounded,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";

import type { GridPaginationModel } from "@mui/x-data-grid";

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"; 
import {
    useEffect,
    useState,
} from "react";

import { useCompanyStore } from "../../../companies/store/companyStore";

import {
    showErrorAlert,
    showSuccessAlert,
} from "../../../../shared/alerts/appAlerts";

import { getApiErrorMessage } from "../../../../shared/utils/getApiErrorMessage";

import { UnitOfMeasureFormDialog } from "../components/UnitOfMeasureFormDialog";
import { UnitsOfMeasureGridCard } from "../components/UnitsOfMeasureGridCard";

import {
    createUnitOfMeasure,
    getUnitOfMeasure,
    getUnitsOfMeasure,
    updateUnitOfMeasure,
} from "../services/unitService";

import type {
    UnitOfMeasure,
    UnitOfMeasureDetail,
    UnitOfMeasureFormValues,
} from "../types/units";

export function UnitsOfMeasurePage() {
    const queryClient = useQueryClient();

    const selectedCompany = useCompanyStore(
        (state) => state.selectedCompany,
    );

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [editingUnit, setEditingUnit] = useState<UnitOfMeasureDetail | null>(null);

    const [formError, setFormError] = useState<string | null>(null);

    const [loadingUnitDetail, setLoadingUnitDetail] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search);

            setPaginationModel((current) => ({
                ...current,
                page: 0,
            }));
        }, 400);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [search]);

    useEffect(() => {
        setPaginationModel((current) => ({
            ...current,
            page: 0,
        }));
    }, [selectedCompany?.id]);

    const unitsQuery = useQuery({
        queryKey: [
            "units-of-measure",
            selectedCompany?.id,
            debouncedSearch,
            paginationModel.page,
            paginationModel.pageSize,
        ],
        queryFn: () => getUnitsOfMeasure({
            companyId: selectedCompany!.id,
            search: debouncedSearch || undefined,
            page: paginationModel.page + 1,
            pageSize: paginationModel.pageSize,
        }),
        enabled: Boolean(selectedCompany?.id),
        placeholderData: keepPreviousData,
    });

    const units = unitsQuery.data?.results ?? [];
    const totalUnits = unitsQuery.data?.count ?? 0;

    const createUnitMutation = useMutation({
        mutationFn: (values: UnitOfMeasureFormValues) => {
            if (!selectedCompany) {
                throw new Error("No hay empresa seleccionada.");
            }

            return createUnitOfMeasure({
                company_id: selectedCompany.id,
                name: values.name,
                symbol: values.symbol,
                unit_type: values.unit_type,
                allows_decimal: values.allows_decimal,
                is_active: values.is_active,
            });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["units-of-measure"],
            });

            setIsDialogOpen(false);
            setEditingUnit(null);
            setFormError(null);

            await showSuccessAlert({
                title: "Unidad de medida creada correctamente.",
            });
        },

        onError: (error) => {
            setFormError(
                getApiErrorMessage(
                    error,
                    "No fue posible crear la unidad de medida.",
                ),
            );
        },
    });

    const updateUnitMutation = useMutation({
        mutationFn: ({
            id,
            values,
        }: {
            id: string;
            values: UnitOfMeasureFormValues;
        }) => {
            return updateUnitOfMeasure(id, {
                name: values.name,
                symbol: values.symbol,
                unit_type: values.unit_type,
                allows_decimal: values.allows_decimal,
                is_active: values.is_active,
            });
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["units-of-measure"],
            });

            setIsDialogOpen(false);
            setEditingUnit(null);
            setFormError(null);

            await showSuccessAlert({
                title: "Unidad de medida actualizada correctamente.",
            });
        },

        onError: (error) => {
            setFormError(
                getApiErrorMessage(
                    error,
                    "No fue posible actualizar la unidad de medida.",
                ),
            );
        },
    });

    const handleCreateUnit = () => {
        setEditingUnit(null);
        setFormError(null);
        setIsDialogOpen(true);
    };

    const handleEditUnit = async (unit: UnitOfMeasure) => {
        setFormError(null);
        setLoadingUnitDetail(true);

        try {
            const unitDetail = await getUnitOfMeasure(unit.id);

            setEditingUnit(unitDetail);
            setIsDialogOpen(true);
        } catch (error) {
            await showErrorAlert({
                title: "No fue posible cargar la unidad",
                text: getApiErrorMessage(
                    error,
                    "No fue posible cargar la información de la unidad de medida.",
                ),
            });
        } finally {
            setLoadingUnitDetail(false);
        }
    };

    const handleCloseDialog = () => {
        if (
            createUnitMutation.isPending ||
            updateUnitMutation.isPending
        ) {
            return;
        }

        setIsDialogOpen(false);
        setEditingUnit(null);
        setFormError(null);
    };

    const handleSubmitUnit = (values: UnitOfMeasureFormValues) => {
        setFormError(null);

        if (editingUnit) {
            updateUnitMutation.mutate({
                id: editingUnit.id,
                values,
            });

            return;
        }

        createUnitMutation.mutate(values);
    };

    const unitInitialValues: UnitOfMeasureFormValues | undefined =
        editingUnit
            ? {
                name: editingUnit.name,
                symbol: editingUnit.symbol,
                unit_type: editingUnit.unit_type,
                allows_decimal: editingUnit.allows_decimal,
                is_active: editingUnit.is_active,
            }
            : undefined;

    const isSubmitting =
        createUnitMutation.isPending ||
        updateUnitMutation.isPending;

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
                        Unidades de medida
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: "0.875rem",
                        }}
                    >
                        Administra las unidades utilizadas para medir y vender tus productos.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={ <AddRounded /> }
                    onClick={ handleCreateUnit }
                    disabled={ !selectedCompany }
                    sx={{
                        borderRadius: "5px",
                        width: {
                            xs: "100%",
                            md: "auto",
                        },
                        whiteSpace: "nowrap",
                    }}
                >
                    Nueva unidad
                </Button>
            </Box>

            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <TextField
                    value={ search }
                    onChange={(event) => {
                        setSearch(event.target.value);
                    }}
                    placeholder="Buscar por nombre o símbolo..."
                    size="small"
                    sx={{
                        width: {
                            xs: "100%",
                            sm: 380,
                        },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "5px",
                            bgcolor: "#FFFFFF",
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded
                                        sx={{
                                            color: "text.secondary",
                                        }}
                                    />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>
            {unitsQuery.isError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        borderRadius: "5px",
                    }}
                >
                    {getApiErrorMessage(
                        unitsQuery.error,
                        "No fue posible cargar las unidades de medida.",
                    )}
                </Alert>
            )}

            {!unitsQuery.isError && (
                <UnitsOfMeasureGridCard
                    units={ units }
                    totalUnits={ totalUnits }
                    loading={
                        unitsQuery.isLoading ||
                        unitsQuery.isFetching ||
                        loadingUnitDetail
                    }
                    search={ search }
                    paginationModel={ paginationModel }
                    onPaginationModelChange={ setPaginationModel }
                    onEdit={ handleEditUnit }
                />
            )}

            <UnitOfMeasureFormDialog
                open={ isDialogOpen }
                title={ editingUnit ? "Editar unidad de medida" : "Nueva unidad de medida" }
                submitLabel={ editingUnit ? "Guardar cambios" : "Guardar" }
                initialValues={ unitInitialValues }
                isSubmitting={ isSubmitting }
                error={ formError }
                onClose={ handleCloseDialog }
                onSubmit={ handleSubmitUnit }
            />
        </Box>
    );
}