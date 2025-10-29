import React, { createContext, useState, useContext, ReactNode } from 'react';

// Định nghĩa những gì Context sẽ cung cấp
interface BudgetContextType {
    budgetsVersion: number; // Một con số để theo dõi phiên bản dữ liệu
    triggerBudgetsRefresh: () => void; // Hàm để kích hoạt việc làm mới
}

// Tạo Context với một giá trị mặc định
const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

// Tạo Provider component
// Component này sẽ bao bọc toàn bộ ứng dụng của chúng ta
export const BudgetContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [budgetsVersion, setBudgetsVersion] = useState(0);

    const triggerBudgetsRefresh = () => {
        // Mỗi lần gọi hàm này, state sẽ thay đổi, làm cho các component sử dụng nó re-render
        setBudgetsVersion(prevVersion => prevVersion + 1);
    };

    const value = {
        budgetsVersion,
        triggerBudgetsRefresh
    };

    return (
        <BudgetContext.Provider value={value}>
            {children}
        </BudgetContext.Provider>
    );
};

// Tạo một custom hook để sử dụng Context dễ dàng hơn
export const useBudgets = () => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudgets must be used within a BudgetContextProvider');
    }
    return context;
};