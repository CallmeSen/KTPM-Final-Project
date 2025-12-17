'use client'

export default function Footer() {
  return (
    <footer>
      <div className="bg-[#2F70AF] text-white w-full">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-12 gap-6">

          {/* Liên kết nhanh */}
          <div className="col-span-4 space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li><a href="#courses" className="hover:underline">Khóa học</a></li>
                <li><a href="#bestsellers" className="hover:underline">Tài liệu nổi bật</a></li>
                <li><a href="#categories" className="hover:underline">Chuyên đề</a></li>
                <li><a href="#teachers" className="hover:underline">Giáo viên</a></li>
                <li><a href="#careers" className="hover:underline">Cơ hội việc làm</a></li>
                <li><a href="#contact" className="hover:underline">Liên hệ</a></li>
              </ul>
            </div>
          </div>

          {/* Giới thiệu trung tâm */}
          <div className="col-span-8 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Về IELTS Center</h3>
              <p className="text-sm leading-relaxed">
                IELTS Center là trung tâm luyện thi IELTS hàng đầu, cung cấp đa dạng khóa học và tài liệu
                từ cơ bản đến nâng cao. Với sứ mệnh giúp học viên đạt điểm cao, chúng tôi kết nối bạn
                với thế giới học thuật quốc tế.
              </p>
            </div>

            {/* Sứ mệnh */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Sứ mệnh của chúng tôi</h3>
              <p className="text-sm leading-relaxed">
                Chúng tôi tin rằng IELTS là chìa khóa mở ra nhiều cơ hội học tập và nghề nghiệp.
                IELTS Center cam kết mang đến trải nghiệm học tập tiện lợi, đội ngũ giáo viên chất lượng,
                và nhiều ưu đãi hấp dẫn để mỗi học viên đều có thể đạt mục tiêu điểm số của mình.
              </p>
            </div>

            {/* Liên hệ */}
            <div>
              <h3 className="text-lg font-bold mb-2">Liên hệ</h3>
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

            {/* Bản quyền */}
            <div className="text-sm leading-relaxed space-y-4 pt-4">
              <p>© 2025 <span className="font-bold">IELTS Center</span>. Bảo lưu mọi quyền.</p>
              <p>
                Tất cả tài liệu học tập, hình ảnh và nội dung liên quan thuộc quyền sở hữu của trung tâm.
                IELTS Center là đơn vị đào tạo độc lập, không liên kết trực tiếp với bất kỳ tổ chức quốc tế nào.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
