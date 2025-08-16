# Gemini 上下文：全棧筆記應用 (ntoe)

## 項目概述

這是一個功能全面的全棧筆記應用程序，具有多用戶環境和基於角色的訪問控制。它為創建和組織筆記提供了豐富的用戶體驗，並為用戶和內容管理提供了完整的管理後台。該應用程序採用清晰的客戶端-服務器架構設計。

## 系統架構

*   **客戶端-服務器模型 (Client-Server Model):** 應用程序由一個 React 單頁應用（客戶端）和一個 Node.js/Express 後端 API（服務器）組成。
*   **數據庫 (Database):** 使用 MySQL 數據庫存儲所有應用程序數據，包括用戶、筆記、標籤和文件夾。
*   **容器化 (Containerization):** 整個技術棧被設計為容器友好的。Docker Compose 用於管理 MySQL 數據庫服務。
*   **代理與服務 (Proxy & Serving):** 在容器化環境中，Nginx 用於提供前端靜態文件構建，並充當反向代理，將來自客戶端的 API 請求（例如 `/api/...`）轉發到後端服務器。這避免了 CORS 問題並簡化了部署。

## 技術棧

### 前端 (`client/`)

*   **框架:** React (使用 `create-react-app` 啟動)
*   **UI 組件:** React Bootstrap, React Icons
*   **路由:** React Router (`react-router-dom`)
*   **狀態管理:** React Context API (`AuthContext.js`)
*   **API 通信:** Axios
*   **內容渲染:** React Markdown (`react-markdown`, `remark-gfm`)
*   **工具庫:** `react-bootstrap-typeahead`, `react-toastify` (用於通知)

### 後端 (`server/`)

*   **框架:** Node.js 與 Express.js
*   **數據庫驅動:** `mysql2`
*   **認證:** JSON Web Tokens (`jsonwebtoken`) 用於無狀態認證, `bcryptjs` 用於密碼哈希。
*   **文檔生成:** `docx`, `docxtemplater`, `pizzip` 用於從模板創建 `.docx` 文件。
*   **中間件:** `cors`
*   **開發工具:** `nodemon` 用於服務器自動重啟。

### 基礎設施

*   **數據庫:** MySQL 8.0
*   **容器化:** Docker (`docker-compose.yml`)
*   **Web 服務器/代理:** Nginx

## 主要功能

*   **用戶認證:** 使用 JWT 的安全用戶註冊和登錄系統。
*   **筆記管理:** 創建、讀取、更新和刪除筆記。
*   **筆記類型:** 支持不同類型的筆記，如“普通筆記”和“周報”。
*   **標籤系統:** 為筆記創建、分配和管理標籤。
*   **文件夾組織:** 將筆記組織到文件夾中。
*   **管理員儀表板:** 為管理員提供的受保護區域。
    *   **用戶管理:** 查看和管理應用程序用戶。
    *   **周報審批:** 篩選、預覽並匯總已提交的周報。
    *   **日期自動填充:** 審批頁面的日期篩選器會自動填充當前星期的周一至周五。
    *   **標籤管理:** 全局管理所有標籤。
*   **周報匯總導出:** 根據選定的周報，生成一份包含匯總內容的 Word (`.docx`) 報告。
    *   報告包含根據模板生成的格式化內容。
    *   自動計算並填充未提交周報的用戶名單。

## 構建與運行

主要的開發工作流程是在 Docker 中運行數據庫，並在本地運行客戶端/服務器應用程序。

1.  **啟動數據庫:**
    ```bash
    # 在後台啟動 MySQL 容器
    docker-compose up -d db
    ```

2.  **運行後端服務器:**
    ```bash
    cd server
    npm install
    npm run dev
    ```
    API 服務器將在 `http://localhost:3001` 上可用。

3.  **運行前端客戶端:**
    ```bash
    cd client
    npm install
    npm start
    ```
    React 開發服務器將在 `http://localhost:3000` 上可用。

## 開發約定

*   **API 設計:** 後端提供模塊化的 RESTful API。路由按資源（`admin`, `auth`, `notes`, `tags`, `folders`）在 `server/routes/` 目錄中進行組織。
*   **數據庫遷移:** 數據庫模式通過位於 `server/scripts/` 中的版本化 SQL 腳本進行管理。這允許系統地跟踪和應用模式更改。
*   **開發環境:** 前端開發服務器使用代理（`package.json` 中的 `"proxy": "http://localhost:3001"`）將 API 請求轉發到後端，以避免在開發過程中出現 CORS 問題。
*   **代碼風格:** 項目遵循 React 和 Node.js/Express 應用的標準約定。
