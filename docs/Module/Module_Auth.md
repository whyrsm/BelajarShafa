### Authentication & Authorization

**FR-AUTH-001: User Registration**
- Email + password registration
- Email verification via link (expired dalam 24 jam)
- Welcome email setelah verifikasi

**FR-AUTH-002: Login**
- Login dengan email/password
- Session timeout: 7 hari (remember me) atau 1 hari (default)
- Login rate limiting: max 5 percobaan per 15 menit

**FR-AUTH-003: Forgot Password**
- Reset link via email (expired dalam 1 jam)
- Password successfully reset → notifikasi email

**FR-AUTH-004: Role-based Access Control (RBAC)**
- Setiap fitur memiliki permission check
- Dynamic permission berdasarkan context

**FR-AUTH-005: Logout**
- Clear session dan token
- Redirect ke login page