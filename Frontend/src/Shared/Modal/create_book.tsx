import React, { useState } from "react";

interface CreateBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        thumbnail: string;
        title: string;
        price: number;
        inventory: number;
    }) => void;
}

export default function CreateBookModal({
    isOpen,
    onClose,
    onSubmit,
}: CreateBookModalProps) {
    
    const [thumbnail, setThumbnail] = useState("");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [inventory, setInventory] = useState<number>(0);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ thumbnail, title, price, inventory });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Create New Book
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Thumbnail */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thumbnail URL
                        </label>
                        <input
                            type="text"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="https://example.com/book.jpg"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-customBrightBlue"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Book Title"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-customBrightBlue"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            min="0"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-customBrightBlue"
                        />
                    </div>

                    {/* Inventory */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Inventory
                        </label>
                        <input
                            type="number"
                            value={inventory}
                            onChange={(e) => setInventory(Number(e.target.value))}
                            min="0"
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-customBrightBlue"
                        />
                    </div>

                    {/* Buttons */}
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
                            className="px-4 py-2 bg-customBrightBlue text-white rounded-lg hover:bg-blue-600 font-medium"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
