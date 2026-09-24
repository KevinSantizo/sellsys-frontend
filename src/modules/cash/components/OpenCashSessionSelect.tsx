import {
  MenuItem,
  TextField,
} from "@mui/material";

import type { CashSession } from "../types/cash";


type OpenCashSessionSelectProps = {
  cashSessions: CashSession[];
  value: string;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
};


export function OpenCashSessionSelect({
  cashSessions,
  value,
  loading = false,
  disabled = false,
  error = false,
  helperText,
  onChange,
}: OpenCashSessionSelectProps) {
  return (
    <TextField
      select
      label="Caja"
      value={ value }
      onChange={ (event) => onChange(event.target.value) }
      fullWidth
      disabled={ disabled || loading }
      error={ error }
      helperText={
        helperText ||
        (cashSessions.length === 0 && !loading
          ? "No hay cajas abiertas en esta sucursal."
          : undefined)
      }
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "5px",
        },
      }}
    >
      {cashSessions.map((cashSession) => (
        <MenuItem
          key={ cashSession.id }
          value={ cashSession.id }
        >
          { cashSession.cash_register_name } ({ cashSession.cash_register_code })
        </MenuItem>
      ))}
    </TextField>
  );
}