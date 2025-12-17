"use client";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // icon loading
import { CheckCircle2 } from "lucide-react";

interface ModalSaveProfileProps {
    visible: boolean;
    closeModal: () => void;
    onSave: () => Promise<void>; // Lưu là async
}

export default function ModalSaveProfile({
    visible,
    closeModal,
    onSave,
}: ModalSaveProfileProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (visible) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }
        return () => document.body.classList.remove("overflow-hidden");
    }, [visible]);

    if (!visible) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave();
            setIsSuccess(true);
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[1000]"
            onClick={closeModal}
        >
            <div
                className="relative flex flex-col bg-white rounded-3xl px-8 py-6 w-[90%] max-w-[500px] animate-slide-down"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nút đóng */}
                <button
                    className="text-gray-700 absolute top-4 right-4 hover:text-black transition"
                    onClick={closeModal}
                >
                    <FaTimes size={20} />
                </button>

                {/* Nội dung */}
                <div className="text-center mt-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="text-lg text-gray-700">Saving your profile...</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="flex flex-col items-center space-y-4">
                            <CheckCircle2 className="text-green-600" size={40} />
                            <p className="text-lg font-semibold text-green-700">Saved successfully!</p>
                            <Button
                                className="bg-green-600 text-white hover:bg-green-700 rounded-full px-6"
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-customBlue">
                                Save changes to your profile?
                            </h2>
                            <div className="flex justify-around mt-6">
                                <Button
                                    className="text-gray-800 bg-white border-2 border-blue-500 rounded-full w-28 h-10"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-36 h-10"
                                    onClick={handleSave}
                                >
                                    Save Profile
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
