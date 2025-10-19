import React from "react";

export default function CenterLoading({ message = "Đang tải..." }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-3 bg-white/90 p-4 rounded-lg shadow-lg">
                
                <svg className="animate-spin h-32 w-32 text-[#294563]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>

                <div className="text-sm font-medium text-gray-700">{message}</div>
            </div>
        </div>
    );
}
