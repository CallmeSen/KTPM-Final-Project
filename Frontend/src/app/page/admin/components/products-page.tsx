"use client";

import Image from "next/image";

type Product = {
    id: number;
    thumbnail: string;
    title: string;
    status: "Active" | "Inactive";
    price: number;
    inventory: number;
};

const products: Product[] = [
    {
        id: 1,
        thumbnail: "/images/product1.jpg",
        title: "iPhone 15 Pro",
        status: "Active",
        price: 1200,
        inventory: 30,
    },
    {
        id: 2,
        thumbnail: "/images/product2.jpg",
        title: "Samsung Galaxy S23",
        status: "Inactive",
        price: 999,
        inventory: 15,
    },
    {
        id: 3,
        thumbnail: "/images/product3.jpg",
        title: "AirPods Pro",
        status: "Active",
        price: 250,
        inventory: 50,
    },
];

export default function ProductsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <div className="overflow-x-auto rounded-xl shadow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                            <th className="p-3">Thumbnail</th>
                            <th className="p-3">Title</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Inventory</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product.id}
                                className="border-b hover:bg-gray-50 text-sm"
                            >
                                <td className="p-3">
                                    <Image
                                        src={product.thumbnail}
                                        alt={product.title}
                                        width={50}
                                        height={50}
                                        className="rounded-md object-cover"
                                    />
                                </td>
                                <td className="p-3">{product.title}</td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === "Active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {product.status}
                                    </span>
                                </td>
                                <td className="p-3">${product.price}</td>
                                <td className="p-3">{product.inventory}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
