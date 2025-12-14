# 12月14日学习笔记：项目完结与 React Router 深度复盘

今天完成了 Fast React Pizza 项目的最后一块拼图：**订单更新功能**。虽然过程有些艰难，对 React Router 的一些高级特性感到困惑，但最终还是坚持完成了整个项目。

## 1. 核心难点：React Router 的“隐形”数据流

在项目的最后阶段，最大的困惑来自于 React Router (v6.4+) 带来的全新数据加载模式。它打破了传统的“组件内 fetch”的直觉。

### A. `useFetcher`：隔空取物
*   **场景**：在 `Order` 页面需要显示披萨配料，但配料数据在 `Menu` 页面的 loader 里。
*   **困惑**：为什么能获取数据却不跳转页面？
*   **原理**：`useFetcher` 就像一个“隐形小偷”，它可以在不改变 URL、不卸载当前组件的情况下，去触发其他路由的 `loader` 并把数据带回来。
*   **关键代码**：
    ```javascript
    useEffect(() => {
      if (!fetcher.data && fetcher.state === 'idle') fetcher.load('/menu');
    }, [fetcher]);
    ```

### B. `action` 与 `fetcher.Form`：无感更新
*   **场景**：点击 "Make priority" 按钮更新订单状态。
*   **困惑**：为什么没写 `onClick`，也没写更新 state 的逻辑，界面却自己变了？
*   **原理**：
    1.  **触发**：`<fetcher.Form method="PATCH">` 提交表单，自动触发路由绑定的 `action`。
    2.  **执行**：`action` 函数调用后端 API (`updateOrder`) 修改数据库。
    3.  **重验证 (Revalidation)**：这是最神奇的一步。React Router 知道数据变了，会自动重新运行页面上的 `loader`，拉取最新的后端数据，从而更新 UI。
*   **总结**：我们不需要手动管理前端状态，而是依赖“后端数据变了 -> 重新拉取”这个循环。


