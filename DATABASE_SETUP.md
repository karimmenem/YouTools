# YouTools Database & Authentication Setup

## 🗄️ **Database Setup**

### **Prerequisites**
1. **PostgreSQL** installed locally
2. **pgAdmin** (optional GUI tool)

### **Quick Setup Commands**

```bash
# 1. Create database (run in PostgreSQL)
createdb youtools_db

# 2. Set up environment variables
cp .env.example .env
# Edit .env file with your PostgreSQL credentials

# 3. Create all tables and default data
npm run setup-db create
```

### **Database Configuration**

Edit your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=youtools_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

### **Database Commands**

```bash
# Create all tables and default data
npm run setup-db create

# Drop all tables (careful!)
npm run setup-db drop

# Reset database (drop + create)
npm run setup-db reset
```

## 👥 **Default Admin Users**

After running `npm run setup-db create`, these admin accounts will be created:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Kamal Menhem | kamal@youtools.com | admin123 | Admin |
| Rabih Menhem | rabih@youtools.com | admin123 | Admin |

**⚠️ Important:** Change these passwords in production!

## 🔐 **Authentication Endpoints**

### **Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "kamal@youtools.com",
  "password": "admin123"
}
```

### **Get Profile** (requires token)
```http
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🛠️ **Product Management (Admin Only)**

### **Create Product**
```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Tool",
  "nameEn": "New Tool",
  "description": "Descrição em português",
  "descriptionEn": "Description in English",
  "price": 299.99,
  "originalPrice": 399.99,
  "code": "TOOL001",
  "categoryId": 1,
  "brand": "Brand Name",
  "stockQuantity": 50,
  "badge": "MAIS PAIR",
  "discount": true,
  "featured": false
}
```

### **Update Product**
```http
PUT /api/products/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Tool Name",
  "price": 349.99
}
```

### **Delete Product**
```http
DELETE /api/products/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

## 👑 **Admin Management**

### **Create New Admin** (Admin Only)
```http
POST /api/admin/create-admin
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Admin",
  "email": "newadmin@youtools.com",
  "password": "securepassword"
}
```

### **Get All Users** (Admin Only)
```http
GET /api/admin/users?page=1&limit=20&search=kamal
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Get Dashboard Stats** (Admin Only)
```http
GET /api/admin/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🚀 **Production Deployment Notes**

### **Environment Variables for AWS**
```env
NODE_ENV=production
PORT=5001
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=youtools_production
DB_USER=youtools_user
DB_PASSWORD=super_secure_production_password
JWT_SECRET=very_long_random_production_jwt_secret
```

### **Security Features**
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Admin-only routes protection
- ✅ Input validation
- ✅ SQL injection protection
- ✅ Protected admin accounts (Kamal & Rabih cannot be deleted)

### **Database Tables Created**
- `users` - User accounts and authentication
- `categories` - Product categories
- `products` - Main product information
- `product_images` - Product images
- `product_specifications` - Product specs
- `orders` - Customer orders (for future)
- `order_items` - Order line items (for future)

## 🔧 **Next Steps**

1. **Set up PostgreSQL** locally
2. **Run database setup**: `npm run setup-db create`
3. **Test login** with Kamal/Rabih accounts
4. **Create products** through API
5. **Build admin frontend** for easy management

Ready for AWS deployment when you are! 🎉
