export type Category = {
  id: string;
  name: string;
  parent_name: string | null;
  is_active: boolean;
};

export type CategorySummary = {
  id: string;
  name: string;
  is_active: boolean;
};

export type CategoryDetail = {
  id: string;
  company_id: string;
  name: string;
  description: string;
  parent: CategorySummary | null;
  children: CategorySummary[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
};

export type CategoryFormValues = {
  name: string;
  description: string;
  parent_id: string;
  is_active: boolean;
};

export type CreateCategoryPayload = {
  company_id: string;
  name: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
};

export type UpdateCategoryPayload = {
  name?: string;
  description?: string;
  parent_id?: string | null;
  is_active?: boolean;
};

export type CategoriesParams = {
  companyId: string;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  ordering?: string;
  page?: number;
  pageSize?: number;
};