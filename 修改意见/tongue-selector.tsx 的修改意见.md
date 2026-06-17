src\components\tongue-selector.tsx
# TongueSelector 组件审查意见

## ✅ 正确的地方
- 类型定义完善，数据流向清晰。
- 组件拆分合理（`TongueItemSelector` 单选、`TongueMultiItemSelector` 多选）。
- 支持程度修饰符、多选、自定义输入，功能丰富。
- 提供了 `formatTongueData` 工具函数，便于输出文本。
- 使用 `Tooltip` 提供详细的中医解释，专业性强。

---

## ⚠️ 需要关注的问题

### 1. `TongueItemSelector` 中 `showCustomInput` 状态与外部数据不同步（重要）

```tsx
const [showCustomInput, setShowCustomInput] = useState(value.selected === 'other');
```

- **问题**：当外部传入的 `value.selected === 'other'` 时，组件内部状态初始化正确。但如果外部数据变化（例如父组件清空了数据），`showCustomInput` 不会同步更新。
- **影响**：外部清空后，输入框可能仍然显示；或者外部设置了 `'other'` 但输入框未展开。
- **修复**：添加 `useEffect` 同步 `value.selected` 到 `showCustomInput`。

### 2. `TongueMultiItemSelector` 中 `customInputVisible` 状态与外部数据不同步（重要）

```tsx
const [customInputVisible, setCustomInputVisible] = useState(false);
```

- **问题**：多选模式下，`customInputVisible` 独立于外部数据管理。如果外部已有 `'other'` 项，输入框不会自动显示，用户无法编辑已有自定义文本。
- **修复**：添加 `useEffect`，当 `value` 中存在 `'other'` 项时，自动展开输入框。

### 3. 多选模式下，添加自定义项可能重复（重要）

```tsx
const handleAddCustom = () => {
  if (customText.trim()) {
    onChange([...value, { selected: 'other', degree: null, customText: customText.trim() }]);
    // ...
  }
};
```

- **问题**：如果 `value` 中已存在 `selected === 'other'` 的项，点击添加会重复添加。
- **修复**：添加检查，若已存在则更新现有项的 `customText` 而非新增。

### 4. 多选模式下，自定义输入框添加后未自动关闭

- **问题**：添加自定义项后，输入框仍然显示，用户可能误以为未添加成功。
- **修复**：添加成功后自动关闭输入框（`setCustomInputVisible(false)`）。

### 5. 多选模式下，移除自定义项时索引不稳定

```tsx
const handleRemoveCustom = (index: number) => {
  onChange(value.filter((_, i) => i !== index));
};
```

- **问题**：使用索引移除可能因数组顺序变化导致错误移除。虽然 `'other'` 项通常唯一，但不够健壮。
- **修复**：改用 `selected === 'other'` 查找并移除，或使用唯一 ID。

### 6. 缺少多选场景的一键清空功能

- **问题**：多选模式下（舌色、舌形、苔色、苔质），用户需逐个点击移除，不便。
- **修复**：在组件头部添加“清空”按钮，一键清空该分类所有选项。

### 7. 程度修饰符 `'ming-xian'`（明显）在显示中被跳过，但缺少注释说明

```tsx
if (degreeMod && degreeMod.id !== 'ming-xian') {
  return `${degreeMod.name}${opt?.name || ''}`;
}
```

- **问题**：逻辑上“明显”是默认程度，不显示可理解，但未说明原因，可能让维护者困惑。
- **修复**：添加注释说明，或考虑改为配置化显示逻辑。

### 8. 单选模式下，选择“其它”后清空数据，`showCustomInput` 未重置

- **场景**：用户选择“其它” → 输入内容 → 点击清空 → `showCustomInput` 仍为 `true`。
- **修复**：在 `handleClear` 中将 `showCustomInput` 设为 `false`。

### 9. 多选模式下，自定义输入框的 `customText` 状态与外部值不同步

- **问题**：`customText` 是内部状态，当外部有 `'other'` 项时，输入框显示的是内部状态而非外部值。
- **修复**：当 `customInputVisible` 变为 `true` 时，从外部数据中读取已有 `'other'` 的 `customText` 并填充。

### 10. `formatTongueItem` 对 `'other'` 的处理可能返回空字符串

```tsx
if (item.selected === 'other') return item.customText || '其它';
```

- 当前逻辑已处理 `customText` 为空时显示“其它”，合理。

---

## 🚀 推荐优化方案

### 1. 添加 `useEffect` 同步 `showCustomInput`（单选模式）

```tsx
useEffect(() => {
  setShowCustomInput(value.selected === 'other');
}, [value.selected]);
```

### 2. 添加 `useEffect` 同步 `customInputVisible`（多选模式）

```tsx
useEffect(() => {
  const hasOther = value.some((v) => v.selected === 'other');
  setCustomInputVisible(hasOther);
  if (hasOther) {
    const otherItem = value.find((v) => v.selected === 'other');
    setCustomText(otherItem?.customText || '');
  }
}, [value]);
```

### 3. 修复多选模式自定义项重复问题

```tsx
const handleAddCustom = () => {
  if (!customText.trim()) return;
  
  const existingOtherIndex = value.findIndex((v) => v.selected === 'other');
  if (existingOtherIndex >= 0) {
    // 更新已有自定义项
    const newValue = [...value];
    newValue[existingOtherIndex] = { ...newValue[existingOtherIndex], customText: customText.trim() };
    onChange(newValue);
  } else {
    onChange([...value, { selected: 'other', degree: null, customText: customText.trim() }]);
  }
  setCustomText('');
  setCustomInputVisible(false);
};
```

### 4. 修复多选模式移除自定义项

```tsx
const handleRemoveCustom = () => {
  onChange(value.filter((v) => v.selected !== 'other'));
};
```

### 5. 为多选模式添加一键清空功能

```tsx
// 在 TongueMultiItemSelector 组件中添加
<div className="flex items-center justify-between mb-1.5">
  <div className="text-xs font-medium text-foreground">{label}</div>
  {value.length > 0 && (
    <button
      type="button"
      onClick={() => onChange([])}
      className="text-xs text-muted-foreground hover:text-error flex items-center gap-0.5"
    >
      <X className="w-3 h-3" />
      清空全部
    </button>
  )}
</div>
```

### 6. 修复单选模式清空后 `showCustomInput` 重置

```tsx
const handleClear = () => {
  setShowCustomInput(false);
  onChange({ selected: null, degree: null, customText: '' });
};
```

### 7. 添加注释说明程度修饰符显示逻辑

```tsx
// 'ming-xian'（明显）作为默认程度，不额外显示文字
if (degreeMod && degreeMod.id !== 'ming-xian') {
  return `${degreeMod.name}${opt?.name || ''}`;
}
```

---

## 📦 其他建议
- 考虑为多选模式添加“最大选择数量”限制，防止用户选择过多。
- 可添加 `disabled` 属性支持只读模式。
- 考虑将 `DEGREE_MODIFIERS` 中的默认项标记为 `isDefault: true`，替代硬编码 `'ming-xian'`。

---

## ✅ 总结
组件整体设计优秀，功能完善。主要问题集中在**内部状态与外部数据的同步**上，尤其是自定义输入框的显示状态。修复这些同步问题后，组件将具备良好的生产级可用性。