"use client";

import React, { useState, useEffect } from "react";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        paymentIntentId: string;
        amount?: number;
        reason?: string;
    }) => void;
    defaultPaymentIntentId?: string;
}

export default function RefundModal({
    isOpen,
    onClose,
    onSubmit,
    defaultPaymentIntentId = "",
}: RefundModalProps) {
    const [paymentIntentId, setPaymentIntentId] = useState(defaultPaymentIntentId);
    const [amount, setAmount] = useState<number | undefined>();
    const [reason, setReason] = useState<string>("requested_by_customer");

    useEffect(() => {
        setPaymentIntentId(defaultPaymentIntentId);
    }, [defaultPaymentIntentId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentIntentId.trim()) {
            alert("Payment Intent ID is required");
            return;
        }
        onSubmit({ paymentIntentId, amount, reason });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    Refund Payment
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Intent ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={paymentIntentId}
                            onChange={(e) => setPaymentIntentId(e.target.value)}
                            placeholder="pi_3P2xxxxx"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Refund Amount (optional)
                        </label>
                        <input
                            type="number"
                            value={amount ?? ""}
                            onChange={(e) =>
                                setAmount(e.target.value ? Number(e.target.value) : undefined)
                            }
                            min="0"
                            placeholder="Enter amount to refund"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
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
                            onClick={onClose}
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
    );
}
