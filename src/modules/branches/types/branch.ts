import type { Company } from "../../companies/types/company";

export type Branch = {
  id: string;
  company_name?: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_main: boolean;
  is_active: boolean;
};

export type CompanyRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "CASHIER"
  | "SELLER"
  | "WAREHOUSE";

export type SessionContext = {
  company: Company;

  membership: {
    id: string;
    role: CompanyRole;
    role_display: string;
  };

  branches: Branch[];
  default_branch: Branch;
};