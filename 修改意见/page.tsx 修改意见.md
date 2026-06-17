src\app\patients\[id]\records\new\page.tsx
好的，我理解您不需要代码，只需要之前对 `RecordEditPage` 组件的错误分析和优化建议。以下是完整的审查意见，您可以直接复制粘贴使用：

---

# RecordEditPage 组件审查意见

## 🔴 必须修复的关键错误

### 1. 完全忽略路由参数，所有病历都录给同一个患者（严重）
```tsx
const patient = { id: 'p001', name: '陈秀英', age: 58, gender: '女' };  // 硬编码
```
- **后果**：无论 URL 是 `/patients/p002/records/new` 还是 `p999`，页面永远显示“陈秀英”，病历也归属 `p001`。
- **修复**：解析 `params` 并根据 ID 获取患者信息（从 API、sessionStorage 或本地数据），填充到表单中（过敏史、体质等默认值应从患者资料继承）。

### 2. 保存后跳转逻辑脆弱且破坏 SPA 体验
```tsx
const pathParts = window.location.pathname.split('/');
const currentPatientId = pathParts[patientIdIndex];
window.location.href = `/patients/${currentPatientId}`;
```
- **问题**：依赖 URL 字符串解析，若路由层级变化容易出错；且全页刷新，丢失状态。
- **修复**：使用 `useRouter` 的 `push` 方法，直接从 `params` 获取 ID。

### 3. 照片上传的 `FileReader` 缺少错误处理
```tsx
const reader = new FileReader();
reader.onload = (e) => { /* ... */ };
reader.readAsDataURL(file);
```
- **问题**：如果文件读取失败（如损坏），`onerror` 未监听，`uploadingPhoto` 永远为 `true`，导致上传按钮不可用。
- **修复**：添加 `reader.onerror = () => { setUploadingPhoto(false); alert('读取文件失败'); }`。

---

## ⚠️ 其他需要关注的问题

| 问题 | 影响 | 优化建议 |
|------|------|----------|
| **`params` 异步处理缺失** | 未使用 `await` 或 `.then()`，无法获取真正的 ID | 使用 `useEffect` 或 React 19 的 `use` 钩子解析参数 |
| **`herbSearch` 全局状态共享** | 所有药材输入框共用搜索词，可能造成混淆 | 改为每个输入框独立搜索状态，或输入时清空搜索词 |
| **表单缺少必填验证** | 可保存空主诉、空处方等无效数据 | 在 `handleSave` 中添加校验，阻止保存并提示 |
| **`saveStatus` 的 `'saved'` 状态未使用** | 浪费状态 | 可移除或用于显示“已保存”提示 |
| **Tailwind 类 `w-4.5` 无效** | 图标宽度可能不生效 | 改用 `w-[18px]` 或 `w-4`（`w-4` 是 1rem=16px） |
| **`TooltipProvider` 未全局包裹** | 局部包裹可以工作，但若多个组件共用一个 Provider 更佳 | 可在根布局中统一提供 |
| **`FileTextIcon` 自定义 SVG** | 功能正常，但可复用 `lucide-react` 的 `FileText` | 直接用 `FileText` 即可（已导入但未使用） |
| **AI 辨证 SSE 解析可能不完整** | 当数据跨多个 chunk 时可能截断 | 使用更健壮的 SSE 解析库或优化拼接逻辑 |
| **未处理患者不存在的情况** | 传入无效 ID 会显示空白信息 | 重定向到 404 或显示“患者不存在” |

---

## 🚀 推荐优化方案

### 1. 正确获取患者信息并初始化表单
```tsx
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RecordEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    params.then(async ({ id }) => {
      if (!isMounted) return;
      // 从 API 或本地数据获取患者信息
      const data = await fetchPatient(id); // 或从 PATIENTS 常量读取
      if (data) {
        setPatient(data);
        // 初始化表单字段（过敏史、体质等）
        setAllergies(data.allergies || []);
        setConstitution(data.constitution || '');
      } else {
        router.replace('/404'); // 患者不存在
      }
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!patient) return null;
  // ... 其余逻辑
}
```

### 2. 使用 `useRouter` 跳转并传入正确 ID
```tsx
const handleSave = async () => {
  setSaveStatus('saving');
  try {
    await saveRecord({ ...formData, patientId: patient.id });
    router.push(`/patients/${patient.id}`);
  } catch (error) {
    setSaveStatus('idle');
    alert('保存失败');
  }
};
```

### 3. 修复照片上传错误处理
```tsx
const handlePhotoUpload = (type: 'tongue' | 'face', file: File) => {
  setUploadingPhoto(true);
  const reader = new FileReader();
  reader.onload = (e) => {
    setPhotos(prev => [...prev, { id: `photo-${Date.now()}`, type, url: e.target?.result as string, name: file.name }]);
    setUploadingPhoto(false);
  };
  reader.onerror = () => {
    setUploadingPhoto(false);
    alert('读取文件失败，请重试');
  };
  reader.readAsDataURL(file);
};
```

### 4. 优化中药搜索下拉
- 为每个药材输入框维护独立的 `search` 状态，或使用 `useRef` 保存当前输入值。
- 简单方案：在输入框 `onFocus` 时清空 `herbSearch`，在 `onBlur` 时延迟清空，保证下拉列表只针对当前输入框的内容。

### 5. 添加表单基本校验
```tsx
const handleSave = async () => {
  if (!chiefComplaint.trim()) return alert('请填写主诉');
  if (herbs.length === 0) return alert('请添加至少一味中药');
  // ... 其他校验
  // 保存逻辑
};
```

### 6. 移除无效 Tailwind 类
将 `w-4.5` 改为 `w-4` 或 `w-[18px]`。

### 7. 使用统一的 `TooltipProvider`
建议在根布局中包裹 `<TooltipProvider>`，而非在每个使用处重复。

---

## 📦 其他建议
- **提取患者数据获取逻辑**：若使用 `PATIENTS` 常量，直接同步读取即可，无需 API。
- **考虑使用 `use` 钩子**（React 19）：`const { id } = use(params);` 可简化代码。
- **保存状态展示**：保存成功后显示短暂提示再跳转，提升体验。
- **代码分割**：将 `Section`、`Field`、`ChipGroup` 等提取到单独文件，减少组件体积。

---

## ✅ 总结
当前代码可运行，但功能缺陷严重（所有病历归属同一患者）。必须优先修复路由参数解析问题，其余为健壮性和用户体验优化。按上述方案重构后，组件将具备生产可用性。