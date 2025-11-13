"use client";

import { CREATE_BOOK, GET_ALL_BOOKS } from "@/app/graphQL/queries";
import { Book } from "@/app/interfaces/Books.interface";
import AdminNavbar from "@/app/page/admin/components/admin-navbar";
import { AppSidebar } from "@/app/page/admin/components/Slider";
import { useQuery, useMutation } from "@apollo/client/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type BooksResponse = {
  books: {
    data: Book[];
    total: number;
    page: number;
    limit: number;
  };
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);

  const limit = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    thumbnail: "",
    title: "",
    description: "",
    price: "",
    inventory: "",
    authors: "",
  });

  const { data, loading, error, refetch } = useQuery<BooksResponse>(GET_ALL_BOOKS, {
    variables: { page, limit },
    fetchPolicy: "cache-and-network",
  });

  const [createBook, { loading: creating }] = useMutation(CREATE_BOOK);

  if (loading && !data) return <p className="p-6">Loading...</p>;

  if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;

  const books = data?.books.data ?? [];

  const total = data?.books.total ?? 0;

  const totalPages = Math.ceil(total / limit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    try {
      await createBook({
        variables: {
          createBookInput: {
            thumbnail: formData.thumbnail,
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            inventory: parseInt(formData.inventory),
            authors: formData.authors,
          },
        },
      });
      await refetch();
      alert("Thêm sách thành công");
      setIsModalOpen(false);
      setFormData({
        thumbnail: "",
        title: "",
        description: "",
        price: "",
        inventory: "",
        authors: "",
      });
    } catch (err) {
      console.error("Error creating book:", err);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-64">
        <AppSidebar />
      </div>

      <div className="w-full">
        <div className="h-14 border-b">
          <AdminNavbar />
        </div>

        <div className="w-full p-6 overflow-auto bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Products</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-700 text-white cursor-pointer rounded"
            >
              Create Product
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl shadow bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                  <th className="p-3">Thumbnail</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Authors</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Inventory</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-3">
                      <Image
                        src={book.thumbnail || "/images/default.jpg"}
                        alt={book.title}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                      />
                    </td>
                    <td className="p-3">{book.title}</td>
                    <td className="p-3">{book.authors}</td>
                    <td className="p-3">${book.price}</td>
                    <td className="p-3">{book.quantity || 0}</td> {/* Hiển thị tồn kho */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm border p-2">
              {page} / {totalPages}
            </span>

            <div className="flex gap-2">
              {page > 1 && (
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal Create Product --- */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-[420px] shadow-lg relative">
            <h2 className="text-xl font-bold mb-4 text-center">Create Book</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Thumbnail URL</label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  className="border w-full p-2 rounded mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="border w-full p-2 rounded mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Authors</label>
                <input
                  type="text"
                  name="authors"
                  value={formData.authors}
                  onChange={handleChange}
                  className="border w-full p-2 rounded mt-1"
                  placeholder="e.g. Robert C. Martin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="border w-full p-2 rounded mt-1 min-h-[80px]"
                  placeholder="Enter book description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="border w-full p-2 rounded mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Inventory</label>
                <input
                  type="number"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleChange}
                  className="border w-full p-2 rounded mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={creating}
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}