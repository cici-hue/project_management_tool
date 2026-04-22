# 部署指南 - Supabase + Cloudflare Pages

## 架构
```
用户浏览器
    ↓
Cloudflare Pages (前端托管)
    ↓
Supabase (PostgreSQL 数据库)
```

---

## 第一步：创建 Supabase 项目

### 1.1 注册/登录
- 访问 https://supabase.com
- 用 GitHub 账号登录

### 1.2 创建新项目
1. 点击 "New Project"
2. 填写信息：
   - **Name**: `project-management` (或任意名称)
   - **Database Password**: 设置强密码（保存好！）
   - **Region**: 选择 `Singapore` 或 `Tokyo` (亚洲最近)
3. 点击 "Create new project"
4. 等待 1-2 分钟项目创建完成

### 1.3 获取连接信息
1. 项目创建后，点击左侧菜单 **Project Settings** → **API**
2. 复制以下信息（保存好，等下要用）：
   - **URL**: `https://xxxxx.supabase.co`
   - **anon/public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.4 创建数据库表
1. 点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制 `supabase_init.sql` 文件的内容粘贴进去
4. 点击 **Run**
5. 看到 "Success" 表示表创建成功

---

## 第二步：配置本地开发环境

### 2.1 填写本地配置
打开 `config.js` 文件，填入你的 Supabase 信息：

```javascript
window.SUPABASE_URL = 'https://你的项目.supabase.co';
window.SUPABASE_ANON_KEY = '你的anon key';
```

⚠️ **重要**：`config.js` 已添加到 `.gitignore`，不会被上传到 GitHub

### 2.2 本地测试
直接在浏览器打开 `index.html` 即可测试，数据会连接到你的 Supabase。

---

## 第三步：上传代码到 GitHub

### 3.1 创建 GitHub 仓库
1. 访问 https://github.com/new
2. 仓库名称：`project-management`
3. 选择 **Public** 或 **Private**（都可以）
4. 不要勾选 "Add a README"
5. 点击 **Create repository**

### 3.2 上传代码

**方式A：用 GitHub Desktop（推荐）**
1. 下载安装 GitHub Desktop: https://desktop.github.com
2. 点击 "File" → "Add local repository"
3. 选择 `project-management` 文件夹
4. 点击 "Publish repository"
5. 选择刚才创建的仓库，点击 "Publish"

**方式B：用命令行**
```bash
cd project-management
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/project-management.git
git push -u origin main
```

### 3.3 验证上传
- 访问你的 GitHub 仓库
- **确认没有 `config.js` 文件**（被 .gitignore 排除了）
- 应该有这些文件：
  - `.gitignore`
  - `DEPLOY_GUIDE.md`
  - `index.html`
  - `supabase_init.sql`

---

## 第四步：部署到 Cloudflare Pages

### 4.1 创建 Cloudflare Pages 项目
1. 访问 https://dash.cloudflare.com
2. 登录你的 Cloudflare 账号
3. 点击左侧菜单 **Workers & Pages**
4. 点击 **Create** → **Pages**
5. 选择 **Connect to Git**
6. 授权并选择你的 GitHub 仓库

### 4.2 配置构建设置
填写以下信息：
- **Project name**: `project-management` (或任意)
- **Production branch**: `main`
- **Build command**: (留空，不需要构建)
- **Build output directory**: `/` (根目录)

### 4.3 ⚠️ 关键步骤：设置环境变量

**在部署前，必须先设置环境变量！**

1. 在配置页面点击 **Environment variables** (展开)
2. 点击 **Add variable**，添加：

| 变量名 | 值 |
|--------|-----|
| `SUPABASE_URL` | `https://你的项目.supabase.co` |
| `SUPABASE_ANON_KEY` | `你的anon key` |

3. 确认变量添加成功

### 4.4 开始部署
1. 点击 **Save and Deploy**
2. 等待 1-2 分钟部署完成
3. 部署成功后会显示访问链接，如：
   ```
   https://project-management-xxx.pages.dev
   ```

---

## 第五步：验证部署

### 5.1 测试访问
1. 打开 Cloudflare Pages 给出的链接
2. 应该能看到示例项目数据
3. 如果显示 "Supabase 配置缺失"，检查环境变量是否设置正确

### 5.2 测试功能
- 点击 "新增项目" 添加新项目
- 点击 "编辑" 修改项目
- 点击 "删除" 删除项目
- 刷新页面，数据应该还在

### 5.3 检查数据库
在 Supabase 面板：
1. 点击 **Table Editor**
2. 选择 **projects** 表
3. 验证数据是否同步

---

## 环境变量工作方式

### 本地开发
```
browser → index.html → config.js (包含真实Key) → Supabase
```

### Cloudflare 生产环境
```
browser → index.html → Cloudflare注入的环境变量 → Supabase
```

---

## 更新部署

以后代码更新时：

1. **修改代码**（本地测试通过）
2. **提交到 GitHub**（不要提交 config.js）
   ```bash
   git add .
   git commit -m "更新内容"
   git push
   ```
3. **自动部署**：Cloudflare Pages 会自动检测 GitHub 更新并重新部署

---

## 费用说明

| 服务 | 免费额度 | 超出费用 |
|------|---------|---------|
| **Supabase** | 500MB 数据库, 2GB 带宽 | $25/月起 |
| **Cloudflare Pages** | 无限请求, 无限带宽 | 免费 |

**对于小团队完全够用！**

---

## 常见问题

### Q: 部署后显示 "Supabase 配置缺失"？
A: 
1. 检查 Cloudflare Pages 环境变量是否正确设置
2. 变量名必须是 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
3. 设置后需要重新部署

### Q: 本地能跑，部署后不行？
A: 
1. 检查 config.js 是否被正确添加到 .gitignore
2. 检查 Cloudflare 环境变量是否和本地 config.js 一致

### Q: 如何更新环境变量？
A: 
1. Cloudflare Dashboard → Pages → 你的项目 → Settings → Environment variables
2. 修改后点击 **Save**，然后重新部署

### Q: 如何备份数据？
A: Supabase 自动每日备份，也可手动在 SQL Editor 执行导出

---

## 安全提示

✅ **安全做法**：
- Key 只存在 Cloudflare 环境变量和本地 config.js
- config.js 被 .gitignore 保护不上传
- GitHub 仓库只包含无害的代码

❌ **危险做法**：
- 直接把 Key 写在 index.html 里上传
- 把 config.js 提交到 GitHub
- 在公共仓库暴露敏感信息

---

完成以上步骤后，你就拥有了一个安全的在线项目管理系统！
