import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  PointOfSaleRounded,
  SearchRounded,
} from "@mui/icons-material";

export function SalesPosPage() {
  return (
    <Box>
      <Stack  
        spacing={2.25}
      >
        <Box>
            <Typography
            variant="h4"
            sx={{
                fontSize: {
                xs: "1.65rem",
                sm: "1.85rem",
                },
                fontWeight: 800,
                mb: 0.4,
            }}
            >
            Nueva venta
            </Typography>

            <Typography
                sx={{
                    color: "text.secondary",
                    fontSize: "0.9rem",
                }}
            >
                Busca productos, agrégalos al
                carrito y registra la venta.
            </Typography>
        </Box>

{/** 
        <Button
          variant="outlined"
          startIcon={
            <PointOfSaleRounded />
          }
          sx={{
            borderRadius: "5px",
          }}
        >
          Historial de ventas
        </Button>
 */}
      </Stack>

      <Grid
        container
        spacing={2}
      >
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: "15px",
            }}
          >
            <CardContent>
              <TextField
                fullWidth
                placeholder={
                  "Buscar por nombre, SKU o código de barras"
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchRounded
                        sx={{
                          mr: 1,
                          color:
                            "text.secondary",
                        }}
                      />
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root":
                    {
                      borderRadius: "15px",
                    },
                }}
              />

              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                }}
              >
                <Typography 
                   sx={{
                        fontWeight: 600,
                    }}
                >
                  Busca un producto para
                  comenzar
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Los resultados aparecerán
                  en esta sección.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: "15px",
            }}
          >
            <CardContent>
              <Typography
                variant="h6" 
                sx={{
                    fontWeight: 600
                }}
              >
                Resumen de venta
              </Typography>

              <Divider
                sx={{
                  my: 2,
                }}
              />

              <Stack spacing={1.5}>
                <Stack 
                  sx={{
                    direction: "row",
                    justifyContent: "space-between"        
                  }}
                >
                  <Typography
                    color="text.secondary"
                  >
                    Subtotal
                  </Typography>

                  <Typography>
                    Q0.00
                  </Typography>
                </Stack>

                <Stack 
                  sx={{
                    direction: "row",
                    justifyContent: "space-between"        
                  }}
                >
                  <Typography
                    color="text.secondary"
                  >
                    Descuento
                  </Typography>

                  <Typography>
                    Q0.00
                  </Typography>
                </Stack>

                <Divider />

                <Stack 
                  sx={{
                    direction: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700
                    }}
                  >
                    Total
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 800
                    }}
                    color="primary.main"
                  >
                    Q0.00
                  </Typography>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled
                  sx={{
                    mt: 2,
                    borderRadius: "15px",
                  }}
                >
                  Cobrar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}