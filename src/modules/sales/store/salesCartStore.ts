import { create } from "zustand";

import type { Product } from "../../catalog/products/types/product";

export type SaleCartItem = {
  product: Product;
  quantity: number;
  discountPercent: number;
};

type SalesCartState = {
  items: SaleCartItem[];

  addProduct: (product: Product) => void;

  increaseQuantity: (
    productId: string,
  ) => void;

  decreaseQuantity: (
    productId: string,
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number,
  ) => void;

  updateDiscount: (
    productId: string,
    discountPercent: number,
  ) => void;

  removeProduct: (
    productId: string,
  ) => void;

  clearCart: () => void;
};

export const useSalesCartStore =
  create<SalesCartState>((set) => ({
    items: [],

    addProduct: (product) => {
      set((state) => {
        const existingItem =
          state.items.find(
            (item) =>
              item.product.id ===
              product.id,
          );

        if (existingItem) {
          return {
            items: state.items.map(
              (item) =>
                item.product.id ===
                product.id
                  ? {
                      ...item,
                      quantity:
                        item.quantity + 1,
                    }
                  : item,
            ),
          };
        }

        return {
          items: [
            ...state.items,
            {
              product,
              quantity: 1,
              discountPercent: 0,
            },
          ],
        };
      });
    },

    increaseQuantity: (
      productId,
    ) => {
      set((state) => ({
        items: state.items.map(
          (item) =>
            item.product.id ===
            productId
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item,
        ),
      }));
    },

    decreaseQuantity: (
      productId,
    ) => {
      set((state) => ({
        items: state.items
          .map((item) =>
            item.product.id ===
            productId
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1,
                }
              : item,
          )
          .filter(
            (item) =>
              item.quantity > 0,
          ),
      }));
    },

    updateQuantity: (
      productId,
      quantity,
    ) => {
      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return;
      }

      set((state) => ({
        items: state.items.map(
          (item) =>
            item.product.id ===
            productId
              ? {
                  ...item,
                  quantity,
                }
              : item,
        ),
      }));
    },

    updateDiscount: (
      productId,
      discountPercent,
    ) => {
      if (
        !Number.isFinite(
          discountPercent,
        )
      ) {
        return;
      }

      const normalizedDiscount =
        Math.min(
          100,
          Math.max(
            0,
            discountPercent,
          ),
        );

      set((state) => ({
        items: state.items.map(
          (item) =>
            item.product.id ===
            productId
              ? {
                  ...item,
                  discountPercent:
                    normalizedDiscount,
                }
              : item,
        ),
      }));
    },

    removeProduct: (
      productId,
    ) => {
      set((state) => ({
        items: state.items.filter(
          (item) =>
            item.product.id !==
            productId,
        ),
      }));
    },

    clearCart: () => {
      set({
        items: [],
      });
    },
  }));

export function roundMoney(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
        100,
    ) / 100
  );
}

export function calculateLineSubtotal(
  item: SaleCartItem,
): number {
  const unitPrice = Number(
    item.product.sale_price,
  );

  if (!Number.isFinite(unitPrice)) {
    return 0;
  }

  return roundMoney(
    unitPrice * item.quantity,
  );
}

export function calculateLineDiscount(
  item: SaleCartItem,
): number {
  const subtotal =
    calculateLineSubtotal(item);

  return roundMoney(
    subtotal *
      (item.discountPercent / 100),
  );
}

export function calculateLineTotal(
  item: SaleCartItem,
): number {
  const subtotal =
    calculateLineSubtotal(item);

  const discount =
    calculateLineDiscount(item);

  return roundMoney(
    subtotal - discount,
  );
}

export function calculateCartSubtotal(
  items: SaleCartItem[],
): number {
  const subtotal = items.reduce(
    (total, item) =>
      total +
      calculateLineSubtotal(item),
    0,
  );

  return roundMoney(subtotal);
}

export function calculateCartDiscount(
  items: SaleCartItem[],
): number {
  const discount = items.reduce(
    (total, item) =>
      total +
      calculateLineDiscount(item),
    0,
  );

  return roundMoney(discount);
}

export function calculateCartTotal(
  items: SaleCartItem[],
): number {
  const total = items.reduce(
    (accumulator, item) =>
      accumulator +
      calculateLineTotal(item),
    0,
  );

  return roundMoney(total);
}