export type Company = {
  id: string;
  name: string;
  legal_name?: string;
  business_type: string;
  business_type_display: string;
  currency: string;
  timezone?: string;
  is_active: boolean;
};