# 12月12日学习笔记：Redux 数据流与“迷宫”导航

今天在完善购物车功能时，深刻体会到了 React + Redux 项目中数据流向的复杂性，尤其是当命名不一致时带来的困扰。

## 1. 核心困惑：`id` vs `pizzaId`

在项目中，同一个披萨数据在不同阶段有不同的“身份证”，这是导致混乱的根源。

*   **阶段一：API 与 菜单 (`Menu`)**
    *   **来源**：后端 API。
    *   **标识符**：`id`。
    *   **场景**：`MenuItem` 组件接收 props 时，解构出的是 `id`。

*   **阶段二：加入购物车 (`Redux Store`)**
    *   **动作**：在 `MenuItem` 的 `handleAddToCart` 中创建新对象。
    *   **变形**：显式地将 `id` 重命名为 `pizzaId`。
    *   **原因**：为了在购物车上下文中更明确（区分是“披萨产品的ID”还是“购物车条目的ID”）。

*   **阶段三：购物车消费 (`Cart`, `CartItem`)**
    *   **来源**：`useSelector(getCart)`。
    *   **标识符**：`pizzaId`。
    *   **场景**：
        *   列表渲染的 `key` 必须用 `item.pizzaId`。
        *   Redux 的 Action Payload (如 `deleteItem`, `increaseItemQuantity`) 传递的都是 `pizzaId`。

**记忆口诀**：
> 只要进了购物车（Cart Slice, Cart 组件），它就叫 `pizzaId`。
> 还在菜单列表里展示时，它叫 `id`。

## 2. Redux Selector 的威力

今天实现了一个高级 Selector：`getCurrentQuantityById`。

```javascript
export const getCurrentQuantityById = (id) => (state) => {
  const item = state.cart.cart.find((item) => item.pizzaId === id);
  return item ? item.quantity : 0;
}
```

*   **为什么要这样写？**
    这是一个“返回函数的函数”。
    1.  第一层接收 `id`（我们在组件里知道我们要查哪个披萨）。
    2.  第二层接收 `state`（`useSelector` 会自动把全局 state 传进来）。
*   **用法**：`useSelector(getCurrentQuantityById(id))`。

## 3. 级联更新逻辑

在 `cartSlice` 中实现了一个巧妙的逻辑：当减少数量 (`decreaseItemQuantity`) 导致数量归零时，自动触发删除。

```javascript
if (item.quantity === 0) cartSlice.caseReducers.deleteItem(state, action);
```
*   **注意**：这里直接调用了 `caseReducers` 里的函数，这是一种在 Redux Toolkit 内部复用逻辑的高级技巧。

## 4. 心得：关于“记不住”

面对复杂的调用链，感到“记不住”是非常正常的。
*   **不要死记硬背**：没有人能背下整个项目的变量名。
*   **依靠工具**：
    *   **React Developer Tools**：看组件 Props 到底传了什么。
    *   **Redux DevTools**：看 Store 里存的数据结构到底长什么样。
    *   **IDE 跳转**：按住 Ctrl/Cmd 点击变量名，看它定义的地方。
*   **建立心理模型**：不要记“第35行是id”，要记“数据流向图”——数据是从 API 进来，在 MenuItem 被打包，扔进 Redux 仓库，最后在 Cart 被取出来。

**面试回答策略**：
如果面试被问到复杂的逻辑，不要试图复述代码行。要说：
> "这个项目使用了 Redux Toolkit 进行状态管理。数据从 API 获取后，我们在 Slice 中定义了标准化的数据结构（如统一使用 `pizzaId`）。通过 Selector Pattern，我们将具体的查找逻辑（如根据 ID 查数量）封装在 Slice 内部，组件只需要调用 Selector 即可，这样实现了 UI 和 业务逻辑的解耦。"
