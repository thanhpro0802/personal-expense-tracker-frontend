interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    // thêm các biến khác nếu cần
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}