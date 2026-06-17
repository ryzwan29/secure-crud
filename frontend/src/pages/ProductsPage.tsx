import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { productsApi, ProductFormValues } from "../api/products.api";
import { extractErrorMessage } from "../api/client";
import { Product } from "../types";
import { useAuth } from "../hooks/useAuth";
import { Button, EmptyState, Input, Spinner } from "../components/ui";
import { Modal } from "../components/ui/Modal";

const emptyForm: ProductFormValues = { name: "", description: "", category: "", price: 0, stock: 0 };

export function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const result = await productsApi.list({ page, limit: 10, search: search || undefined });
      setProducts(result.items);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to load products"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    loadProducts();
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      category: product.category ?? "",
      price: Number(product.price),
      stock: product.stock,
    });
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await productsApi.update(editingId, form);
        toast.success("Product updated successfully");
      } else {
        await productsApi.create(form);
        toast.success("Product added successfully");
      }
      setModalOpen(false);
      loadProducts();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to save product"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await productsApi.remove(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      loadProducts();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to delete product"));
    }
  }

  function canModify(product: Product) {
    return user?.role === "admin" || product.created_by === user?.id;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Products</h1>
          <p className="text-sm text-ink-500">Manage product data — add, edit, delete.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm gap-2">
        <Input
          label="Search products"
          name="search"
          placeholder="Product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="!min-h-[44px]"
        />
        <Button type="submit" variant="secondary" className="mt-7">
          <Search className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-surface-border bg-white shadow-card">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" description="Add your first product." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-subtle text-xs uppercase text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium tabular-nums">Price</th>
                <th className="px-5 py-3 font-medium tabular-nums">Stock</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-3 font-medium text-ink-900">{product.name}</td>
                  <td className="px-5 py-3 text-ink-700">{product.category ?? "—"}</td>
                  <td className="px-5 py-3 tabular-nums text-ink-700">
                    Rp{Number(product.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-ink-700">{product.stock}</td>
                  <td className="px-5 py-3">
                    {canModify(product) ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          aria-label={`Edit ${product.name}`}
                          className="rounded-md p-2 text-ink-500 hover:bg-surface-subtle hover:text-brand-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Delete ${product.name}`}
                          className="rounded-md p-2 text-ink-500 hover:bg-danger-50 hover:text-danger-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-500">Not yours</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          Product <span className="font-medium">{deleteTarget?.name}</span> will be permanently deleted. This
          action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
