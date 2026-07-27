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
  cost_price: string;
  sale_price: string;
  track_inventory: boolean;
  is_active: boolean;
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

  /*
   * Se dejan opcionales por si el backend también
   * devuelve directamente los IDs.
   */
  category_id?: string | null;
  brand_id?: string | null;
  base_unit_id?: string | null;
};

export type UpdateProductPayload = Omit<
  CreateProductPayload,
  "company_id"
>;

export type ProductStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";


export type ProductTypeFilter =
  | "ALL"
  | ProductType;