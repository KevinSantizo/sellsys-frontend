import { createTheme } from "@mui/material/styles";

const PRIMARY_COLOR = "#064A57";
const PRIMARY_DARK = "#043A44";
const PRIMARY_LIGHT = "#E8F3F4";

export const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: PRIMARY_COLOR,
      dark: PRIMARY_DARK,
      light: PRIMARY_LIGHT,
      contrastText: "#FFFFFF",
    },

    background: {
        default: "#FFFFFF",
        paper: "#FFFFFF",
    },

    text: {
      primary: "#1D2428",
      secondary: "#7A848B",
    },

    divider: "#E7ECEB",
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),

    h4: {
      fontWeight: 800,
      letterSpacing: "-0.8px",
    },

    h5: {
      fontWeight: 800,
      letterSpacing: "-0.6px",
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
        color: "primary",
      },

      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          minHeight: 44,
        },
      },
    },

    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },

      styleOverrides: {
        root: {
          backgroundColor: "#FCFCFA",
          borderColor: "#E7ECEB",
          borderRadius: "10px",
          boxShadow: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "none",
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});