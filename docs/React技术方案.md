# 《迟到的二十三次生日》移动端 H5 — React 技术方案 **v2**（可实施规格 · 不含实现代码）

> 版本：**v2**（章节化弹层交互版；取代 v1 的"可预滚长卷"聚合交互）。
> 本文是**可实施的技术规格**，描述架构、决策与边界，**不包含任何可运行实现**（无 package.json、无源码、无脚本、无构建配置）。
> 本轮交付物：本方案文档（codeTec/）+ code/ 目录占位 README。高保真图与 PRD 由其他代理并行产出并落入 prd/ 目录。

---

## 0. 事实基线与 v2 交互总览

- 产品形态：**移动端竖屏 H5**，按年龄 1 → 25 单向推进，私密、单人、离线友好。
- **25 个年龄章节，配置驱动**：age 1—25 共 25 章。其中 **22、23 章为 `memoryBridge`（记忆桥段，无密码）**，其余 **23 章为 `gift`（礼物章，含三位密码）**。
- **实体礼物共 23 份**：年龄 **1—21（21 份）+ 年龄 24、25（2 份）= 23 份**。
- **22/23 章**：对应「22 岁·2023·相恋」「23 岁·2024·本科毕业」，无密码谜题、无答案、无实体礼物，仅阅读 + 一个"我读完了"确认按钮。
- 23 个密码均为**三位数字字符串、保留前导零**（如 `006`、`020`、`002`），全局互不相同。
- 预算事实（仅展示参考，不入逻辑）：礼物合计 1078 元 + 包装材料约 60 元 = 总预算 1138 元（权威数据源为"不限 1200 预算版"，不再设上限）。

### v2 核心交互（取代 v1）

- **不再使用** v1 的 1—7 / 8—14 / 15—21 聚合分段、星空式连续长卷叙述，以及"可预滚/预览后续章节"的任何逻辑。
- **25 章配置驱动**：每一章是一个独立的 `<Section>` 组件，由一份章节配置数组渲染，配置即唯一事实源。
- **CSS scroll-snap 纵向全屏**：每章占满一屏，按吸附逐章停留。
- **滚动锁**：用户最多只能访问到 `unlockedThrough`（含）及其后待解锁的当前章；**未解锁的后续章节根本不挂载到 DOM**，物理上无法预览。
- **密码输入不常驻**：每章先呈现"密封盒"外观与一个明确按钮；**点击按钮才打开** 一个可访问的 dialog / bottom-sheet，密码输入框只在弹层内出现。
- **每章一个状态机**：`locked → sheetOpen → validating → (error | success) → unlockedNext`。
- **浏览器 / 安卓返回键**：优先关闭已打开的弹层，而不是离开当前页。

---

## 1. 推荐技术栈与构建工具

| 维度 | 推荐 | 理由 / 备选 |
| --- | --- | --- |
| 框架 | **React 18 + TypeScript** | 类型安全；章节配置 schema 与 UI 共享同一形状，杜绝"前导零/章数"类事故 |
| 构建工具 | **Vite 5** | 启动快、按需分包、资源内容指纹、原生 ESM；私密 H5 最轻。备选 Next.js 静态导出（仅当后续要 SEO/分享卡） |
| 样式 | **Tailwind CSS（移动优先）+ CSS 变量/关键帧** | 移动优先、设计 token；scroll-snap 与 safe-area 用少量原生 CSS 配合 |
| 路由 | **不引入 React Router**；用 `history` + hash 做进度同步与深链拦截（见 §16） | 单线性流程，无需客户端路由库 |
| 状态管理 | **Zustand**（轻量、可持久化中间件）+ 少量 Context（主题/音频） | 不引 Redux；无后端，不需要 TanStack Query |
| 弹层 | **受控 Dialog / Bottom-Sheet**（自实现焦点陷阱，或 Headless UI / Radix 式无样式原语） | 必须支持 `aria-modal`、焦点陷阱、Esc/返回关闭（见 §12） |
| 数据 | **静态章节配置资产**（构建期 schema 校验），无后端 | 来源权威 Excel（见 §7） |
| 包管理 | pnpm | 锁文件、可复现安装 |
| 测试 | Vitest + React Testing Library；E2E Playwright（移动视口）；axe-core | 见 §17 测试矩阵 |

> 本轮**不落地**任何依赖配置文件（无 package.json / 锁文件 / 配置文件）。

---

## 2. 目录结构建议（仅约定，本轮不创建）

```
birthday-h5/
  public/                 # 不经指纹的原样静态资源（favicon 等）
  src/
    assets/               # 经构建处理的图片 / 音频 / 字体
    data/
      chapters.ts         # 25 章配置（gift + memoryBridge），源自权威 Excel；构建期 schema 校验
      answers.ts          # 答案隔离模块（按需加载，见 §20）
    sections/             # Intro / AgeSection / BridgeSection / Finale（每章一个独立 Section）
    components/           # GiftSealBox、UnlockButton、PasscodeSheet、RevealPanel、
                          # ProgressRail、Backdrop、AudioToggle…
    store/                # Zustand：progress（unlockedThrough 等）、settings
    machine/              # 章节状态机规约与迁移（locked→sheetOpen→validating→…）
    hooks/                # useScrollLock、useFocusTrap、usePopstate、usePrefersReducedMotion…
    styles/               # 全局样式、scroll-snap、safe-area、动效关键帧
    utils/                # 密码规范化、schema 校验、localStorage 版本迁移
    App.tsx  main.tsx
  index.html
```

说明：`src/data/chapters.ts` 是内容与 UI 的唯一边界——Excel 改版只动这一层；各 `sections/` 不写死文案。

---

## 3. 章节配置驱动与渲染门禁

- **配置即章节**：一份 `chapters` 数组，长度恒为 25，按 age 1..25 排列；`type` 为 `'gift'` 或 `'memoryBridge'`。
- **每章一个独立 Section 组件**：`AgeSection(gift)` 与 `BridgeSection(memoryBridge)` 两种，结构一致（标题、内容区、底部主按钮），通过配置渲染，不在组件里散落判断。
- **渲染门禁（滚动锁的实现）**：
  - `unlockedThrough` = 用户已正式打开的最大 age。
  - **只挂载 `age <= unlockedThrough + 1` 的章节**：`age <= unlockedThrough` 为已揭示章，`age = unlockedThrough + 1` 为当前待解锁章。
  - **`age > unlockedThrough + 1` 的章节不挂载、不入 DOM**——既不可滚动到达，也不存在于查看源码中，从根上杜绝预览与剧透。
- 成功解锁当前章后：`unlockedThrough += 1`，下一章随之挂载，scroll-snap 自动吸附到新章。
- 首尾：**Intro 封面**（标题 +「开启」按钮，该点击同时作为首次用户手势以解锁音频自动播放）；**Finale 完结页**（25 章全部走完后出现，含感谢语与"九宫格"合影提示）。

---

## 4. 全屏 Scroll-Snap 与滚动锁

- 外层滚动容器：**纵向 scroll-snap**（`scroll-snap-type: y mandatory`；兼容性不足时降级 `proximity`）。
- 每章 `<section>`：`min-height: 100dvh`、`scroll-snap-align: start`，保证一屏一章、吸附停留。
- **滚动锁**配合 §3 渲染门禁实现：容器内物理上只有"已解锁章 + 当前待解锁章"，**没有更后章可滚**，因此无需写复杂的"拦截滚动事件"逻辑。
- 顶部常驻**进度指示**（如 `已打开 12 / 23`，桥接章不计入礼物进度）。
- 弹层打开期间：锁死外层滚动（容器 `overflow:hidden` + `overscroll-behavior: contain`），背景不跟随滚动（见 §6、§13）。

---

## 5. 章节状态机

每章独立的有限状态机（gift 章）：

```
        点[开启本章]按钮
 locked ────────────────► sheetOpen（弹层打开，密码输入出现）
                              │  提交密码
                              ▼
                          validating（输入禁用、校验中）
                       ┌──────┴───────┐
                  答案错│               │答案对
                       ▼               ▼
                    error ──留在本层──► sheetOpen   success（揭示 message）
                                            │              │
                                            └──────────────┘
                                   success 延时后：解锁下一章、关弹层、吸附到下一章
```

- `locked`：章内容为"密封盒"外观 + 包装线索/谜面 + 一个明确主按钮；**密码框不存在**。
- `sheetOpen`：bottom-sheet / dialog 打开，焦点进入弹层（§12）；密码输入框只在此态可见。
- `validating`：提交后短暂态，禁用输入与按钮，避免重复提交。
- `error`：留在本章弹层内抖动提示，`wrongAttempts += 1`，按次数给提示（§9）；**不切章、不解锁**。
- `success`：揭示 `message` 与礼物信息，播放成功音；短延时后 `unlockedThrough += 1`，关闭弹层，scroll-snap 到下一章。
- **memoryBridge 章（22/23）**：无密码，状态机为 `reading → (点[我读完了]) → unlockedNext`，确认即解锁下一章。

---

## 6. Dialog / Bottom-Sheet 与返回键

- **密码输入不常驻**：未点主按钮前，DOM 中没有密码输入框，也没有答案。
- 弹层形态：移动端优先 **bottom-sheet**（从底部升起，顶部下拉/滑下可关）；宽屏/桌面降级为居中 `dialog`。
- **返回键优先级**：监听 `popstate`；**只要有弹层打开，浏览器/安卓返回键先关闭弹层**（并回退那条压入的历史记录），而不是离开页面；弹层全关后返回键才走默认行为。
- Esc 键同样关闭弹层并归还焦点（§12）。
- 关闭弹层后回到 `locked`（gift 章）或 `reading`（bridge 章），已累计的 `wrongAttempts` / 提示层级保留。

---

## 7. 数据 Schema（逐章，源自权威 Excel）

> 权威数据源：`../prd/迟到的二十三次生日_礼物清单_不限1200预算版.xlsx`（与 codeTec/ 同级 prd/）。

### 7.1 gift 章字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `age` | number | 1..25，连续唯一 |
| `type` | `'gift'` | 章类型 |
| `giftSeq` | number | 实体礼物序号 1..23，唯一 |
| `giftName` | string | 礼物名称 |
| `priceYuan` | number | 参考价格，仅展示 |
| `message` | string | 随礼文案（解锁后揭示） |
| `puzzle` | string | 密码谜题/谜面（密封盒上可见） |
| `packagingClue` | string | 包装线索/盒面图案（密封盒上常驻） |
| `answer` | string | 标准答案，三位数字字符串、保留前导零（**隔离存放，见 §20**） |
| `hint1` | string | 一级提示 |
| `fallback` | string | 最终兜底（含完整推导与答案） |
| `sealButtonLabel` | string | 密封盒主按钮文案（如「打开这一年」） |
| `state` | enum | 运行态：`locked / sheetOpen / validating / error / success / unlocked`（见 §5） |
| `imageCover?` / `audioBgm?` | string | 实现期补的资源引用 |

### 7.2 memoryBridge 章字段（仅 age22/23）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `age` | number | 22 / 23 |
| `type` | `'memoryBridge'` | 章类型 |
| `year` | number | 2023 / 2024 |
| `title` | string | 桥段小标题 |
| `paragraphs` | string[] | 长文段落（对应 Excel「22-23岁记忆桥段」sheet） |
| `confirmButtonLabel` | string | 确认按钮文案（如「我读完了」） |
| `state` | enum | `reading / unlockedNext` |

> memoryBridge 章**不得出现** `answer`/`puzzle`/`hint1`/`fallback` 字段。

### 7.3 构建期 schema 门禁

- 配置长度恒为 **25**，age 连续 1..25。
- `gift` 章恰好 **23**（age ∈ 1..21、24、25）；`memoryBridge` 章恰好 **2**（22、23）。
- 每个 `answer` 匹配 `/^\d{3}$/`，且 **23 个两两不重复**（见 §8）。
- 任一规则不满足即**构建失败**。

### 7.4 全量导出（按 age 排序）

| age | type | giftSeq | giftName | answer | priceYuan |
| --- | --- | --- | --- | --- | --- |
| 1 | gift | 1 | 旺仔牛奶 | 006 | 30 |
| 2 | gift | 2 | 袜子 | 020 | 20 |
| 3 | gift | 3 | 薯条玩偶 | 002 | 25 |
| 4 | gift | 4 | 洛克王国拼图 | 016 | 30 |
| 5 | gift | 5 | 牙刷 | 025 | 15 |
| 6 | gift | 6 | 布布一二小夜灯 | 012 | 18 |
| 7 | gift | 7 | 文具小礼盒 | 009 | 20 |
| 8 | gift | 8 | 小狗浴巾浴帽 | 024 | 55 |
| 9 | gift | 9 | 按摩梳 | 042 | 45 |
| 10 | gift | 10 | 零食包 | 101 | 30 |
| 11 | gift | 11 | 手账本 | 102 | 50 |
| 12 | gift | 12 | 100 块红包（第一个本命年） | 011 | 25 |
| 13 | gift | 13 | 卫生巾 | 018 | 65 |
| 14 | gift | 14 | 沐浴露套装 | 007 | 25 |
| 15 | gift | 15 | 蒸汽眼罩 | 005 | 85 |
| 16 | gift | 16 | 润唇膏 | 015 | 80 |
| 17 | gift | 17 | 充电宝 | 360 | 45 |
| 18 | gift | 18 | 足金吊坠 | 324 | 55 |
| 19 | gift | 19 | 答案之书 | 091 | 50 |
| 20 | gift | 20 | 5 张 20 的刮刮乐（彩票） | 023 | 65 |
| 21 | gift | 21 | 沐浴露 | 100 | 85 |
| 22 | memoryBridge | — | （2023·相恋，无礼物无密码） | — | — |
| 23 | memoryBridge | — | （2024·本科毕业，无礼物无密码） | — | — |
| 24 | gift | 22 | 薯条 n 重奏兑换券 | 003 | 85 |
| 25 | gift | 23 | 米家照片打印机 | 004 | 75 |

> `message`/`puzzle`/`packagingClue`/`hint1`/`fallback` 五列较长，按 §7.1 **逐字取自该 Excel**，不在此抄录。
>
> 早期版本曾有的"礼物名称与文案错配、age16 占位符、age7 空括号"问题已在该权威 Excel 中全部修复；age2 答案已更新为 `020`（旧 `060` 作废）。实施方直接以该文件导入 `data/chapters.ts` 即可。

---

## 8. 密码唯一性与校验

- **字符串比较，禁止转数字**：前导零必须保留，`"006" !== 6`。
- **输入规范化**：去空白、仅留数字；恰好 3 位才可提交，不足提示"还差几位"。
- 比对：规范化后输入串 `===` 本章 `answer`。
- **唯一性门禁**：构建期断言 23 个 `answer` 两两不等，重复即构建失败。
- 不做爆破锁定：错误只累计 `wrongAttempts` 并触发提示分层（§9）。
- 现场 23 个三位密码挂锁须按 `answer` 逐一把好，H5 与实体锁同码。

---

## 9. 提示 / 兜底分层（按错误次数，留在本章）

- 密封盒常驻：`packagingClue` + `puzzle`。
- **第 1 次错误后**：弹层内出现"给个提示？"入口，点击展开 `hint1`（不自动展开）。
- **累计错误 ≥ 3 次，或主动点"直接告诉我"**：展开 `fallback`（含完整推导与答案）。
- 所有提示层级只在本章弹层内出现；错误**不切章、不解锁**。
- memoryBridge 章无此分层。

---

## 10. localStorage 进度、刷新恢复与版本迁移

- **key**：`birthday.progress.v{schemaVersion}`。
- **持久化内容**：`schemaVersion`、`unlockedThrough`、`lastAge`、`wrongAttempts{age:n}`、`hintLevel{age:'none'|'hint1'|'fallback'}`、`settings`、`startedAt`、`finishedAt?`。
- **刷新恢复**：读取 `unlockedThrough`，按 §3 门禁只挂载到该章，并 `scrollIntoView(lastAge)`；**绝不恢复到未解锁的未来章**。
- **版本迁移**：`stored.schemaVersion !== CURRENT` 时逐版本 `migrate(old)→new`；迁移失败则丢弃旧进度并给"从头开始"入口，不白屏。
- **降级**：iOS 私密模式不可写时 `try/catch` 退化为内存态，不弹错。
- 纯本地、不上传；提供"清空进度 / 从头再来"。

---

## 11. 问答输入与隐私

- 密码输入用**数字键盘**（`inputMode="numeric"`、`pattern="[0-9]*"`），仅在弹层内渲染。
- 关闭自动行为：`autoComplete="off"`、`autoCapitalize="off"`、`autoCorrect="off"`。
- 输入内容**仅本地比对**：不埋点、不上报、不进 URL/hash。
- 弹层关闭/成功后清空输入；未解锁章不在 DOM 留存答案（§20）。
- 不采集姓名、手机号、定位等任何个人信息。

---

## 12. 焦点管理 / aria-modal / 键盘 / 读屏

- 弹层用 `role="dialog"` + `aria-modal="true"`，带 `aria-labelledby`（弹层标题）。
- **打开时**：焦点陷阱在弹层内（Tab/Shift+Tab 循环），初始聚焦密码输入框；背景容器 `aria-hidden`、 inert。
- **关闭时**：焦点归还触发它的那个主按钮。
- **成功揭示后**：焦点移到揭示文案标题，并用 `aria-live="polite"` 播报"解锁成功"。
- **错误/提示**：用 `aria-live="assertive"` 播报错误与提示层级，不只靠颜色。
- 全程键盘可达：Enter 触发主按钮与提交，Esc 关弹层；读屏可顺序读出 年龄→谜面→按钮→（弹层内）输入→反馈。
- 每章一个 `h2`（年龄 + 标题），按钮用真 `<button>`，图片有 `alt`，正文对比度 ≥ 4.5:1。

---

## 13. safe-area / overscroll / 移动端适配

- `viewport`：`width=device-width, initial-scale=1, viewport-fit=cover`。
- 高度 `100dvh`/`svh`，规避移动端地址栏跳动。
- **安全区**：`env(safe-area-inset-*)` 适配刘海/Home 条；bottom-sheet 按钮区与进度条均内缩。
- **overscroll**：弹层打开时 `overscroll-behavior: contain`，阻止橡皮筋穿透到背景滚动；外层容器同步锁滚动。
- 触摸目标 ≥ 44px；不依赖 `:hover`；字号 `rem`/`clamp()` 流式。
- 走查视口：360×640、390×844、414×896 及横竖屏；机型 iOS Safari、安卓 Chrome。

---

## 14. 音频 / 动效与降级

- **音频**：轻柔循环 BGM + 解锁成功音 + 轻提示音；懒加载；**必须在 Intro「开启」按钮的用户手势后**才能播放。常驻音频开关，记忆到 settings。
- **动效主路径（唯一）：Framer Motion（React 层）+ CSS 变量 / transform / opacity**。
  - 章节吸附切换、bottom-sheet 升起、解锁"开盒"、逐段显现均由 Framer Motion 的组件化编排驱动，动画参数（时长/缓动/延迟）走设计 token（CSS 变量）。
  - 手绘描边感（角色/道具线条"画出来"）用 **SVG path + `stroke-dasharray`/`stroke-dashoffset` 描边动画**实现，不做大位图逐帧。
  - **Lottie 仅作可选装饰**：只用于经设计审核的小型循环装饰（如漂浮气球、星光），**不得成为解锁/章节/放映厅核心路径的依赖**；任一 Lottie 加载失败都必须静默退化为静态 SVG 或图，不阻塞流程。
  - **为何不选纯 CSS/WAAPI 作主路径**：章节错峰编排、弹层状态机与 inView 触发需要与 React 状态/生命周期联动，Framer Motion 在此更贴合；CSS/WAAPI 仍保留给 hover、scroll-snap 等细粒度场景，但**不作为动效编排主路径**。
- **动效执行约束**：一律 `transform` / `opacity`（GPU 友好），不写 `top/left/width` 动画；触发方式见 §15.8。
- **降级**：检测 `prefers-reduced-motion` 时关闭吸附动画/视差/开盒装饰，仅保留状态切换与必要的弹层显现；音频加载失败静默继续，不阻塞流程。

---

## 15. 设计系统与视觉资源（小狗长卷 · 剪贴簿风）

> 最终视觉定为**线条小狗 × 剪贴簿 / journal 长卷**：米色波点纸底、和纸胶带、拍立得相纸框、便签贴纸，柔和奶黄/奶白/淡蓝配色，粗黑实线自由线描。**这是当前唯一设计系统**——不再采用"无角色的纸条互动绘本"方向。

### 15.1 两个 recurring 角色资产（图层 / 组件规范）

- **角色 A：白色粗黑实线自由线描小狗**（line-dog，粗黑实线自由线描、白底留白）。
- **角色 B：棕色实心小狗**（tan-dog，米棕填充、红项圈）。
- 二者做成**可复用贴纸组件**，不画死在单张场景里；每章场景按主题安排二者同框或单独出镜。
- 图层自底向上：纸底/波点 → 背景道具 → 角色贴纸 → 文字卡片/便签 → 和纸胶带/装饰。

### 15.2 每岁独立 scene asset

- 25 章（含 22/23 bridge）**每章一张独立场景插画**：角色 + 与该岁礼物/记忆相关的道具（拍立得、蛋糕、气球、吉他、相机等）。场景道具仅作氛围，**不参与解锁逻辑**。
- 场景与礼物映射**以 §7 权威配置为准**：**第 13 岁礼物 = 卫生巾（answer 018），第 15 岁礼物 = 蒸汽眼罩（answer 005）**。
- **"拼豆"不是任何一章的礼物**，仅可作为装饰性兴趣标签 / 涂鸦母题出现；严禁写进章节的 `giftName`/`puzzle`/`answer` 配置，防止与真实礼物混淆。

### 15.3 长卷逐段显现 + 插画/文字交替

- 章节吸附到位后，场景插画与文字卡片**左右交替**（奇数章左图右文、偶数章右图左文，22/23 bridge 居中）。
- 进入视口时按"插画先入、文字后入"错峰淡入/轻滑（仅 `transform/opacity`），形成逐段显现的长卷节奏；未到章不挂载、不加载（§3/§4）。
- **问答贴纸 ≠ 密码**：谜面/一级提示以**便签贴纸**形式贴在场景旁作为氛围引导，但**不替代密码**——真正的解锁门槛仍是 §5 状态机里的 bottom-sheet 密码输入。

### 15.4 图片资源 manifest

- 维护一份 `assets/manifest`：逐章登记 scene 文件 + 角色贴纸 + 纸底，标注：多分辨率（1x/2x/3x 或多档宽度）、格式（**AVIF 首选 → WebP 次选 → PNG 兜底**）、宽高比、LQIP 占位。
- 仅当前可及章按需请求；固定宽高比 + LQIP 杜绝布局跳动；图标用 SVG sprite。单张约 150–300KB，首屏 < 1MB。

### 15.5 版权与使用范围

- 角色图为**用户提供、仅本私人项目使用**；**禁止公开传播与任何商业复用**，不得打包进其他公开产品或模板。
- 在"关于/完结"处标注：角色插画 © 私人纪念项目，请勿商用。

### 15.6 动效降级

- 检测 `prefers-reduced-motion` 时关闭逐段错峰动画与视差，插画与文字直接静态呈现，仅保留弹层必要显现（与 §14 一致）。

### 15.7 字体实现规范（细头签字笔式硬笔手写体）

- **风格目标**：全站中文统一为**细头签字笔式硬笔手写体**——略窄、等线粗、自然轻微不规整、圆润且清晰；数字与标点匹配同套圆润手写风。
- **禁用字体**：标题、正文、按钮、弹层一律**不得使用印刷黑体、宋体、花体、毛笔飞白/书法体**。
- **字体名（已锁定）**：`FONT_HANDWRITING_CJK` = `"ZCOOL KuaiLe", "STKaiti", "KaiTi", cursive`。**唯一字体 ZCOOL KuaiLe Regular**（MD5 `1FE8BF199D6840856DC8773F894C9A38`，SIL OFL 1.1），30张PNG内容页均已清除AI文字后用该字体确定性Pillow叠加。
- **font-family / fallback 栈**：`ZCOOL KuaiLe → STKaiti → KaiTi → cursive`，全程手写/楷体感，不出现印刷黑体/宋体；ZCOOL KuaiLe 未加载时按序回退。
- **@font-face / WOFF2 子集**：格式 WOFF2 优先；按本项目实际用字做**子集化（subset）**，仅打包 25 章文案出现的汉字并按 Unicode 分块拆分，首屏子集预加载、其余按需。
- **预加载与 font-display**：首屏（Intro + 第 1 章）子集 `<link rel="preload">`；统一 `font-display: swap`，避免长时间不可见文本。
- **CJK 缺字回退**：手写体未覆盖的生僻字/符号逐字回退系统无衬线，不出现豆腐块（.notdef）。
- **CLS 防护**：用 `size-adjust` / `ascent-override` / `descent-override` 或预留行高抵消换字位移；固定字重，不动态改字重。
- **一致应用**：标题、正文、按钮、弹层（bottom-sheet/dialog）、提示、完结页统一引用 `FONT_HANDWRITING_CJK`，不局部混用其他字体。
- **Canvas / SVG 导出一致**：生成分享图/九宫格时，画布内文字须内嵌同一款手写体或转曲为路径，避免导出图回退成系统印刷体。
- **许可与本地化**：ZCOOL KuaiLe 为开源字体，**部署时随字体文件一并保留其开源许可证文本**（LICENSE），并记录许可来源；不引入需商业授权的字体；数字/标点与中文同手写风，不与西文印刷体混搭。

### 15.8 章节 motion 字段 schema（配置驱动）

- 25 章配置在 §7 基础上新增一个 `motion` 子对象，逐章声明动效，**不在组件里写死动画参数**：

| 字段 | 取值 | 说明 |
| --- | --- | --- |
| `motion.entry` | enum | 章节进入视口时的一次显现：`fade-up` / `fade-down` / `slide-left` / `slide-right` / `none`；时长与缓动走 token |
| `motion.ambient` | object? | 背景氛围循环（纸底光斑、胶带微动），低频 |
| `motion.character` | object? | 角色贴纸的呼吸/摇摆/描边绘制（SVG path 描边动画） |
| `motion.button` | enum | 主按钮的可点击召唤感（轻微 scale/光晕），仅 `locked` 态 |
| `motion.unlock` | object | `success` 时的开盒/庆祝动画（一次性，播完即停） |
| `motion.reduced` | enum | reduced-motion 降级策略：`static`（直接终态）/ `minimal`（仅必要显现） |

- **触发方式**：用 **IntersectionObserver / Framer Motion `whileInView`**，章节吸附进入视口才触发 `entry`；**离屏即暂停**其内部循环，回到前台再续。
- **循环频率**：`ambient` / `character` 循环为 **2—4 秒低频**，避免高频闪烁与耗电；每章同时运行的循环节点 ≤ 3 个。
- **后台暂停**：`visibilitychange` 到隐藏页、或章节滚出视口时，**全部暂停**（`animation-play-state: paused` / Framer Motion `animate={false}`），回前台恢复；不累计后台定时器。
- **reduced-motion 降级**：`prefers-reduced-motion` 命中时按 `motion.reduced` 直接落到终态，不播放 `entry`/`ambient`/`character` 循环。
- **角色资源形态（二选一，按章复杂度）**：
  - **首选分层 SVG**：两只小狗按"线描 + 项圈/腮红"分层成可独立动画的 SVG 组，描边动画在 path 上做，体积小、可主题换色。
  - **小型序列帧**：仅对 SVG 难以表达的连续动作（摇尾、跑跳）做 ≤ 8 帧的小尺寸 sprite sheet，限制在单章 ≤ 150KB；**不做整章大位图序列帧**。

### 15.9 照片资源 manifest（章节 scene + 放映厅照片共用）

- 维护一份独立 `photos/manifest`，逐张登记：`id`、`owner`（章节 age / 放映厅 slot）、`src`（多格式）、`width`/`height`、`focalX`/`focalY`（0—1，横竖裁切焦点）、`caption?`、`durationSec?`（放映厅用）、`blurHash`/LQIP。
- **命名**：`photos/<group>/<seq>-<slug>.avif|.webp|.jpg`（如 `photos/screen/01-first-date.avif`）；slug 英文小写连字符，不出现人物真名/隐私字样。
- **响应式 srcset**：按宽度档位出图（如 480w / 768w / 1080w），`<picture>` 内 **AVIF → WebP → JPEG** 顺序回退；服务端按 `Accept` 协商亦可。
- **EXIF 剥离**：构建期**剥除相机/定位/时间/GPS 等 EXIF**，仅保留必要方向；私人项目不外传，但仍按 §11 隐私基线处理。
- **隐私**：照片仅本私人项目使用（同 §15.5）；不上传、不进第三方 CDN 之外的任何分析；文件名/alt 不写可识别隐私。

---

## 16. 错误处理与深链拦截

- 全局 **ErrorBoundary**：兜底页（"这一页迷路了" + 重来按钮），不白屏。
- **深链/路由拦截**：若进入时 hash 指向的 age **大于 `unlockedThrough+1`**，一律忽略该深链，回退定位到当前应处章（`unlockedThrough+1`），并轻提示"回到你上次的进度"；**绝不允许深链跳到未解锁章**。age 非法/越界同样回退。
- 弹层打开期间拦截返回键（§6）；弹层内校验失败留在本章。
- 图片/音频 `onerror` 静默占位；localStorage 异常见 §10；弱网可降级浏览。

---

## 17. 测试矩阵

| 场景 | 期望结果 |
| --- | --- |
| 初始进入 | 仅挂载 Intro 与第 1 章；第 2 章及以后不在 DOM |
| 点主按钮 | 才弹出 bottom-sheet，密码框出现、焦点进入弹层、背景 inert |
| 正确密码 | `validating→success`，揭示 message，延时后解锁下一章并吸附过去 |
| 错误密码 | 留在本章弹层、抖动、`wrongAttempts+1`，不切章 |
| 连错 1 次 / ≥3 次 | 依次可展开 hint1 / fallback |
| 弹层开时按返回键 / Esc | 关闭弹层，焦点归还按钮，**不离开页面** |
| 弹层开时滚动 | 背景不滚动（overscroll 锁住） |
| 22/23 章 | 无密码框，点"我读完了"即解锁下一章 |
| 刷新页面 | 恢复到 `unlockedThrough` 处，未来章仍不可达 |
| 旧版 localStorage | 触发迁移；失败则回到 Intro 并可重来 |
| 深链到未解锁 age | 被拦截，回退到当前章，不剧透 |
| 改 schema（重复答案/章数错） | 构建期即失败 |
| 读屏 / 键盘走查 | 焦点陷阱、aria-live 播报、Tab 循环正常（axe-core 通过） |
| 章节 motion | inView 才触发 entry；离屏/后台暂停循环；reduced-motion 落终态；循环 ≤4s、同章 ≤3 节点 |
| 角色动画 | 手绘描边走 SVG path；Lottie 失败静默降级为静态图，不阻塞解锁 |
| 放映厅 | loading→playing→（paused/skipping）→done；暂停/继续/跳过/静音可用；visibilitychange 自动暂停 |
| 放映厅横竖图 | 横/竖图按 focal point 裁切不裁脸；失败占位不卡死 |
| 照片资源 | srcset 按 AVIF→WebP→JPEG 回退；EXIF 已剥离；并发预载不超预算 |
| 性能预算 | 首屏 <1MB、单章增量、照片解码在限；低端机降级生效（见 §23） |
| 字体门禁 | 全站/Canvas/SVG 导出均为 ZCOOL KuaiLe 栈，缺字回退无豆腐块；此门禁为发布阻塞项 |

- 自动化：Vitest+RTL 覆盖状态机迁移、密码规范化、提示分层、迁移函数、schema 门禁；Playwright（移动视口）覆盖上表 E2E；真机 iOS/安卓走查触控、返回键、音频自动播放。

---

## 18. 埋点

- 私密礼物页**默认不接第三方追踪 SDK**。
- 可选匿名事件：章解锁成功/失败次数、hint 展开层级、完成率——只带 age 与事件名，**绝不记录输入内容、绝不记录答案**。
- 事件默认关闭；如需远程观察发往自建极简端点，开发期仅 console。

---

## 19. 部署 / 缓存 / 回滚

- 纯静态产物，托管 OSS+CDN / GitHub Pages / Vercel / Netlify / Nginx。
- 缓存：带指纹 js/css/图/音 `max-age=31536000, immutable`；`index.html` `no-cache`。
- 发版/回滚：每次构建产出不可变目录，原子切换；回滚 = 重指上一版本。
- 环境 dev/staging/prod；数据与图/PRD 落 `prd/`，与 `codeTec/`、`code/` 并列。
- 可选 Service Worker 预缓存 Intro 与当前章资源（SW 更新需提示刷新）。

---

## 20. 安全与防剧透 / 密码隔离

- **性质**：纯前端答案必然在产物中，无法真正保密；本方案为 **casual 防剧透**（防快滑/误翻），不防懂技术者翻包。
- **密码隔离**：
  - `answer` 集中在独立的 `data/answers.ts`，与章节展示配置分离；**不随首屏 HTML 内联**。
  - 仅在某章 `sheetOpen` 并需要比对时，才加载/取用该章答案；未到章不下载其答案。
  - 比对在纯函数内进行，答案不写入 DOM、不写 URL、不写日志、不上报；展示文案 `message` 仅 `success` 后注入。
- **渲染门禁即最强防剧透**（§3）：未解锁后续章根本不挂载，连占位骨架都不存在，从 DOM 层面杜绝预览。
- 答案不进图片文件名/EXIF；若需更高保密（答案服务端校验）列为二期，本版求离线可用故不做。

---

## 21. 本轮边界与并行分工

- 本轮**仅交付**：本 v2 技术方案（`codeTec/`）+ `code/` 占位 README。
- **不创建**：package.json、任何源码、脚本、构建配置；`code/` 目录除 README 外保持为空。
- 数据以权威 Excel `../prd/迟到的二十三次生日_礼物清单_不限1200预算版.xlsx` 为准。

---

## 22. 回忆放映厅（age25 之后、Finale 之前）

- **位置**：25 章全部走完后、Finale 完结页之前插入一个独立"回忆放映厅"段，作为终章前的照片回顾。
- **timeline 配置驱动**：一份 `reels` 数组配置照片顺序、每张时长与文案；**总时长 30—45 秒，共 10—15 张照片**，每张时长按配置动态给出（默认 2.5—4s，重点照可加长）。
- **状态机**：`loading → playing ⇄ paused → skipping → done`，任一步进入 `error` 均走占位（见下）。
  - `loading`：首图与音频预加载窗口完成前显示加载态。
  - `playing`：自动按 timeline 推进；`paused`：暂停计时与播放。
  - `skipping`：点"跳过"直接结束到 `done`；不播完也可进 Finale。
  - `error`：某图失败显示占位卡 + "跳过此张"，不黑屏、不卡死。
- **控件**：暂停 / 继续 / 跳过 / 静音四个真按钮；进度条指示当前位置。
- **横竖图与裁切**：`<img object-fit: cover>` + `object-position` 取配置的 `focalX/focalY`，横图竖图都不裁到人脸关键部位；竖屏容器内统一居中。
- **预加载窗口**：采用"预取后 N 张"窗口（建议 N=2），播到第 i 张时预载 i+1、i+2；首图在 `loading` 态即就绪。
- **音频策略与自动播放**：放映厅 BGM **复用 Intro「开启」已拿到的用户手势解锁的音频通道**；若自动播放仍被浏览器拦截，自动切**静音播放 + 显示"点按开声"**，不卡死。
- **`visibilitychange`**：切后台即自动 `paused`，回前台不自动续播，等用户点"继续"。
- **返回键**：放映厅打开期间，返回键优先退出放映厅回 age25（或回到 Finale 入口），不直接离开页面；与 §6 弹层返回键优先级一致。
- **无障碍 / 键盘**：容器 `role="region" aria-label="回忆放映厅"`；四个控件可 Tab 聚焦、空格/回车触发；照片切换用 `aria-live="polite"` 播报第几张；reduced-motion 下照片切换用简单淡入，不做推拉特效。

---

## 23. 移动端性能预算与低端机降级

- **预算目标**：
  - 首屏（Intro + 第 1 章 + 字体首子集）**关键资源 < 1MB**，LCP < 3.5s（4G/中端机）。
  - 单章增量资源 < 300KB（图/动效/音频）；未解锁章 0 加载（§3 门禁）。
  - 放映厅照片按 §15.9 出多档，单张 < 200KB；并发预载窗口 ≤ 2。
- **解码与内存**：`<img decoding="async">`、`loading="lazy"`（非首屏）；照片降采样到容器实际所需分辨率；旧图离屏后释放（不常驻 15 张全尺寸位图在内存）。
- **GPU 友好属性**：动画只动 `transform/opacity`；必要时 `will-change` 仅在动画期间加、结束即移除；避免大面积 `box-shadow`/`filter` 同时动画。
- **并发预载上限**：同时进行的图片/音频预取 ≤ 3；超出排队，弱网（`navigator.connection` 有效时）降档为 AVIF/WebP、跳过低优先级装饰。
- **低端机降级**：检测到低内存/低 GPU（`deviceMemory`/`hardwareConcurrency` 阈值或帧率监测掉帧）时——关闭 `ambient`/`character` 循环、降级 Lottie 为静态图、放映厅照片切低分辨率档、关闭视差；核心解锁流程不受影响。
- 测试矩阵见 §17 新增行；真机走查 iOS Safari / 安卓 Chrome 中低端机型。

---

## 24. 字体唯一 ZCOOL 门禁（独立发布阻塞）

- 全站中文/数字/标点（含 Canvas/SVG 导出图、放映厅 caption、弹层、按钮）**唯一**使用 `FONT_HANDWRITING_CJK` 栈（§15.7，首选 ZCOOL KuaiLe）。
- 此门禁为**独立的发布阻塞项（release blocker）**：即使后续动效/放映厅/导出有动态需求，也**不得**为了省事临时替换为系统印刷字体、内联字体或图上压字以外的其他字体；缺字走 §15.7 既定回退，不允许局部字体"例外"。
- 发布前检查：DOM 计算样式、Canvas 导出图、PNG 批次三处字体一致；不一致即**阻断发布**。
