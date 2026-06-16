'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import {
  TONGUE_COLORS,
  TONGUE_SHAPES,
  TONGUE_STATES,
  COAT_COLORS,
  COAT_TEXTURES,
  DEGREE_MODIFIERS,
  TONGUE_COLOR_DETAILS,
  COAT_COLOR_DETAILS,
  COAT_TEXTURE_DETAILS,
} from '@/lib/tcm-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * 单项舌象数据（带程度修饰符）
 */
export interface TongueItemData {
  selected: string | null; // 选中项 ID
  degree: string | null; // 程度修饰符 ID
  customText?: string; // 自定义填写内容（选择"其它"时）
}

/**
 * 舌象完整数据
 */
export interface TongueData {
  tongueColor: TongueItemData[]; // 舌色（可多选，如暗紫）
  tongueShape: TongueItemData[]; // 舌形（可多选）
  tongueState: TongueItemData; // 舌态（可选）
  coatColor: TongueItemData[]; // 苔色（可多选）
  coatTexture: TongueItemData[]; // 苔质（可多选）
  customNotes?: string; // 自定义备注
}

// 默认空舌象项数据
const emptyTongueItem: TongueItemData = {
  selected: null,
  degree: null,
  customText: '',
};

// 默认舌象数据
export const defaultTongueData: TongueData = {
  tongueColor: [],
  tongueShape: [],
  tongueState: { ...emptyTongueItem },
  coatColor: [],
  coatTexture: [],
  customNotes: '',
};

/**
 * 舌象选择组件属性
 */
interface TongueSelectorProps {
  value: TongueData;
  onChange: (data: TongueData) => void;
}

/**
 * 舌象选择组件
 * 支持舌色、舌形、舌态、苔色、苔质分开选择，带程度修饰符
 */
export function TongueSelector({ value, onChange }: TongueSelectorProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* 舌质部分 */}
        <div className="bg-surface-container/20 rounded-lg p-3 border border-outline-variant/20">
          <div className="text-xs font-bold text-foreground mb-3">舌质</div>

          {/* 舌色（可多选） */}
          <TongueMultiItemSelector
            label="舌色"
            options={TONGUE_COLORS}
            details={TONGUE_COLOR_DETAILS}
            value={value.tongueColor}
            onChange={(items) => onChange({ ...value, tongueColor: items })}
            showDegree={true}
          />

          {/* 舌形（可多选） */}
          <TongueMultiItemSelector
            label="舌形"
            options={TONGUE_SHAPES}
            value={value.tongueShape}
            onChange={(items) => onChange({ ...value, tongueShape: items })}
            showDegree={true}
          />

          {/* 舌态 */}
          <TongueItemSelector
            label="舌态"
            options={TONGUE_STATES}
            value={value.tongueState}
            onChange={(item) => onChange({ ...value, tongueState: item })}
            showDegree={false}
          />
        </div>

        {/* 苔质部分 */}
        <div className="bg-surface-container/20 rounded-lg p-3 border border-outline-variant/20">
          <div className="text-xs font-bold text-foreground mb-3">舌苔</div>

          {/* 苔色（可多选） */}
          <TongueMultiItemSelector
            label="苔色"
            options={COAT_COLORS}
            details={COAT_COLOR_DETAILS}
            value={value.coatColor}
            onChange={(items) => onChange({ ...value, coatColor: items })}
            showDegree={true}
          />

          {/* 苔质（可多选） */}
          <TongueMultiItemSelector
            label="苔质"
            options={COAT_TEXTURES}
            details={COAT_TEXTURE_DETAILS}
            value={value.coatTexture}
            onChange={(items) => onChange({ ...value, coatTexture: items })}
            showDegree={true}
          />
        </div>

        {/* 自定义备注 */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            舌象备注
          </label>
          <textarea
            value={value.customNotes || ''}
            onChange={(e) => onChange({ ...value, customNotes: e.target.value })}
            rows={2}
            placeholder="补充描述舌象特征，如：舌体胖大边有齿痕，苔白腻微黄..."
            className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * 单项舌象选择器（单选）
 */
interface TongueItemSelectorProps {
  label: string;
  options: { id: string; name: string; description?: string }[];
  details?: Record<string, { meaning: string; symptoms: string }>;
  value: TongueItemData;
  onChange: (data: TongueItemData) => void;
  showDegree?: boolean;
}

function TongueItemSelector({
  label,
  options,
  details,
  value,
  onChange,
  showDegree = false,
}: TongueItemSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(value.selected === 'other');

  useEffect(() => {
    setShowCustomInput(value.selected === 'other');
  }, [value.selected]);

  // 选择项
  const handleSelect = (id: string) => {
    if (id === 'other') {
      setShowCustomInput(true);
      onChange({ selected: 'other', degree: null, customText: '' });
    } else {
      setShowCustomInput(false);
      onChange({ selected: id, degree: null, customText: '' });
    }
  };

  // 选择程度
  const handleDegreeSelect = (degreeId: string) => {
    onChange({ ...value, degree: degreeId });
  };

  // 清空
  const handleClear = () => {
    setShowCustomInput(false);
    onChange({ selected: null, degree: null, customText: '' });
  };

  // 获取显示文本
  const getDisplayText = () => {
    if (!value.selected) return '';
    if (value.selected === 'other') return value.customText || '其它';
    const opt = options.find((o) => o.id === value.selected);
    const degreeMod = DEGREE_MODIFIERS.find((d) => d.id === value.degree);
    if (degreeMod && degreeMod.id !== 'ming-xian') {
      return `${degreeMod.name}${opt?.name || ''}`;
    }
    return opt?.name || '';
  };

  const displayText = getDisplayText();

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs font-medium text-foreground">{label}</div>
        {displayText && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-error flex items-center gap-0.5"
          >
            <X className="w-3 h-3" />
            清空
          </button>
        )}
      </div>

      {/* 当前选中显示 */}
      {displayText && (
        <div className="mb-1.5 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium inline-block">
          {displayText}
        </div>
      )}

      {/* 选项按钮 */}
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <Tooltip key={opt.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`h-7 px-2 rounded text-xs transition-colors ${
                  value.selected === opt.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
                }`}
              >
                {opt.name}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px]">
              <div className="text-xs">
                {opt.description && <p className="mb-1">{opt.description}</p>}
                {details && details[opt.id] && (
                  <p className="whitespace-pre-line">
                    【主病】{details[opt.id].meaning}
                    {'\n'}【表现】{details[opt.id].symptoms}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {/* 其它选项 */}
        <button
          type="button"
          onClick={() => handleSelect('other')}
          className={`h-7 px-2 rounded text-xs transition-colors ${
            value.selected === 'other'
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
          }`}
        >
          其它
        </button>
      </div>

      {/* 自定义输入 */}
      {showCustomInput && (
        <input
          type="text"
          value={value.customText || ''}
          onChange={(e) => onChange({ ...value, customText: e.target.value })}
          placeholder="输入自定义描述..."
          className="mt-1.5 w-full h-7 px-2 bg-surface-container border border-outline-variant/30 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}

      {/* 程度修饰符 */}
      {showDegree && value.selected && value.selected !== 'other' && (
        <div className="mt-1.5">
          <div className="text-[10px] text-muted-foreground mb-1">程度</div>
          <div className="flex flex-wrap gap-1">
            {DEGREE_MODIFIERS.map((deg) => (
              <Tooltip key={deg.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleDegreeSelect(deg.id)}
                    className={`h-6 px-1.5 rounded text-[10px] transition-colors ${
                      value.degree === deg.id
                        ? 'bg-primary/20 text-primary border border-primary/30 font-medium'
                        : 'bg-surface-container/50 border border-outline-variant/20 hover:bg-surface-container/70'
                    }`}
                  >
                    {deg.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[150px]">
                  <p className="text-xs">{deg.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 多项舌象选择器（可多选）
 */
interface TongueMultiItemSelectorProps {
  label: string;
  options: { id: string; name: string; description?: string }[];
  details?: Record<string, { meaning: string; symptoms: string }>;
  value: TongueItemData[];
  onChange: (items: TongueItemData[]) => void;
  showDegree?: boolean;
}

function TongueMultiItemSelector({
  label,
  options,
  details,
  value,
  onChange,
  showDegree = false,
}: TongueMultiItemSelectorProps) {
  const [customInputVisible, setCustomInputVisible] = useState(false);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    const hasOther = value.some((v) => v.selected === 'other');
    setCustomInputVisible(hasOther);
    if (hasOther) {
      const otherItem = value.find((v) => v.selected === 'other');
      setCustomText(otherItem?.customText || '');
    }
  }, [value]);

  // 添加选项
  const handleAdd = (id: string) => {
    if (!value.find((v) => v.selected === id)) {
      onChange([...value, { selected: id, degree: null, customText: '' }]);
    }
  };

  // 移除选项
  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v.selected !== id));
  };

  // 更新某项的程度
  const handleDegreeChange = (id: string | null, degreeId: string) => {
    if (!id) return;
    onChange(
      value.map((v) => (v.selected === id ? { ...v, degree: degreeId } : v))
    );
  };

  // 添加自定义项
  const handleAddCustom = () => {
    if (!customText.trim()) return;
    const existingOtherIndex = value.findIndex((v) => v.selected === 'other');
    if (existingOtherIndex >= 0) {
      const newValue = [...value];
      newValue[existingOtherIndex] = { ...newValue[existingOtherIndex], customText: customText.trim() };
      onChange(newValue);
    } else {
      onChange([...value, { selected: 'other', degree: null, customText: customText.trim() }]);
    }
    setCustomText('');
    setCustomInputVisible(false);
  };

  // 移除自定义项
  const handleRemoveCustom = () => {
    onChange(value.filter((v) => v.selected !== 'other'));
  };

  // 获取显示文本
  const getDisplayText = (item: TongueItemData): string => {
    if (item.selected === 'other') return item.customText || '其它';
    const opt = options.find((o) => o.id === item.selected);
    const degreeMod = DEGREE_MODIFIERS.find((d) => d.id === item.degree);
    if (degreeMod && degreeMod.id !== 'ming-xian') {
      return `${degreeMod.name}${opt?.name || ''}`;
    }
    return opt?.name || '';
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground hover:text-error transition-colors"
          >
            清空全部
          </button>
        )}
      </div>

      {/* 已选项目显示 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((item, idx) => (
            <div
              key={item.selected === 'other' ? `other-${idx}` : item.selected}
              className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1"
            >
              {getDisplayText(item)}
              <button
                type="button"
                onClick={() =>
                  item.selected === 'other'
                    ? handleRemoveCustom()
                    : item.selected && handleRemove(item.selected)
                }
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 选项按钮 */}
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isSelected = value.some((v) => v.selected === opt.id);
          return (
            <Tooltip key={opt.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleAdd(opt.id)}
                  disabled={isSelected}
                  className={`h-7 px-2 rounded text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
                  }`}
                >
                  {opt.name}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                <div className="text-xs">
                  {opt.description && <p className="mb-1">{opt.description}</p>}
                  {details && details[opt.id] && (
                    <p className="whitespace-pre-line">
                      【主病】{details[opt.id].meaning}
                      {'\n'}【表现】{details[opt.id].symptoms}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {/* 其它按钮 */}
        <button
          type="button"
          onClick={() => setCustomInputVisible(!customInputVisible)}
          className={`h-7 px-2 rounded text-xs transition-colors ${
            customInputVisible
              ? 'bg-primary text-primary-foreground font-medium'
              : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
          }`}
        >
          其它
        </button>
      </div>

      {/* 自定义输入 */}
      {customInputVisible && (
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="输入自定义描述..."
            className="flex-1 h-7 px-2 bg-surface-container border border-outline-variant/30 rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="h-7 px-3 bg-surface-container border border-outline-variant/30 rounded text-xs hover:bg-surface-container/70"
          >
            添加
          </button>
        </div>
      )}

      {/* 程度修饰符（为每个已选项显示） */}
      {showDegree && value.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {value.map((item) => {
            if (item.selected === 'other' || !item.selected) return null;
            const opt = options.find((o) => o.id === item.selected);
            return (
              <div key={item.selected} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{opt?.name}程度：</span>
                <div className="flex flex-wrap gap-1">
                  {DEGREE_MODIFIERS.map((deg) => (
                    <button
                      key={deg.id}
                      type="button"
                      onClick={() => handleDegreeChange(item.selected, deg.id)}
                      className={`h-5 px-1.5 rounded text-[10px] transition-colors ${
                        item.degree === deg.id
                          ? 'bg-primary/20 text-primary border border-primary/30 font-medium'
                          : 'bg-surface-container/50 border border-outline-variant/20 hover:bg-surface-container/70'
                      }`}
                    >
                      {deg.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 将舌象数据转换为显示文本
 */
export function formatTongueData(data: TongueData): string {
  const parts: string[] = [];

  // 舌色（可多选）
  if (data.tongueColor.length > 0) {
    const colors = data.tongueColor
      .map((item) => formatTongueItem(item, TONGUE_COLORS))
      .filter(Boolean)
      .join('、');
    if (colors) parts.push(`舌色${colors}`);
  }

  // 舌形
  if (data.tongueShape.length > 0) {
    const shapes = data.tongueShape
      .map((item) => formatTongueItem(item, TONGUE_SHAPES))
      .filter(Boolean)
      .join('、');
    if (shapes) parts.push(`舌形${shapes}`);
  }

  // 舌态
  if (data.tongueState.selected) {
    const state = formatTongueItem(data.tongueState, TONGUE_STATES);
    if (state) parts.push(`舌态${state}`);
  }

  // 苔色（可多选）
  if (data.coatColor.length > 0) {
    const colors = data.coatColor
      .map((item) => formatTongueItem(item, COAT_COLORS))
      .filter(Boolean)
      .join('、');
    if (colors) parts.push(`苔色${colors}`);
  }

  // 苔质
  if (data.coatTexture.length > 0) {
    const textures = data.coatTexture
      .map((item) => formatTongueItem(item, COAT_TEXTURES))
      .filter(Boolean)
      .join('、');
    if (textures) parts.push(`苔质${textures}`);
  }

  // 备注
  if (data.customNotes) parts.push(data.customNotes);

  return parts.join('；') || '未填写';
}

/**
 * 格式化单项舌象
 */
function formatTongueItem(
  item: TongueItemData,
  options: { id: string; name: string }[]
): string {
  if (!item.selected) return '';
  if (item.selected === 'other') return item.customText || '其它';

  const opt = options.find((o) => o.id === item.selected);
  const degreeMod = DEGREE_MODIFIERS.find((d) => d.id === item.degree);

  if (degreeMod && degreeMod.id !== 'ming-xian') {
    return `${degreeMod.name}${opt?.name || ''}`;
  }
  return opt?.name || '';
}