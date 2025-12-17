    import React from "react";

    export default function Navbar() {
        return (
            <div className="fixed top-0 left-0 w-full bg-customBrightBlue text-white shadow-lg z-20">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Nội dung Navbar */}
                    <div className="text-lg font-semibold">
                        Please select answer!
                    </div>

                    {/* Tùy chọn khác trong Navbar */}
                    <div className="flex items-center gap-4">
                        <button className="bg-white text-customBrightBlue rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-200">
                            Home
                        </button>
                        <button className="bg-white text-customBrightBlue rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-200">
                            Help
                        </button>
                    </div>
                </div>
            </div>
        );
    }
