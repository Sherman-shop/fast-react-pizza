# 学习笔记：Redux Toolkit 基础与全局状态管理

## 1. Redux 的核心工作流
今天成功引入了 Redux Toolkit 来管理全局状态（以用户名 `username` 为例）。Redux 的工作流是一个闭环的单向数据流：

1.  **Dispatch (写入)**：组件（如 `CreateUser`）派发 Action，将数据写入 Store。
2.  **Store (存储)**：Store 接收 Action，交给对应的 Reducer 处理，更新 State。
3.  **Selector (读取)**：组件（如 `Username`）订阅 Store，当 State 变化时自动获取最新数据并重新渲染。

---

## 2. 实现步骤与文件结构

### 第一步：建立金库 (Store)
- **文件**：`src/store.js`
- **作用**：创建全局唯一的 Store，并注册各个 Slice 的 Reducer。
- **关键代码**：
  ```javascript
  const store = configureStore({
    reducer: {
      user: userReducer, // 定义了 state.user 这个路径
    },
  });
  ```

### 第二步：定义规则 (Slice)
- **文件**：`src/features/user/userSlice.js`
- **作用**：定义初始状态 (`initialState`) 和修改规则 (`reducers`)。
- **关键代码**：
  ```javascript
  const userSlice = createSlice({
    name: 'user',
    initialState: { username: '' }, // 定义了 state.user.username 这个属性
    reducers: {
      updateName(state, action) {
        state.username = action.payload; // 真正修改数据的地方
      },
    },
  });
  ```

### 第三步：连接应用 (Provider)
- **文件**：`src/main.jsx`
- **作用**：使用 `<Provider store={store}>` 包裹 `<App />`，让整个应用都能访问 Redux。

### 第四步：写入数据 (Dispatch)
- **文件**：`src/features/user/CreateUser.jsx`
- **作用**：用户输入名字后，派发 Action 更新 Redux。
- **关键代码**：
  ```javascript
  const dispatch = useDispatch();
  dispatch(updateName(username)); // 发送指令
  navigate('/menu'); // 更新后跳转
  ```

### 第五步：读取数据 (Selector)
- **文件**：`src/features/user/Username.jsx`
- **作用**：从 Redux 中读取名字并显示。
- **关键代码**：
  ```javascript
  // 路径解析：state(整个库) -> .user(store.js定义的key) -> .username(slice定义的属性)
  const username = useSelector((state) => state.user.username);
  ```

---

## 3. 关键知识点

### 相对路径 (`./` vs `../`)
- `./`：当前目录（邻居）。
- `../`：上一级目录（父母家）。
- `../../`：上上一级目录（爷爷家）。

### Selector 路径解析原理
代码 `(state) => state.user.username` 的每一部分都有明确来源：
1.  `state`: Redux Store 中的整个状态树。
2.  `.user`: 来自 `store.js` 中 `configureStore` -> `reducer` 对象里的 **Key**。
3.  `.username`: 来自 `userSlice.js` 中 `initialState` 对象里的 **属性名**。

### 为什么需要 Redux？
- 解决了 **跨组件状态共享** 的问题。
- `CreateUser` 组件销毁后，`username` 依然保存在全局 Store 中，其他页面（如 Header, Cart）可以随时读取。
