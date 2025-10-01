'use client'

export default function Footer() {
  return (
    <footer>
      <div className="bg-[#FB635D] text-white w-full">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-12 gap-6">

          {/* Quick Links */}
          <div className="col-span-4 space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#shop" className="hover:underline">Shop Books</a></li>
                <li><a href="#bestsellers" className="hover:underline">Best Sellers</a></li>
                <li><a href="#categories" className="hover:underline">Categories</a></li>
                <li><a href="#authors" className="hover:underline">Authors</a></li>
                <li><a href="#careers" className="hover:underline">Careers</a></li>
                <li><a href="#contact" className="hover:underline">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* About Company */}
          <div className="col-span-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">About BookStore</h3>
              <p className="text-sm leading-relaxed">
                BookStore is a leading online book-selling platform, offering thousands of titles across
                literature, economics, self-development, business, and children’s books.
                With the mission of spreading knowledge, we connect readers with the vast world of books.
              </p>
            </div>

            {/* Introduction */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Our Mission</h3>
              <p className="text-sm leading-relaxed">
                We believe books are the key to unlocking knowledge and opportunities.
                BookStore is committed to delivering a convenient shopping experience,
                fast delivery services, and attractive promotions so that everyone can
                own the books they love.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-2">Contact</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="hover:opacity-80"
                >
                  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.525 0H1.477A1.476 1.476 0 000 1.476v21.049A1.476 1.476 0 001.476 24h11.349v-9.293H9.845v-3.62h2.98V8.41c0-2.952 1.803-4.562 4.435-4.562 1.26 0 2.342.094 2.658.136v3.08l-1.824.001c-1.432 0-1.71.681-1.71 1.679v2.201h3.418l-.446 3.62h-2.972V24h5.829A1.476 1.476 0 0024 22.524V1.476A1.476 1.476 0 0022.525 0z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-sm leading-relaxed space-y-4 pt-4">
              <p>© 2025 <span className="font-bold">BookStore</span>. All rights reserved.</p>
              <p>
                All book titles, covers, and related content are the property of their respective publishers and authors.
                BookStore is an independent retailer and is not affiliated with any official publishing organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
