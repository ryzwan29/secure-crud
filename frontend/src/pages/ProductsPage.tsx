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
      toast.error(extractErrorMessage(error, "Gagal memuat produk"));
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
        toast.success("Produk berhasil diperbarui");
      } else {
        await productsApi.create(form);
        toast.success("Produk berhasil ditambahkan");
      }
      setModalOpen(false);
      loadProducts();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal menyimpan produk"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await productsApi.remove(deleteTarget.id);
      toast.success("Produk dihapus");
      setDeleteTarget(null);
      loadProducts();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Gagal menghapus produk"));
    }
  }

  function canModify(product: Product) {
    return user?.role === "admin" || product.created_by === user?.id;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Produk</h1>
          <p className="text-sm text-ink-500">Kelola data produk — tambah, ubah, hapus.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Produk
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm gap-2">
        <Input
          label="Cari produk"
          name="search"
          placeholder="Nama produk..."
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
          <EmptyState title="Belum ada produk" description="Tambahkan produk pertama kamu." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-subtle text-xs uppercase text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nama</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium tabular-nums">Harga</th>
                <th className="px-5 py-3 font-medium tabular-nums">Stok</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
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
                          aria-label={`Ubah ${product.name}`}
                          className="rounded-md p-2 text-ink-500 hover:bg-surface-subtle hover:text-brand-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          aria-label={`Hapus ${product.name}`}
                          className="rounded-md p-2 text-ink-500 hover:bg-danger-50 hover:text-danger-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-500">Bukan milikmu</span>
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
            Sebelumnya
          </Button>
          <span className="text-sm text-ink-500">
            Halaman {page} dari {totalPages}
          </span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Selanjutnya
          </Button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Ubah Produk" : "Tambah Produk"}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Nama Produk"
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Kategori"
            name="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga"
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <Input
              label="Stok"
              name="stock"
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Deskripsi"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus produk?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          Produk <span className="font-medium">{deleteTarget?.name}</span> akan dihapus permanen. Aksi ini tidak
          bisa dibatalkan.
        </p>
      </Modal>
    </div>
  );
}
