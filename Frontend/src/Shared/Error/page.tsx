import React from "react";

export default function ErrorWidget({
    message = "Hệ thống đang lỗi. Vui lòng thử lại sau!"
}: {
    message?: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-3 bg-white p-5 rounded-2xl shadow-lg max-w-xs text-center">

                <svg
                    className="w-12 h-12 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>

                <div className="text-sm font-medium text-gray-700">{message}</div>


                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        </div>
    );
}
