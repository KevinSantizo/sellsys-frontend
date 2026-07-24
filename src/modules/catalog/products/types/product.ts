export type ProductType = "PRODUCT" | "SERVICE";

export type Product = {
  id: string;
  company_name: string;
  name: string;
  description?: string;
  sku: string;
  barcode: string | null;
  product_type: ProductType;
  product_type_display: string;
  category_name: string | null;
  brand_name: string | null;
  base_unit_symbol: string | null;
  cost_price: string;
  sale_price: string;
  track_inventory: boolean;
  is_active: boolean;
};

export type GetProductsParams = {
  companyId: string;
  search?: string;
};

export type ProductFormValues = {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  product_type: ProductType;
  category_id: string;
  brand_id: string;
  base_unit_id: string;
  cost_price: string;
  sale_price: string;
  track_inventory: boolean;
  is_active: boolean;
};

export type CreateProductPayload = {
  company_id: string;
  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  product_type: ProductType;
  category_id: string | null;
  brand_id: string | null;
  base_unit_id: string;
  cost_price: string;
  sale_price: string;
  track_inventory: boolean;
  is_active: boolean;
};

export type CategoryOption = {
  id: string;
  name: string;
  is_active: boolean;
};

export type BrandOption = {
  id: string;
  name: string;
  is_active: boolean;
};

export type UnitOption = {
  id: string;
  name: string;
  symbol: string;
  is_active: boolean;
};