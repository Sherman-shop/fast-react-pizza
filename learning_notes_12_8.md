# 12.8 学习笔记：组件化、路由跳转与 CSS 技巧

## 1. React Router 跳转机制深度解析

今天深入探讨了 React Router 中三种不同的跳转方式，它们分别适用于不同的场景：

### 1.1 `<Link to="...">` (声明式导航)
*   **场景**：用于构建普通的超链接。
*   **原理**：渲染为 `<a>` 标签，Router 拦截点击事件，使用 History API 改变 URL。
*   **特点**：不需要写 JS 逻辑，直接写在 JSX 模板中。

### 1.2 `useNavigate()` (命令式导航 - Hook)
*   **场景**：在**组件内部**的事件处理函数中使用（如 `onClick`）。
*   **用法**：
    ```javascript
    const navigate = useNavigate();
    // ...
    <button onClick={() => navigate(-1)}>Go back</button>
    ```
*   **关键点**：`-1` 代表历史记录回退一步。

### 1.3 `redirect()` (数据层导航 - Function)
*   **场景**：在 **Loader** 或 **Action** 函数中使用。
*   **原因**：Loader/Action 是普通 JS 函数，不是组件，**不能使用 Hook**。
*   **用法**：
    ```javascript
    export async function action() {
      const newOrder = await createOrder(order);
      return redirect(`/order/${newOrder.id}`); // 返回 Response 对象
    }
    ```

---

## 2. 组件化思维与复用

### 2.1 通用 Button 组件的进化
我们将 `Button` 组件改造成了一个“多态”组件：
*   **普通模式**：渲染 `<button>`，处理表单提交 (`disabled` 状态)。
*   **链接模式**：如果传入 `to` 属性，渲染 `<Link>`，但保持按钮的外观。
*   **技巧**：通过解构 props (`{ children, disabled, to }`) 来灵活处理。

### 2.2 专用 LinkButton 组件
为了处理“返回上一页”这种特殊逻辑，我们封装了 `LinkButton`：
*   它识别特殊的 `to="-1"` 属性。
*   如果是 `-1`，它渲染一个带有 `onClick={() => navigate(-1)}` 的按钮。
*   如果是普通路径，它渲染标准的 `<Link>`。

---

## 3. CSS 与 Tailwind 技巧

### 3.1 `@apply` 提取组件类
为了避免在每个 input 标签上重复写一长串 Tailwind 类名，我们在 `index.css` 中提取了 `.input` 类：
```css
@layer components {
  .input {
    @apply rounded-full border-stone-200 ...;
  }
}
```
这保持了 HTML 的整洁，同时利用了 Tailwind 的原子类优势。

### 3.2 字符串拼接的陷阱
在拼接类名字符串时，**空格**至关重要：
```javascript
// ❌ 错误：导致 "classAclassB"
const className = base + "px-4"; 

// ✅ 正确：保留空格
const className = base + " px-4"; 
```

### 3.3 字体配置
在 `tailwind.config.js` 中配置字体时，推荐使用数组格式以避免解析错误：
```javascript
fontFamily: {
  sans: ['Roboto Mono', 'monospace'],
}
```

---

## 4. ESLint 与代码规范
*   **未使用变量**：ESLint 的 `no-unused-vars` 规则会标记定义了但没用的变量（如 `id`）。
*   **处理方式**：
    1.  暂时注释掉。
    2.  从解构中移除（最佳实践）。
    3.  重命名为 `_id`（通用惯例，告诉 ESLint 忽略）。
*   **React Refresh**：组件文件不应导出非组件内容（常量除外），以保证热更新正常工作。
