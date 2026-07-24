import { create } from "zustand";

import {
  persist,
} from "zustand/middleware";

import type {
  Company,
} from "../types/company";

type CompanyState = {
  selectedCompany: Company | null;

  setSelectedCompany: (
    company: Company,
  ) => void;

  clearSelectedCompany: () => void;
};

export const useCompanyStore =
  create<CompanyState>()(
    persist(
      (set) => ({
        selectedCompany: null,

        setSelectedCompany: (company) => {
          set({
            selectedCompany: company,
          });
        },

        clearSelectedCompany: () => {
          set({
            selectedCompany: null,
          });
        },
      }),
      {
        name: "sellsys-company",
      },
    ),
  );