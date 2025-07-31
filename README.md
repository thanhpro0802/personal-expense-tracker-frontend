# Expense Tracker - Frontend (React)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.x-FF6363?logo=recharts&logoColor=white)](https://recharts.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-F0C808?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

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
    cd personal-expense-tracker-frontend
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

## 📸 Screenshots

### Signin
![Signin page Screenshot](./screenshots/Signin.jpeg)
### Signup
![Signup page Screenshot](./screenshots/Signup.jpeg)
### Dashboard
![Dashboard page Screenshot](./screenshots/Dashboard.jpeg)
### Add
![Add Transaction page Screenshot](./screenshots/AddTransaction.jpeg)
### History
![Transaction History page Screenshot](./screenshots/TransactionHistory.jpeg)


## ✨ Author

**Nguyễn Tuấn Thành**

- 🔗 GitHub: - 🔗 GitHub: [https://github.com/thanhpro0802](https://github.com/thanhpro0802)
- 🎓 Hanoi University of Science and Technology (HUST)
- 📚 Major: Information Technology – Việt Nhật Program
- 📧 Email: tuanthanh.work@gmail.com

---

