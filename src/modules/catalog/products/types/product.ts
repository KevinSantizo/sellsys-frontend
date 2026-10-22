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
  current_stock: string;
};

export type GetProductsParams = {
  companyId: string;
  branchId?: string;
  search?: string;
  page: number;
  pageSize: number;
  isActive?: boolean;
  categoryId?: string;
  brandId?: string;
  productType?: ProductType;
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
  package_quantity: string;
  package_unit_id: string;
  content_quantity: string;
  content_unit_id: string;
  cost_price: string;
  sale_price: string;
  track_inventory: boolean;
  is_active: boolean;
  initial_stock: string;
};

export type PaginatedProductsResponse = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: Product[];
};

export type CreateProductPayload = {
  company_id: string;
  branch_id: string | null;

  name: string;
  description: string;
  sku: string;
  barcode: string | null;
  product_type: ProductType;

  category_id: string | null;
  brand_id: string | null;
  base_unit_id: string | null;

  package_quantity: number | null;
  package_unit_id: string | null;

  content_quantity: string | null;
  content_unit_id: string | null;

  cost_price: string;
  sale_price: string;
  track_inventory: boolean;
  is_active: boolean;

  initial_stock: string;
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

export type CatalogReference = {
  id: string;
  name: string;
};

export type UnitReference = {
  id: string;
  name: string;
  symbol: string;
};

export type ProductDetail = Product & {
  description: string;

  category: CatalogReference | null;
  brand: CatalogReference | null;
  base_unit: UnitReference | null;

  package_quantity: number | null;
  package_unit: UnitReference | null;

  content_quantity: string | null;
  content_unit: UnitReference | null;

  category_id?: string | null;
  brand_id?: string | null;
  base_unit_id?: string | null;
  package_unit_id?: string | null;
  content_unit_id?: string | null;
};

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string | null;
  product_type?: ProductType;

  category_id?: string | null;
  brand_id?: string | null;
  base_unit_id?: string | null;

  package_quantity?: number | null;
  package_unit_id?: string | null;

  content_quantity?: string | null;
  content_unit_id?: string | null;

  cost_price?: string;
  sale_price?: string;
  track_inventory?: boolean;
  is_active?: boolean;
};

export type ProductStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

export type ProductTypeFilter =
  | "ALL"
  | ProductType;