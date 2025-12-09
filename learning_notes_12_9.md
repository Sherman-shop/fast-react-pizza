# 学习笔记：React Router 数据加载与 UI 优化

## 1. UI 优化与 Tailwind CSS 实践
今天主要完成了购物车（Cart）和订单（Order）相关页面的 UI 美化，从原本的骨架屏转变为具有完整样式的页面。

### 购物车页面 (`Cart.jsx` & `CartItem.jsx`)
- **列表渲染**：使用 `map` 渲染 `CartItem` 组件，展示购物车详情。
- **响应式布局**：
  - 移动端：纵向排列。
  - 桌面端 (`sm:` 断点)：使用 `flex` 实现横向排列，两端对齐。
- **样式细节**：
  - 使用 `divide-y` 快速添加列表项之间的分隔线。
  - 按钮组件化：复用 `Button` 组件，并扩展了 `secondary`（次要按钮）和 `small`（小按钮）变体。

### 订单创建页 (`CreateOrder.jsx`)
- **表单布局优化**：
  - 调整了输入框与 Label 的布局，从水平排列改为垂直排列（Label 在输入框上方），更符合移动端体验。
  - 修复了 Flex 布局下输入框宽度被挤压的问题（使用 `div.grow` 包裹）。
- **错误信息展示**：
  - 将错误提示信息（如电话号码格式错误）放置在输入框容器内部，避免破坏整体布局。
  - 增加了输入框组之间的间距 (`mb-8`)，提升视觉呼吸感。

### 订单详情页 (`Order.jsx` & `OrderItem.jsx`)
- **信息展示**：
  - 使用 Flexbox (`justify-between`) 实现左右布局（如：状态标签靠右，标题靠左）。
  - 使用 `bg-stone-200` 等背景色区分不同信息区块。
  - 状态标签（Status/Priority）使用圆角胶囊样式 (`rounded-full`)。
- **组件复用**：
  - 提取 `OrderItem` 组件用于展示单个披萨的详情。
  - 通过 Props 将父组件 (`Order`) 获取的数据传递给子组件 (`OrderItem`)。

---

## 2. React Router 数据加载机制 (Loader)

深入理解了 React Router v6.4+ 的核心特性：**Loader**。

### 核心流程
1.  **路由匹配**：当 URL 变为 `/order/:id` 时，Router 识别匹配的路由。
2.  **并行执行**：Router **同时**开始加载组件代码和执行 `loader` 函数。
3.  **数据获取 (`loader` 函数)**：
    - 运行在客户端。
    - 接收 `params` 对象（包含 URL 参数，如 `orderId`）。
    - 调用 API (`getOrder`) 发起网络请求。
    - **阻塞渲染**：在数据返回之前，组件不会渲染（避免了“瀑布流”问题）。
4.  **组件渲染**：
    - 数据就绪后，组件挂载。
    - 组件内部使用 `useLoaderData()` 钩子直接获取 `loader` 返回的数据。

### 数据流向 (Data Flow)
- **CreateOrder (Action)**:
  - 表单提交 -> `action` 拦截 -> 组装数据（包含**写死的 fakeCart**） -> POST 请求发给服务器 -> 服务器返回新订单 ID -> 重定向。
- **Order (Loader)**:
  - URL 变化 -> `loader` 拦截 -> 根据 ID 请求服务器 -> 服务器返回刚才存储的数据 -> `useLoaderData` 获取并展示。

### 关键理解
- **Render-as-You-Fetch**：数据获取早于组件渲染。
- **按需加载**：`loader` 根据 URL 参数精准获取特定数据，而非全部数据。
- **前后端交互**：虽然是本地开发，但数据确实经过了远程 API 的存储和读取。目前金额不一致是因为发送时使用了静态的 `fakeCart` 数据。
