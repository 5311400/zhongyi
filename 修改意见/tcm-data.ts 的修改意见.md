src\lib\tcm-data.ts
# tcm-data.ts 数据字典审查意见

## ✅ 优点
- 数据覆盖全面，涵盖脉象、舌象、面色、神情、中药等核心中医诊断要素。
- 结构清晰，各模块分类合理，注释详尽。
- 提供辅助函数（`getPulseDescription` 等）方便调用。
- 中药数据包含常用剂量、特殊处理标记，实用性强。

---

## ⚠️ 需要注意的问题

### 1. 脉象 ID 命名存在歧义（`'fu'` 与 `'fu2'`）
```ts
{ id: 'fu', name: '浮' },   // 浮脉
{ id: 'fu2', name: '伏' },  // 伏脉
```
- **问题**：`'fu2'` 不是直观的命名，可能被误解为“浮脉的第二个”或“浮2”，实际代表“伏脉”。
- **建议**：改为 `'fu-cang'` 或 `'fu'` 和 `'fu-2'`，但最清晰的是用拼音全称 `'fu'`（浮）和 `'fu-mai'`（伏）或 `'fu-v'`。或者直接使用汉字拼音首字母区分（如 `'fu'` 和 `'fu_'`），但 `'fu2'` 容易混淆。不过当前不影响功能，仅可读性问题。

### 2. `PULSE_DETAILS` 中 `'fu2'` 的解释是否正确？
```ts
fu2: {
  feature: '推筋着骨始得',
  meaning: '主邪闭、剧烈疼痛、厥证',
}
```
- 符合伏脉特征，但命名需与 `PULSE_TYPES` 中 `id: 'fu2'` 对应，一致。

### 3. 舌色 `'an'`（暗）的详细解释缺失
```ts
TONGUE_COLORS 中有 { id: 'an', name: '暗', description: '舌色晦暗不泽...' }
```
- 但 `TONGUE_COLOR_DETAILS` 中没有 `'an'` 的条目，导致调用 `getTongueColorDescription('an')` 返回空字符串。
- **修复**：补充 `'an'` 的解释，例如：
```ts
'an': { meaning: '主气血瘀滞、脏腑功能减退', symptoms: '多见于慢性病、久病入络' }
```

### 4. 舌形 `'qing-jin'`（青筋）无对应详细解释
- `TONGUE_SHAPES` 包含 `'qing-jin'`，但 `TONGUE_SHAPE_DETAILS` 并未定义（本文件未单独定义舌形详细解释，仅舌色和苔色有详细）。但 `TongueSelector` 组件未使用 `TONGUE_SHAPE_DETAILS`，所以目前不影响。但建议补充或明确注释。

### 5. 面色 `'chang'`（常色）的解释较为笼统
- 当前 `FACE_COLOR_DETAILS` 中 `chang` 的描述为“健康状态”，但可能需更详细的说明，如“正常肤色，红黄隐隐，明润含蓄”等，与 `FACE_COLORS` 中的 description 一致即可，不必重复。

### 6. 部分中药特殊处理分类可能不完整
- `HERB_SPECIAL_HANDLING` 中 `dissolve`（烊化）只有阿胶、鹿角胶等，但像龟板胶也应加入，目前已有。
- 检查是否有遗漏：例如“芒硝”常需冲服，但未标记特殊处理，可根据临床实际补充。

### 7. `COMMON_HERBS` 中重复条目（`麻黄`、`生姜`、`白芍`、`当归` 等出现多次）
- 例如 `麻黄` 出现在解表药和止咳平喘药中，`生姜` 出现在解表和“其他”中，`白芍` 出现在活血和补益中，`当归` 出现在活血和补益中。
- **问题**：它们虽然是同一药材，但重复定义可能引发混淆，且 `addHerb` 函数通过名称去重，会保留第一个匹配，影响不大。但若未来修改剂量或单位，可能因重复而遗漏。
- **建议**：统一归类，避免重复，或使用 `unique` 数组确保不重复（但当前已通过名称去重，实际无运行时错误，仅数据冗余）。

### 8. 辅助函数 `getHerbSpecialHandling` 按顺序匹配，可能导致误判
- 如果一个药同时存在于 `decoct_first` 和 `decoct_last`（理论上不应出现），会返回先匹配的先煎。但实际数据中无冲突，安全。

### 9. 部分类型使用 `any` 或 `Record<string, ...>` 不够严格
- 例如 `PULSE_DETAILS` 的类型是 `Record<string, { feature: string; meaning: string; examples?: string }>`，未使用 `as const`，可提升类型安全。

---

## 🚀 优化建议

### 1. 改善脉象 ID 命名
```ts
{ id: 'fu-mai', name: '浮' }   // 或直接 'fu'
{ id: 'fu-cang', name: '伏' }  // 明确表示伏脉
```
若保持简短，可添加注释说明。

### 2. 补充缺失的解释
- 添加 `TONGUE_COLOR_DETAILS['an']` 的解释。
- 考虑为舌形、舌态也增加详细解释对象，或在组件中利用现有 description 字段。

### 3. 统一中药分类，移除重复项
- 可将 `COMMON_HERBS` 改为 `Set` 或使用 `Map` 确保唯一性，或按类别分组但每个药材只出现一次，用 `categories: string[]` 表示多分类。

### 4. 使用 `as const` 强化类型推断
```ts
export const PULSE_TYPES = [ ... ] as const;
```
这样 `PULSE_TYPES[0]['id']` 会是字面量类型，提升类型安全。

### 5. 添加缺失的详细解释对象
- 为舌形、舌态定义 `TONGUE_SHAPE_DETAILS`、`TONGUE_STATE_DETAILS`，与 `TongueSelector` 组件的 `details` 属性对齐，以支持提示。

### 6. 增加数据校验函数（可选）
- 在开发环境下可添加 `validateTCMData` 检查所有 `PULSE_TYPES` 是否在 `PULSE_DETAILS` 中有对应键，类似地检查其他模块，避免遗漏。

### 7. 为中药特殊处理增加更细粒度（如“冲服”）
- 可扩展 `HERB_SPECIAL_HANDLING` 增加 `'wash'`（冲服）或 `'chew'`（嚼服）等，根据临床需要。

---

## ✅ 总结
该数据文件整体质量较高，数据准确，结构清晰，与前端组件配合良好。主要改进点在于**补充遗漏的舌色解释**和**优化脉象 ID 命名**，以及考虑数据去重和类型强化。修复后可作为生产级中医数据字典使用。