"use client";

import Homepage from "@/app/page/HomePage/page";
import Library from "@/app/page/BookLibrary/page";
import LoginPage from "@/app/page/LoginPage/page";
import RegisterPage from "@/app/page/RegisterPage/page";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CartPage from "@/app/page/CartPage/page";

export default function App() {
  return (
    <div className="h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/page/HomePage" element={<Homepage />} />
          <Route path="/page/TgPage" element={<LoginPage />} />
          <Route path="/page/LoginPage" element={<LoginPage />} />
          <Route path="/page/RegisterPage" element={<RegisterPage />} />
          <Route path="/page/BookLibrary" element={<Library />} />
          <Route path="/page/DetailBookPage" element={<Library />} />
          <Route path="/page/CartPage" element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
