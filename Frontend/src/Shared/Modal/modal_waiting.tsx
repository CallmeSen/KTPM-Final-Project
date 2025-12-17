"use client";
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ModalWaitingProps {
  visible: boolean;
  message?: string;
}

export default function ModalWaiting({ visible, message }: ModalWaitingProps) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center gap-4 bg-white px-6 py-8 rounded-lg shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-center text-sm text-gray-700">{message || "Vui lòng chờ..."}</p>
      </div>
    </div>
  );
}
