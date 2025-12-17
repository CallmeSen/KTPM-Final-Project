"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";

interface ModalSubmitProps {
    invisible: boolean;
    closeModal: () => void;
    onSubmit: () => void;
}

export default function ModalSubmit({
    invisible,
    closeModal,
    onSubmit,
}: ModalSubmitProps) {
    // Ngăn cuộn khi mở modal
    useEffect(() => {
        if (invisible) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        return () => document.body.classList.remove("overflow-hidden");
    }, [invisible]);

    if (!invisible) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[1000]"
            onClick={closeModal} // Click ngoài để đóng
        >
            <div
                className="relative flex flex-col bg-white rounded-3xl px-8 py-6 w-[90%] max-w-[600px] animate-slide-down"
                onClick={(e) => e.stopPropagation()} // Ngăn nổi bọt
            >
                {/* Nút đóng modal */}
                <button
                    className="text-gray-700 absolute top-4 right-4 hover:text-black transition"
                    onClick={closeModal}
                >
                    <FaTimes size={24} />
                </button>

                {/* Hình ảnh */}
                <div className="mx-auto">
                    <Image
                        src="/assets/listeningTest/question-circle-svgrepo-com.svg"
                        alt="Question Icon"
                        height={100}
                        width={100}
                    />
                </div>

                {/* Nội dung */}
                <div className="text-customBlue text-center text-xl mt-4 font-semibold">
                    Are you sure you want to submit?
                </div>

                {/* Nút hành động */}
                <div className="flex justify-around mt-6">
                    <Button
                        className="text-gray-800 bg-customboldWhite border-2 border-customebrightBlue rounded-full w-32 h-10 text-lg"
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-customebrightBlue hover:bg-customebrightBlue/90 text-white font-bold rounded-full h-10 text-lg"
                        onClick={onSubmit}
                    >
                        Submit and Review Answer
                    </Button>
                </div>
            </div>
        </div>
    );
}
