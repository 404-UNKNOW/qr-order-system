# 扫码点餐系统

基于Next.js和Supabase构建的现代化餐厅扫码点餐系统。

## 功能特点

- **用户友好的界面**: 美观、直观的用户界面设计，提供流畅的点餐体验
- **多角色支持**: 包含顾客点餐、厨房处理和管理员后台三种角色视图
- **实时更新**: 利用Supabase实时API，订单状态实时同步
- **二维码管理**: 自动为每个餐桌生成专属二维码
- **菜单管理**: 轻松添加、编辑和管理菜品
- **订单追踪**: 完整的订单生命周期管理

## 技术栈

- **前端**: Next.js 14、React、TypeScript、TailwindCSS
- **后端**: Supabase (PostgreSQL数据库、实时API、认证)
- **部署**: 可部署在Vercel上

## 快速开始

1. 克隆项目并安装依赖:

```bash
git clone [仓库URL]
cd qr-order-system
npm install
```

2. 配置环境变量:

复制`.env.local.example`为`.env.local`并填入您的Supabase项目凭证:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. 运行开发服务器:

```bash
npm run dev
```

4. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## 数据库设置

在Supabase中需要创建以下表:

1. **menu_items** (菜单项)
   - id: int8
   - name: text
   - description: text
   - price: float8
   - image_url: text
   - category: text
   - available: boolean

2. **tables** (餐桌)
   - id: int8
   - table_number: text
   - qr_code: text (可选)
   - status: text (available/occupied)

3. **orders** (订单)
   - id: int8
   - table_number: text
   - status: text (pending/preparing/completed/cancelled)
   - total_amount: float8
   - created_at: timestamptz

4. **order_items** (订单项)
   - id: int8
   - order_id: int8 (外键关联orders表)
   - menu_id: int8 (外键关联menu_items表)
   - quantity: int4
   - price: float8
   - notes: text (可选)

## 部署

1. 创建Supabase项目并设置数据库表
2. 在Vercel上创建新项目并连接到代码仓库
3. 设置环境变量
4. 部署!

## 许可证

MIT
