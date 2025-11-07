"use client";

import { Suspense } from "react";
import BookDetailContent from "./BookDetailContent";

export default function BookDetailPage() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Loading book details...</div>}>
            <BookDetailContent />
        </Suspense>
    );
}
