# 📚 Tài Liệu Dự Án - English Center Management System

> Cập nhật: 06/03/2026

## Danh Sách Tài Liệu

| File | Mô tả |
|------|--------|
| [INSTALLATION.md](INSTALLATION.md) | Hướng dẫn cài đặt dự án từ A-Z |
| [DATABASE_SETUP.md](DATABASE_SETUP.md) | Thiết lập MongoDB, seed data, xác minh kết nối |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Schema chi tiết toàn bộ database (tự động xuất từ DB) |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API endpoints, request/response format, phân quyền |
| [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) | Cấu trúc thư mục và module của dự án |

## Tài Liệu Khác

| File | Mô tả |
|------|--------|
| [../README.md](../README.md) | Tổng quan dự án, Quick Start |
| [../server/README.md](../server/README.md) | Tổng quan backend: modules, middleware, models |
| [../client/README.md](../client/README.md) | Tổng quan frontend: components, pages, services |
| [../server/seeds/README.md](../server/seeds/README.md) | Hướng dẫn sử dụng các seed scripts |

## Cập Nhật Schema

Chạy script để cập nhật `DATABASE_SCHEMA.md` với dữ liệu mới nhất:

```bash
cd server
node scripts/exportDatabaseSchema.js
```
