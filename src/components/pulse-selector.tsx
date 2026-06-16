'use client';

import { useState } from 'react';
import { Info, X, Plus } from 'lucide-react';
import {
  PULSE_TYPES,
  PULSE_MODIFIERS,
  PULSE_DETAILS,
  getPulseDescription,
} from '@/lib/tcm-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * 单个脉象项（主脉+修饰符）
 */
export interface PulseItemData {
  mainPulse: string; // 主脉 ID
  modifiers: string[]; // 修饰符 ID 列表
}

/**
 * 单个脉位的数据结构（支持多选主脉）
 */
export interface PulsePositionData {
  pulses: PulseItemData[]; // 多个主脉，每个带自己的修饰符
  customText?: string; // 自定义填写内容（选择"其它"时）
}

/**
 * 一只手的脉象数据
 */
export interface HandPulseData {
  cun: PulsePositionData; // 寸脉
  guan: PulsePositionData; // 关脉
  chi: PulsePositionData; // 尺脉
}

/**
 * 完整脉象数据
 */
export interface FullPulseData {
  leftHand: HandPulseData;
  rightHand: HandPulseData;
  overall?: PulsePositionData; // 总体脉象（可选）
  customNotes?: string; // 自定义备注
}

// 默认空脉位数据
const emptyPulsePosition: PulsePositionData = {
  pulses: [],
  customText: '',
};

// 默认空手脉数据
const emptyHandPulse: HandPulseData = {
  cun: { ...emptyPulsePosition },
  guan: { ...emptyPulsePosition },
  chi: { ...emptyPulsePosition },
};

// 默认完整脉象数据
export const defaultFullPulseData: FullPulseData = {
  leftHand: { ...emptyHandPulse },
  rightHand: { ...emptyHandPulse },
  overall: { ...emptyPulsePosition },
  customNotes: '',
};

/**
 * 脉象选择组件属性
 */
interface PulseSelectorProps {
  value: FullPulseData;
  onChange: (data: FullPulseData) => void;
}

/**
 * 脉象选择组件
 * 支持左手/右手分开，寸/关/尺分开，主脉+修饰符，其它选项
 */
export function PulseSelector({ value, onChange }: PulseSelectorProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* 左手脉象 */}
        <HandPulseSection
          title="左手"
          handData={value.leftHand}
          onChange={(handData) => onChange({ ...value, leftHand: handData })}
        />

        {/* 右手脉象 */}
        <HandPulseSection
          title="右手"
          handData={value.rightHand}
          onChange={(handData) => onChange({ ...value, rightHand: handData })}
        />

        {/* 总体脉象 */}
        <div className="bg-surface-container/30 rounded-lg p-3">
          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
            <span>总体脉象</span>
            <span className="text-muted-foreground">（可选，用于描述整体特征）</span>
          </div>
          <PulsePositionSelector
            value={value.overall || emptyPulsePosition}
            onChange={(posData) => onChange({ ...value, overall: posData })}
            showPositionLabel={false}
          />
        </div>

        {/* 自定义备注 */}
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">
            脉象备注
          </label>
          <textarea
            value={value.customNotes || ''}
            onChange={(e) => onChange({ ...value, customNotes: e.target.value })}
            rows={2}
            placeholder="补充描述脉象特征，如：左寸脉略浮，右关脉弦滑..."
            className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * 单手脉象区块
 */
interface HandPulseSectionProps {
  title: string;
  handData: HandPulseData;
  onChange: (data: HandPulseData) => void;
}

function HandPulseSection({ title, handData, onChange }: HandPulseSectionProps) {
  const positions = [
    { key: 'cun' as const, label: '寸脉', description: '腕后高骨内侧' },
    { key: 'guan' as const, label: '关脉', description: '腕后高骨前方' },
    { key: 'chi' as const, label: '尺脉', description: '腕后高骨外侧' },
  ];

  return (
    <div className="bg-surface-container/20 rounded-lg p-3 border border-outline-variant/20">
      <div className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
          {title === '左手' ? '左' : '右'}
        </span>
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {positions.map((pos) => (
          <PulsePositionSelector
            key={pos.key}
            label={pos.label}
            description={pos.description}
            value={handData[pos.key]}
            onChange={(posData) => onChange({ ...handData, [pos.key]: posData })}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 单个脉位选择器
 */
interface PulsePositionSelectorProps {
  label?: string;
  description?: string;
  value: PulsePositionData;
  onChange: (data: PulsePositionData) => void;
  showPositionLabel?: boolean;
}

function PulsePositionSelector({
  label,
  description,
  value,
  onChange,
  showPositionLabel = true,
}: PulsePositionSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');

  // 添加主脉
  const handleAddPulse = (pulseId: string) => {
    if (!value.pulses.find((p) => p.mainPulse === pulseId)) {
      onChange({ ...value, pulses: [...value.pulses, { mainPulse: pulseId, modifiers: [] }] });
    }
  };

  // 移除主脉
  const handleRemovePulse = (pulseId: string) => {
    onChange({ ...value, pulses: value.pulses.filter((p) => p.mainPulse !== pulseId) });
  };

  // 更新某个主脉的修饰符
  const handleModifierToggle = (pulseId: string, modifierId: string) => {
    onChange({
      ...value,
      pulses: value.pulses.map((p) =>
        p.mainPulse === pulseId
          ? {
              ...p,
              modifiers: p.modifiers.includes(modifierId)
                ? p.modifiers.filter((m) => m !== modifierId)
                : [...p.modifiers, modifierId],
            }
          : p
      ),
    });
  };

  // 添加自定义脉象
  const handleAddCustom = () => {
    if (customText.trim()) {
      onChange({
        ...value,
        pulses: [...value.pulses, { mainPulse: 'other', modifiers: [] }],
        customText: customText.trim(),
      });
      setCustomText('');
      setShowCustomInput(false);
    }
  };

  // 清空该脉位
  const handleClear = () => {
    setShowCustomInput(false);
    onChange({ pulses: [], customText: '' });
  };

  // 生成显示文本
  const getDisplayText = () => {
    if (value.pulses.length === 0) return '';
    
    const pulseTexts = value.pulses.map((item) => {
      if (item.mainPulse === 'other') {
        return value.customText || '其它';
      }
      const pulse = PULSE_TYPES.find((p) => p.id === item.mainPulse);
      const modifierNames = item.modifiers.map((mId) => {
        const mod = PULSE_MODIFIERS.find((m) => m.id === mId);
        return mod?.name || '';
      });
      const modifierStr = modifierNames.join('');
      return modifierStr ? `${modifierStr}${pulse?.name || ''}` : pulse?.name || '';
    });
    
    return pulseTexts.join('、');
  };

  const displayText = getDisplayText();

  return (
    <div className="bg-surface rounded-md p-2 border border-outline-variant/30">
      {/* 脉位标题 */}
      {showPositionLabel && label && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground">{label}</span>
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
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
      )}

      {/* 当前选中显示 */}
      {displayText && (
        <div className="mb-2 flex flex-wrap gap-1">
          {value.pulses.map((item) => {
            const pulseText = item.mainPulse === 'other' 
              ? value.customText || '其它'
              : (() => {
                  const pulse = PULSE_TYPES.find((p) => p.id === item.mainPulse);
                  const modifierNames = item.modifiers.map((mId) => {
                    const mod = PULSE_MODIFIERS.find((m) => m.id === mId);
                    return mod?.name || '';
                  });
                  const modifierStr = modifierNames.join('');
                  return modifierStr ? `${modifierStr}${pulse?.name || ''}` : pulse?.name || '';
                })();
            
            return (
              <div key={item.mainPulse === 'other' ? 'other' : item.mainPulse} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                {pulseText}
                <button
                  type="button"
                  onClick={() => handleRemovePulse(item.mainPulse)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 主脉选择 */}
      <div className="mb-2">
        <div className="text-[10px] text-muted-foreground mb-1">主脉（可多选）</div>
        <div className="flex flex-wrap gap-1">
          {PULSE_TYPES.slice(0, 15).map((pulse) => {
            const isSelected = value.pulses.some((p) => p.mainPulse === pulse.id);
            return (
              <Tooltip key={pulse.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleAddPulse(pulse.id)}
                    disabled={isSelected}
                    className={`h-7 px-2 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
                    }`}
                  >
                    {pulse.name}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <div className="text-xs whitespace-pre-line">
                    {getPulseDescription(pulse.id)}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {/* 更多脉象 */}
          <details className="group">
            <summary className="h-7 px-2 rounded text-xs bg-surface-container border border-outline-variant/30 cursor-pointer hover:bg-surface-container/70 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              更多
            </summary>
            <div className="mt-1 flex flex-wrap gap-1">
              {PULSE_TYPES.slice(15).map((pulse) => {
                const isSelected = value.pulses.some((p) => p.mainPulse === pulse.id);
                return (
                  <Tooltip key={pulse.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleAddPulse(pulse.id)}
                        disabled={isSelected}
                        className={`h-7 px-2 rounded text-xs transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
                        }`}
                      >
                        {pulse.name}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px]">
                      <div className="text-xs whitespace-pre-line">
                        {getPulseDescription(pulse.id)}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </details>
          {/* 其它选项 */}
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`h-7 px-2 rounded text-xs transition-colors ${
              showCustomInput
                ? 'bg-primary text-primary-foreground font-medium'
                : 'bg-surface-container border border-outline-variant/30 hover:bg-surface-container/70'
            }`}
          >
            其它
          </button>
        </div>
      </div>

      {/* 自定义输入（选择"其它"时显示） */}
      {showCustomInput && (
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="输入自定义脉象描述..."
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

      {/* 修饰符选择（为每个已选主脉单独显示） */}
      {value.pulses.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-muted-foreground">修饰符（可选）</div>
          {value.pulses.map((item) => {
            if (item.mainPulse === 'other') return null;
            const pulse = PULSE_TYPES.find((p) => p.id === item.mainPulse);
            return (
              <div key={item.mainPulse} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8">{pulse?.name}：</span>
                <div className="flex flex-wrap gap-1">
                  {PULSE_MODIFIERS.map((mod) => (
                    <Tooltip key={mod.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleModifierToggle(item.mainPulse!, mod.id)}
                          className={`h-5 px-1.5 rounded text-[10px] transition-colors ${
                            item.modifiers.includes(mod.id)
                              ? 'bg-primary/20 text-primary border border-primary/30 font-medium'
                              : 'bg-surface-container/50 border border-outline-variant/20 hover:bg-surface-container/70'
                          }`}
                        >
                          {mod.name}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs">{mod.description}</p>
                      </TooltipContent>
                    </Tooltip>
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
 * 将脉象数据转换为显示文本
 */
export function formatPulseData(data: FullPulseData): string {
  const parts: string[] = [];

  // 左手
  const leftParts: string[] = [];
  ['cun', 'guan', 'chi'].forEach((pos) => {
    const posData = data.leftHand[pos as keyof HandPulseData];
    const text = formatPulsePosition(posData);
    if (text) {
      const posName = pos === 'cun' ? '寸' : pos === 'guan' ? '关' : '尺';
      leftParts.push(`左${posName}${text}`);
    }
  });
  if (leftParts.length > 0) parts.push(leftParts.join('、'));

  // 右手
  const rightParts: string[] = [];
  ['cun', 'guan', 'chi'].forEach((pos) => {
    const posData = data.rightHand[pos as keyof HandPulseData];
    const text = formatPulsePosition(posData);
    if (text) {
      const posName = pos === 'cun' ? '寸' : pos === 'guan' ? '关' : '尺';
      rightParts.push(`右${posName}${text}`);
    }
  });
  if (rightParts.length > 0) parts.push(rightParts.join('、'));

  // 总体
  if (data.overall?.pulses.length > 0) {
    const text = formatPulsePosition(data.overall);
    if (text) parts.push(`总体${text}`);
  }

  // 备注
  if (data.customNotes) parts.push(data.customNotes);

  return parts.join('；') || '未填写';
}

/**
 * 格式化单个脉位（支持多选主脉）
 */
function formatPulsePosition(pos: PulsePositionData): string {
  if (pos.pulses.length === 0) return '';

  const pulseTexts = pos.pulses.map((item) => {
    if (item.mainPulse === 'other') {
      return pos.customText || '其它';
    }
    const pulse = PULSE_TYPES.find((p) => p.id === item.mainPulse);
    const modifierNames = item.modifiers.map((mId) => {
      const mod = PULSE_MODIFIERS.find((m) => m.id === mId);
      return mod?.name || '';
    });
    return modifierNames.join('') + (pulse?.name || '');
  });

  return pulseTexts.join('、');
}