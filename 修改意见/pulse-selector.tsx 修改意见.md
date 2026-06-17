src\components\pulse-selector.tsx
好的，这是对 `PulseSelector` 组件的审查意见，您可以直接复制使用：

---

# PulseSelector 组件审查意见

## ✅ 正确的地方
- 类型定义完整，数据流清晰。
- 组件拆分合理（`HandPulseSection`、`PulsePositionSelector`）。
- 使用 `Tooltip` 提供详细说明，提升用户体验。
- 支持多选主脉、修饰符，以及自定义脉象，功能丰富。
- 提供了 `formatPulseData` 工具函数，方便输出文本。
- 默认值结构完善，易于重置。

---

## ⚠️ 需要注意的问题

### 1. `showCustomInput` 状态与外部数据不同步（重要）
- **问题**：`PulsePositionSelector` 内部使用 `useState(false)` 控制自定义输入框的显示，但外部传入的 `value.customText` 可能有值，而 `showCustomInput` 可能为 `false`，导致已有自定义文本无法编辑。
- **影响**：用户无法修改之前输入的“其它”文本。
- **修复**：根据 `value.customText` 是否存在来初始化 `showCustomInput`，或者在 `value.customText` 变化时同步状态。

### 2. `handleAddCustom` 添加后未关闭输入框
- 添加自定义脉象后，输入框仍然显示，且 `customText` 被清空，用户可能误以为未添加成功。
- **修复**：添加成功后自动关闭输入框（`setShowCustomInput(false)`）。

### 3. 清空按钮 `handleClear` 未重置 `showCustomInput`
- 清空脉位时，`showCustomInput` 保持 `true`，但 `customText` 被清空，可能留下空白输入框。
- **修复**：在清空时也将 `showCustomInput` 设为 `false`。

### 4. 修饰符选择中使用非空断言（类型安全风险）
```tsx
onClick={() => handleModifierToggle(item.mainPulse!, mod.id)}
```
- `item.mainPulse` 在类型中定义为 `string`，过滤掉 `'other'` 后不会为 `undefined`，但非空断言不够安全。
- **修复**：改用 `item.mainPulse` 并确保类型守卫。

### 5. `formatPulsePosition` 处理 `customText` 可能为空
- 当 `item.mainPulse === 'other'` 时，`pos.customText` 可能为空字符串，当前返回 `pos.customText || '其它'` 更合理。

### 6. 缺少对 `overall` 的独立清空功能
- 总体脉象区块没有清空按钮，用户需手动取消每个脉象，不便。
- **修复**：在 `PulseSelector` 中为 `overall` 添加清空按钮。

### 7. `PULSE_TYPES.slice(0, 15)` 硬编码
- 如果未来脉象数量变动，硬编码数字可能不灵活。
- **修复**：定义常量 `DEFAULT_VISIBLE_PULSES = 15` 或动态计算。

---

## 🚀 推荐优化方案

### 1. 同步 `showCustomInput` 与 `customText`
在 `PulsePositionSelector` 中添加 `useEffect`：
```tsx
useEffect(() => {
  if (value.customText) {
    setShowCustomInput(true);
    setCustomText(value.customText);
  }
}, [value.customText]);
```

### 2. 完善 `handleAddCustom`
```tsx
const handleAddCustom = () => {
  if (customText.trim()) {
    onChange({
      ...value,
      pulses: [...value.pulses, { mainPulse: 'other', modifiers: [] }],
      customText: customText.trim(),
    });
    setCustomText('');
    setShowCustomInput(false);  // 关闭输入框
  }
};
```

### 3. 完善 `handleClear`
```tsx
const handleClear = () => {
  setShowCustomInput(false);
  setCustomText('');
  onChange({ pulses: [], customText: '' });
};
```

### 4. 优化 `formatPulsePosition`
```tsx
if (item.mainPulse === 'other') {
  return pos.customText || '其它';
}
```

### 5. 为总体脉象添加清空按钮
在 `PulseSelector` 中：
```tsx
<PulsePositionSelector
  value={value.overall || emptyPulsePosition}
  onChange={(posData) => onChange({ ...value, overall: posData })}
  showPositionLabel={false}
  showClearButton={true}   // 添加 prop
/>
```

---

## ✅ 总结
组件整体质量高，功能完整，仅存在 UI 状态同步问题和少数细节优化点。修复上述问题后，可作为生产级组件使用。