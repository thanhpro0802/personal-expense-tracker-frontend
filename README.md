# Expense Tracker - Frontend (React)

Đây là dự án frontend cho ứng dụng Quản lý Chi tiêu (Expense Tracker), được xây dựng bằng **React** và **Vite**. Giao diện người dùng được thiết kế để cung cấp trải nghiệm mượt mà, giúp người dùng dễ dàng quản lý tài chính cá nhân.

Dự án này giao tiếp với một backend **Spring Boot** an toàn để xử lý việc xác thực người dùng, lưu trữ dữ liệu và các logic nghiệp vụ khác.

## ✨ Các tính năng chính

- **Xác thực người dùng:** Đăng ký và Đăng nhập an toàn.
- **Bảo mật với JWT:** Sử dụng JSON Web Tokens (Access Token và Refresh Token) để bảo vệ API.
- **Tự động làm mới Token:** Tự động làm mới Access Token khi hết hạn mà không làm gián đoạn trải nghiệm người dùng, nhờ vào Axios Interceptors.
- **Route được bảo vệ:** Các trang quan trọng như Dashboard, Profile chỉ có thể được truy cập sau khi đã đăng nhập.
- **Giao diện đáp ứng (Responsive):** (Tùy chọn, bạn có thể thêm tính năng này) Giao diện được thiết kế để hoạt động tốt trên cả máy tính và thiết bị di động.

## 🛠️ Công nghệ sử dụng

- **Framework:** [React 18+](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Gọi API:** [Axios](https://axios-http.com/)
- **Quản lý trạng thái:** React Context API (hoặc Redux/Zustand nếu bạn dùng)
- **Styling:** CSS / SASS / Tailwind CSS (Tùy chọn theo dự án của bạn)

## 🚀 Cài đặt và Chạy dự án

Để chạy dự án này trên máy của bạn, hãy làm theo các bước sau.

### Yêu cầu tiên quyết

- [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
- `npm` hoặc `yarn`
- Một phiên bản backend **Expense Tracker Backend** đang chạy. (Bạn có thể dẫn link tới repo backend của mình tại đây).

### Các bước cài đặt

1.  **Clone repository về máy:**
    ```bash
    git clone https://github.com/thanhpro0802/personal-expense-tracker-frontend.git
    cd your-frontend-repo
    ```

2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    # hoặc nếu bạn dùng yarn
    # yarn install
    ```

3.  **Cấu hình biến môi trường:**

    Tạo một file mới tên là `.env` ở thư mục gốc của dự án. File này sẽ chứa URL của API backend.

    ```env name=.env
    # URL của Spring Boot backend đang chạy
    VITE_API_URL=http://localhost:8080
    ```
    *Lưu ý: `8080` là cổng mặc định của Spring Boot. Hãy thay đổi nếu bạn đã cấu hình cổng khác.*

4.  **Chạy ứng dụng ở chế độ development:**
    ```bash
    npm run dev
    # hoặc
    # yarn dev
    ```

5.  Mở trình duyệt và truy cập vào `http://localhost:5173` (hoặc cổng khác mà Vite cung cấp).

## 📂 Cấu trúc thư mục

Dự án được tổ chức theo cấu trúc module hóa để dễ dàng bảo trì và mở rộng:

```
src/
├── components/      # Các UI component nhỏ, tái sử dụng được
├── pages/           # Các component tương ứng với một trang hoàn chỉnh
├── services/        # Logic gọi API (auth.service.js, user.service.js)
├── contexts/        # Quản lý trạng thái toàn cục (ví dụ: AuthContext)
├── helpers/         # Các hàm tiện ích, ví dụ: axios instance với interceptors
├── hooks/           # Các custom hook (ví dụ: useAuth)
├── routes/          # Định nghĩa và bảo vệ các route
├── App.jsx
└── main.jsx
```

## ✍️ Tác giả

Dự án được phát triển bởi **thanhpro0802**.
