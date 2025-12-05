# React Router v6.4+ 深度学习笔记：Loader 与 Action

本项目 (`fast-react-pizza`) 采用了 React Router v6.4+ 引入的全新数据 API（Data APIs），彻底改变了 React 应用处理数据获取和表单提交的方式。

## 1. 核心概念：Render-as-you-fetch (边渲染边获取)

在传统的 React 开发中（如使用 `useEffect`），我们通常遵循 "Render-then-fetch" 模式：
1. 渲染组件 (显示 Loading)。
2. `useEffect` 触发，开始请求数据。
3. 数据返回，更新状态，重新渲染内容。

这会导致“请求瀑布”问题（父组件加载完 -> 渲染子组件 -> 子组件加载数据）。

**React Router v6.4+ 的改进：**
路由知道页面需要什么数据。当用户点击链接时，Router **立即**开始并行请求所有路由的数据（Loader），只有当数据准备好后，才开始渲染组件。

---

## 2. Loader：数据读取 (Read)

Loader 用于在路由渲染之前向组件提供数据。

### 2.1 搭建与使用过程

1.  **定义 Loader 函数**:
    在组件文件中（如 `src/features/menu/Menu.jsx`）定义并导出一个异步函数。
    ```javascript
    // src/features/menu/Menu.jsx
    export async function loader() {
      const menu = await getMenu(); // 调用 API 服务
      return menu;
    }
    ```

2.  **配置路由**:
    在 `src/App.jsx` 中，将 loader 导入并绑定到对应的路由对象上。
    ```javascript
    // src/App.jsx
    import Menu, { loader as menuLoader } from "./features/menu/Menu";

    const router = createBrowserRouter([
      {
        path: "/menu",
        element: <Menu />,
        loader: menuLoader, // 绑定 loader
        errorElement: <Error />, // 处理 loader 抛出的错误
      },
    ]);
    ```

3.  **在组件中获取数据**:
    组件内部不需要 `useEffect` 或 `useState` 来管理数据状态，直接使用 `useLoaderData` 钩子。
    ```javascript
    // src/features/menu/Menu.jsx
    import { useLoaderData } from "react-router-dom";

    function Menu() {
      const menu = useLoaderData(); // 数据已经准备好了！
      return <ul>{menu.map(...)}</ul>;
    }
    ```

### 2.2 接收参数 (Params)
在 `src/features/order/Order.jsx` 中，Loader 需要根据 URL 中的 ID 获取订单。Loader 函数会自动接收一个包含 `params` 的对象。

```javascript
// src/features/order/Order.jsx
export async function loader({ params }) {
  // params.orderId 对应路由配置中的 path: "/order/:orderId"
  const order = await getOrder(params.orderId);
  return order;
}
```

---

## 3. Action：数据写入/突变 (Write/Mutate)

Action 用于处理数据提交（POST, PUT, DELETE 等）。它模拟了传统的 HTML 表单提交行为，但由客户端路由接管，不会刷新页面。

### 3.1 搭建与使用过程

1.  **使用 `<Form>` 组件**:
    在 `src/features/order/CreateOrder.jsx` 中，使用 React Router 的 `<Form>` 替换标准的 HTML `<form>`。
    ```javascript
    import { Form } from "react-router-dom";

    function CreateOrder() {
      return (
        <Form method="POST">
          <input name="customer" />
          <input name="phone" />
          <button>Order now</button>
        </Form>
      );
    }
    ```

2.  **定义 Action 函数**:
    在同一个文件中，定义并导出一个 action 函数。这个函数会拦截上述表单的提交。
    ```javascript
    // src/features/order/CreateOrder.jsx
    export async function action({ request }) {
      // 1. 获取表单数据
      const formData = await request.formData();
      const data = Object.fromEntries(formData);

      // 2. 数据验证
      const errors = {};
      if (!isValidPhone(data.phone)) errors.phone = "Invalid phone number";
      if (Object.keys(errors).length > 0) return errors;

      // 3. 发送请求
      const newOrder = await createOrder(order);

      // 4. 重定向
      return redirect(`/order/${newOrder.id}`);
    }
    ```

3.  **配置路由**:
    同样在 `src/App.jsx` 中绑定 action。
    ```javascript
    import CreateOrder, { action as createOrderAction } from "./features/order/CreateOrder";

    {
      path: "/order/new",
      element: <CreateOrder />,
      action: createOrderAction, // 绑定 action
    }
    ```

### 3.2 处理表单错误
如果 Action 返回了错误对象（如上面的 `return errors`），组件可以使用 `useActionData` 钩子来获取这些错误并显示在 UI 上。

```javascript
// src/features/order/CreateOrder.jsx
const formErrors = useActionData();

// ...
{formErrors?.phone && <p>{formErrors.phone}</p>}
```

### 3.3 全局加载状态
当 Action 正在提交或 Loader 正在加载时，我们可以通过 `useNavigation` 钩子获取全局状态，从而禁用按钮或显示加载条。

```javascript
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";
```

---

## 4. 运行原理总结

1.  **导航触发**: 用户点击链接或提交表单。
2.  **Loader/Action 执行**: Router 匹配路由，并行执行对应的 `loader` (如果是 GET 导航) 或 `action` (如果是 Form 提交)。
3.  **数据处理**:
    *   **Loader**: 等待数据返回。
    *   **Action**: 处理提交，如果成功通常会触发 `redirect`。**重要**：Action 执行成功后，Router 会自动重新验证（Re-validate）页面上的所有 Loader 数据，确保 UI 与服务器状态同步。
4.  **渲染**: 数据准备就绪，React 渲染组件树。

**本项目中的优势：**
*   **代码解耦**: 数据获取逻辑从 UI 组件中剥离，组件只负责渲染。
*   **用户体验**: 避免了复杂的 Loading 状态管理，利用 `AppLayout` 中的全局 Loader 统一处理。
*   **错误处理**: 通过 `errorElement` 统一捕获数据加载或提交过程中的异常，防止整个应用崩溃。
