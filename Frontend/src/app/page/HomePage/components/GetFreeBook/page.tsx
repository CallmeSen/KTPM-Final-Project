"use client";
import React from "react";
import Image from "next/image";

export default function GetFreeBooks() {

    return (
        <div className="w-full bg-[#FFFFFF] mt-12 flex items-center gap-4 bg-gradient-to-r from-[#FFE5E5] via-[#F5FFFE] to-[#FFE5E5]">

            <Image
                src={"/assets/Books.png"}
                alt={"Free Books"}
                width={300}
                height={300}
                className="rounded-md mb-4 object-cover ml-12"
            />

            <div className="flex flex-col ml-60">
                
                <div className="flex-1 rounded p-4 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#000000]">Get Over 100 Free Books</h2>

                    <p className="text-gray-700 mb-10">
                        Access, read, practice & engage with interactive digital eBook content.
                    </p>

                </div>
                <div className="flex gap-2">

                    <input
                        type="text"
                        placeholder="Enter your email"
                        className="flex-1 p-2 rounded border border-[#FB635D] text-black focus:outline-none focus:ring-2 focus:ring-[#FB635D]"
                    />

                    <button className="px-4 py-2 text-white rounded bg-[#FB635D] cursor-pointer">
                        Sign Up
                    </button>

                </div>

            </div>

        </div>
    );
}
