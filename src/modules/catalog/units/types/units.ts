export type UnitType =
  | "UNIT"
  | "WEIGHT"
  | "LENGTH"
  | "VOLUME"
  | "AREA"
  | "TIME"
  | "OTHER";

export type UnitOfMeasure = {
  id: string;
  name: string;
  symbol: string;
  unit_type: UnitType;
  unit_type_display: string;
  allows_decimal: boolean;
  is_active: boolean;
};

export type UnitOfMeasureDetail = {
  id: string;
  company_id: string;
  name: string;
  symbol: string;
  unit_type: UnitType;
  unit_type_display: string;
  allows_decimal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UnitOfMeasureListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: UnitOfMeasure[];
};

export type UnitOfMeasureFormValues = {
  name: string;
  symbol: string;
  unit_type: UnitType;
  allows_decimal: boolean;
  is_active: boolean;
};

export type CreateUnitOfMeasurePayload = {
  company_id: string;
  name: string;
  symbol: string;
  unit_type: UnitType;
  allows_decimal: boolean;
  is_active: boolean;
};

export type UpdateUnitOfMeasurePayload = {
  name?: string;
  symbol?: string;
  unit_type?: UnitType;
  allows_decimal?: boolean;
  is_active?: boolean;
};

export type UnitsOfMeasureParams = {
  companyId: string;
  search?: string;
  unitType?: UnitType;
  allowsDecimal?: boolean;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
};

export const unitTypeOptions = [
  {
    value: "UNIT",
    label: "Unidad",
  },
  {
    value: "WEIGHT",
    label: "Peso",
  },
  {
    value: "LENGTH",
    label: "Longitud",
  },
  {
    value: "VOLUME",
    label: "Volumen",
  },
  {
    value: "AREA",
    label: "Área",
  },
  {
    value: "TIME",
    label: "Tiempo",
  },
  {
    value: "OTHER",
    label: "Otro",
  },
] satisfies {
  value: UnitType;
  label: string;
}[];