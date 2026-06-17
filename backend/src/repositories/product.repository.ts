import { pool } from "../config/database";
import { PaginatedResult, Product } from "../types";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validator";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export const productRepository = {
  async list(params: ListParams): Promise<PaginatedResult<Product>> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (params.search) {
      values.push(`%${params.search}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }
    if (params.category) {
      values.push(params.category);
      conditions.push(`category = $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (params.page - 1) * params.limit;

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM products ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    values.push(params.limit, offset);
    const dataResult = await pool.query<Product>(
      `SELECT * FROM products ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    return {
      items: dataResult.rows,
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  },

  async findById(id: number): Promise<Product | null> {
    const { rows } = await pool.query<Product>("SELECT * FROM products WHERE id = $1", [id]);
    return rows[0] ?? null;
  },

  async create(input: CreateProductInput, createdBy: number): Promise<Product> {
    const { rows } = await pool.query<Product>(
      `INSERT INTO products (name, description, category, price, stock, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.name, input.description ?? null, input.category ?? null, input.price, input.stock, createdBy]
    );
    return rows[0];
  },

  async update(id: number, input: UpdateProductInput): Promise<Product | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const fieldMap: Record<string, unknown> = {
      name: input.name,
      description: input.description,
      category: input.category,
      price: input.price,
      stock: input.stock,
    };

    for (const [key, value] of Object.entries(fieldMap)) {
      if (value !== undefined) {
        values.push(value);
        fields.push(`${key} = $${values.length}`);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const { rows } = await pool.query<Product>(
      `UPDATE products SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return rows[0] ?? null;
  },

  async remove(id: number): Promise<boolean> {
    const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  },
};
