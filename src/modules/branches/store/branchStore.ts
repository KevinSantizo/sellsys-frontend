import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  Branch,
  CompanyRole,
} from "../types/branch";

type BranchState = {
  availableBranches: Branch[];
  selectedBranch: Branch | null;
  membershipRole: CompanyRole | null;

  setBranchContext: (
    branches: Branch[],
    defaultBranch: Branch,
    role: CompanyRole,
  ) => void;

  setSelectedBranch: (
    branch: Branch,
  ) => void;

  clearBranchContext: () => void;
};

export const useBranchStore =
  create<BranchState>()(
    persist(
      (set) => ({
        availableBranches: [],
        selectedBranch: null,
        membershipRole: null,

        setBranchContext: (
          branches,
          defaultBranch,
          role,
        ) => {
          set({
            availableBranches: branches,
            selectedBranch: defaultBranch,
            membershipRole: role,
          });
        },

        setSelectedBranch: (branch) => {
            set((state) => {
                if (state.membershipRole !== "OWNER") {
                return {};
                }

                const isAvailable = state.availableBranches.some(
                (item) => item.id === branch.id,
                );

                if (!isAvailable) {
                return {};
                }

                return {
                selectedBranch: branch,
                };
            });
        },

        clearBranchContext: () => {
          set({
            availableBranches: [],
            selectedBranch: null,
            membershipRole: null,
          });
        },
      }),
      {
        name: "sellsys-branch",
      },
    ),
  );