import {showSuccessAlert,} from "../../../../shared/alerts/appAlerts";

import {
  AddRounded, 
  FileDownloadOutlined,
  FileUploadOutlined, 
} from "@mui/icons-material";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Alert,
  Box,
  Button,
  Paper,
  Stack, 
  Typography, 
} from "@mui/material";

import { 
  type GridPaginationModel,
} from "@mui/x-data-grid";

 
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import { useCompanyStore } from "../../../companies/store/companyStore";

import { createSupplier, getSupplier, getSuppliers, updateSupplier } from "../services/supplierService";

import type { Supplier, SupplierFormValues } from "../types/supplier";
import { SuppliersGridCard } from "../components/SuppliersGridCard";

import { SupplierFormDialog, } from "../components/SupplierFormDialog";
import { getApiErrorMessage } from "../../../../shared/utils/getApiErrorMessage";
type SaveSupplierVariables = {
  supplierId: string | null;
  values: SupplierFormValues;
};

export function SuppliersPage() {

    const queryClient = useQueryClient();
    const selectedCompany = useCompanyStore( (state) => state.selectedCompany, );
    const [search, setSearch] = useState("");
    const [ debouncedSearch, setDebouncedSearch, ] = useState("");
    const [ paginationModel, setPaginationModel, ] = useState<GridPaginationModel>({page: 0, pageSize: 10, });
    const [isSupplierDialogOpen, setIsSupplierDialogOpen, ] = useState(false);
    const [ editingSupplierId, setEditingSupplierId, ] = useState<string | null>(null);
    const isEditing =  editingSupplierId !== null;
    const [ formError, setFormError, ] = useState<string | null>(null,);

    const supplierDetailQuery = useQuery({
        queryKey: [ "supplier-detail", editingSupplierId,], 
        queryFn: () => getSupplier( editingSupplierId!, ), 
        enabled: isSupplierDialogOpen && Boolean( editingSupplierId, ),
    });

    const supplierInitialValues = useMemo< SupplierFormValues | undefined >(() => {
        const supplier =
        supplierDetailQuery.data;

        if (!supplier) {
            return undefined;
        }

        return {
            name: supplier.name ?? "", 
            tax_id: supplier.tax_id ?? "", 
            contact_name: supplier.contact_name ?? "", 
            phone: supplier.phone ?? "", 
            email: supplier.email ?? "", 
            address: supplier.address ?? "", 
            notes: supplier.notes ?? "", 
            is_active: supplier.is_active,
        };
    }, [ supplierDetailQuery.data, ]);

    const supplierDetailError = isEditing && supplierDetailQuery.isError
    ? getApiErrorMessage(
        supplierDetailQuery.error,
        "No fue posible cargar la información del proveedor.",
    )
    : null;
 

    const saveSupplierMutation = useMutation<Supplier, Error, SaveSupplierVariables>
    ({
        mutationFn: ({ supplierId, values, }) => {
            if (!selectedCompany) {
                throw new Error(
                "No existe una empresa seleccionada.",
                );
            }

            const payload = {
                name: values.name.trim(),
                tax_id: values.tax_id.trim(),
                contact_name: values.contact_name.trim(),
                phone: values.phone.trim(),
                email: values.email.trim(),
                address: values.address.trim(),
                notes: values.notes.trim(),
                is_active: values.is_active,
            };

            if (supplierId) {
                return updateSupplier(supplierId, payload,);
            }

            return createSupplier({
                company_id:
                selectedCompany.id, 
                ...payload,
            });
        },

        onSuccess: async ( savedSupplier, variables, ) => {
            const wasEditing = variables.supplierId !== null; 
            setFormError(null); 
            setIsSupplierDialogOpen( false, );

            setEditingSupplierId( null, );

            if (!wasEditing) {
                setPaginationModel(
                (current) => ({
                    ...current,
                    page: 0,
                }),
                );
            }

            await queryClient.invalidateQueries(
                {
                    queryKey: [
                        "suppliers",
                        selectedCompany?.id,
                    ],
                },
            );

            if (variables.supplierId) {
                queryClient.removeQueries({
                    queryKey: [
                        "supplier-detail",
                        variables.supplierId,
                    ],
                });
            }

            void showSuccessAlert({
                title:
                wasEditing
                    ? "Proveedor actualizado correctamente"
                    : "Proveedor guardado correctamente",

                text:
                wasEditing
                    ? `Los cambios de "${savedSupplier.name}" se guardaron correctamente.`
                    : `"${savedSupplier.name}" ya está disponible para utilizarse en compras.`,
            });
        },

        onError: ( error, variables,  ) => {
            setFormError(
                getApiErrorMessage(
                error, 
                variables.supplierId
                    ? "No fue posible actualizar el proveedor."
                    : "No fue posible crear el proveedor.",
                ),
            );
        },
    });

    const handleOpenCreate = () => {
        setEditingSupplierId( null, ); 
        setFormError(null); 
        setIsSupplierDialogOpen( true, );
    };

    const handleCloseDialog = () => {
        if ( saveSupplierMutation.isPending ) {
            return;
        }

        setIsSupplierDialogOpen( false, ); 
        setEditingSupplierId( null, ); 
        setFormError(null);
    };

    const handleEditSupplier = ( supplier: Supplier, ) => {
        setFormError(null); 
        setEditingSupplierId( supplier.id, ); 
        setIsSupplierDialogOpen( true, );
    };

 
    /*
    * Aplica la búsqueda después de 400 ms.
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
        window.clearTimeout(timeoutId);
        };
    }, [search]);


    /*
    * Al cambiar de empresa,
    * regresa a la primera página.
    */
    useEffect(() => {
        setPaginationModel(
        (current) => ({
            ...current,
            page: 0,
        }),
        );
    }, [selectedCompany?.id]);


    /*
    * Listado paginado de proveedores.
    */
    const {
        data: suppliersResponse,
        isLoading,
        isFetching,
        isError,
        error: suppliersError,
        refetch,
    } = useQuery({
        queryKey: [
        "suppliers",
        selectedCompany?.id,
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

        return getSuppliers({
            companyId:
            selectedCompany.id,

            search:
            debouncedSearch ||
            undefined,

            page:
            paginationModel.page + 1,

            pageSize:
            paginationModel.pageSize,

            ordering: "name",
        });
        },

        enabled:
        Boolean(selectedCompany?.id),

        placeholderData: keepPreviousData,
    });


  const suppliers =
    suppliersResponse?.results ?? [];

  const totalSuppliers =
    suppliersResponse?.count ?? 0;





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
            Proveedores
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Administra los proveedores
            de{" "}
            {selectedCompany.name}.
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
                borderRadius: "5px",
                bgcolor: "#FFFFFF",
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
                borderRadius: "5px",
                bgcolor: "#FFFFFF",
            }}
            >
            Exportar
            </Button>

            <Button
                type="button"
                variant="contained"
                startIcon={
                    <AddRounded />
                }
                onClick={handleOpenCreate}
                sx={{ borderRadius: "5px", }}
                >
                Nuevo proveedor
            </Button>
        </Stack>
      </Stack>


      {/* ERROR */}
      {isError && (
            <Alert
                severity="error"
                sx={{
                    borderRadius: "5px",
                }}
            >
                {getApiErrorMessage(
                    suppliersError,
                    "No fue posible cargar los proveedores.",
                )}
            </Alert>
        )}


      {/* LISTADO */}
        {!isError && (
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
                <SuppliersGridCard
                    suppliers={suppliers} 
                    totalSuppliers={ totalSuppliers } 
                    loading={ isLoading || isFetching } 
                    search={search} 
                    paginationModel={ paginationModel }
                    onSearchChange={ setSearch }
                    onPaginationModelChange={ setPaginationModel }
                    onRefresh={() => { void refetch(); }}
                    onEdit={handleEditSupplier}
                />
            </Paper>
        )}

        <SupplierFormDialog
            open={ isSupplierDialogOpen } 
            title={
                isEditing
                ? "Editar proveedor"
                : "Nuevo proveedor"
            }

            submitLabel={
                isEditing
                ? "Guardar cambios"
                : "Guardar proveedor"
            }

            initialValues={
                isEditing
                ? supplierInitialValues
                : undefined
            }

            isSubmitting= { saveSupplierMutation.isPending } 
            isLoadingSupplier={ isEditing && supplierDetailQuery.isLoading } 
            submitError={ formError ?? supplierDetailError } 
            onClose={ handleCloseDialog } 
            onSubmit={(values) => {
                setFormError(null); 
                if ( isEditing && !supplierDetailQuery.data ) {
                    setFormError( "No fue posible cargar la información del proveedor.", ); 
                    return;
                }

                saveSupplierMutation.mutate({ supplierId: editingSupplierId, values, });
            }}
        />
    </Stack>
  );
}