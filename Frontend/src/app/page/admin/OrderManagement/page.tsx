"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import axios from "axios";
import { GET_ALL_ORDERS } from "@/app/graphQL/queries";
import { AppSidebar } from "@/app/page/admin/components/Slider";
import AdminNavbar from "@/app/page/admin/components/admin-navbar";

type Order = {
    id: number;
    totalAmount: number;
    status: string;
    stripePaymentId: string;
    createdAt: string;
    user_email: string;
};

type OrdersResponse = {
    getAllOrders: {
        orders: Order[];
        total: number;
        page: number;
        limit: number;
    };
};

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const [ordersData, setOrdersData] = useState<Order[]>([]);
    const [isRefundModalOpen, setRefundModalOpen] = useState(false);
    const [selectedPaymentIntentId, setSelectedPaymentIntentId] = useState<string>("");

    const limit = 5;

    const { data, loading, error } = useQuery<OrdersResponse>(GET_ALL_ORDERS, {
        variables: { page, limit },
    });

    useEffect(() => {
        if (data?.getAllOrders?.orders) {
            setOrdersData(data.getAllOrders.orders);
        }
    }, [data]);

    if (loading) return <p className="p-6">Loading...</p>;
    if (error) return <p className="p-6 text-red-600">Error: {error.message}</p>;

    const total = data?.getAllOrders.total ?? 0;
    const totalPages = Math.ceil(total / limit);


    const handleRefundSubmit = async (data: { paymentIntentId: string; reason?: string }) => {
        try {
            const res = await axios.post("http://localhost:8000/payment/refund", data);

            if (res.data.success) {
            
                setOrdersData((prev) =>
                    prev.map((order) =>
                        order.stripePaymentId === data.paymentIntentId
                            ? { ...order, status: "REFUNDED" }
                            : order
                    )
                );

                alert("Refund successful!");
            } else {
                alert(`Refund failed: ${res.data.message}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Refund failed: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="p-6 flex w-full">
            
            <div className="w-64">
                <AppSidebar />
            </div>

            
            <div className="flex-1 w-full">

                <div className="h-14 border-b">
                    <AdminNavbar />
                </div>

                <h1 className="text-2xl font-bold mb-4 mt-6">Orders</h1>

                <div className="overflow-x-auto rounded-xl shadow bg-white">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersData.map((order) => (
                                <tr key={order.id} className="border-b hover:bg-gray-50 text-sm">
                                    <td className="p-3 font-medium">{order.id}</td>
                                    <td className="p-3">{order.user_email ?? "N/A"}</td>
                                    <td className="p-3">${order.totalAmount.toFixed(2)}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${order.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : order.status === "COMPLETED"
                                                        ? "bg-green-100 text-green-600"
                                                        : order.status === "REFUNDED"
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedPaymentIntentId(order.stripePaymentId);
                                                setRefundModalOpen(true);
                                            }}
                                            disabled={order.status === "refunded"}
                                            className={`px-3 py-1 text-sm rounded font-medium transition ${order.status === "REFUNDED"
                                                    ? "bg-blue-600 text-gray-500 cursor-not-allowed"
                                                    : "bg-gray-300 text-white cursor-pointer"
                                                }`}
                                        >
                                            {order.status === "REFUNDED" ? "Refunded" : "Refund"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm border p-2">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="px-4 py-2 border rounded bg-gray-50 hover:bg-gray-100"
                    >
                        Next
                    </button>
                </div>

                {/* Refund Modal */}
                {isRefundModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white rounded-lg p-6 w-[420px] shadow-lg relative h-[420px]">
                            <h2 className="text-xl font-bold mb-4 text-center">Refund Payment</h2>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const paymentIntentId = form.paymentIntentId.value.trim();
                                    const reason = form.reason.value;
                                    if (!paymentIntentId) {
                                        alert("Payment Intent ID is required");
                                        return;
                                    }

                                    await handleRefundSubmit({ paymentIntentId, reason });
                                    setRefundModalOpen(false);
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Payment Intent ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="paymentIntentId"
                                        defaultValue={selectedPaymentIntentId}
                                        readOnly
                                        className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Reason</label>
                                    <select
                                        name="reason"
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="requested_by_customer">Requested by customer</option>
                                        <option value="duplicate">Duplicate</option>
                                        <option value="fraudulent">Fraudulent</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setRefundModalOpen(false)}
                                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 text-gray-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                                    >
                                        Confirm Refund
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
