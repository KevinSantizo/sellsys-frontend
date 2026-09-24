export type Brand = {
  id: string;
  name: string;
  is_active: boolean;
};

export type BrandDetail = {
  id: string;
  company_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BrandListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Brand[];
};

export type BrandFormValues = {
  name: string;
  description: string;
  is_active: boolean;
};

export type CreateBrandPayload = {
  company_id: string;
  name: string;
  description: string;
  is_active: boolean;
};

export type UpdateBrandPayload = {
  name?: string;
  description?: string;
  is_active?: boolean;
};

export type BrandsParams = {
  companyId: string;
  search?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
};