import { apiClient } from "./client";
import { ApiSuccess, PaginatedResult, Product } from "../types";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
}

export const productsApi = {
  async list(params: ProductListParams) {
    const { data } = await apiClient.get<ApiSuccess<PaginatedResult<Product>>>("/products", {
      params,
    });
    return data.data;
  },

  async create(values: ProductFormValues) {
    const { data } = await apiClient.post<ApiSuccess<Product>>("/products", values);
    return data.data;
  },

  async update(id: number, values: Partial<ProductFormValues>) {
    const { data } = await apiClient.put<ApiSuccess<Product>>(`/products/${id}`, values);
    return data.data;
  },

  async remove(id: number) {
    await apiClient.delete(`/products/${id}`);
  },
};
