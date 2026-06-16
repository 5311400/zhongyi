'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import {
  PULSE_TYPES,
  PULSE_DETAILS,
  TONGUE_COLORS,
  TONGUE_COLOR_DETAILS,
  TONGUE_SHAPES,
  COAT_COLORS,
  COAT_COLOR_DETAILS,
  COAT_TEXTURES,
  COAT_TEXTURE_DETAILS,
  FACE_COLORS,
  FACE_COLOR_DETAILS,
  getPulseDescription,
  getTongueColorDescription,
  getCoatColorDescription,
  getCoatTextureDescription,
  getFaceColorDescription,
} from '@/lib/tcm-data';

/**
 * 详情弹窗组件属性
 */
interface DetailDialogProps {
  type: 'pulse' | 'tongueColor' | 'tongueShape' | 'coatColor' | 'coatTexture' | 'faceColor';
  itemId: string;
  itemName: string;
  trigger?: React.ReactNode;
}

/**
 * 详情弹窗组件
 * 点击后显示更详细的解释弹窗
 */
export function DetailDialog({ type, itemId, itemName, trigger }: DetailDialogProps) {
  const content = getDetailContent(type, itemId);

  if (!content) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-primary/10"
          >
            <Info className="w-3.5 h-3.5 text-primary" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-primary font-bold">{itemName}</span>
            <span className="text-muted-foreground text-sm">详细解释</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 获取详情内容
 */
function getDetailContent(type: string, itemId: string): React.ReactNode | null {
  switch (type) {
    case 'pulse':
      const pulseDetail = PULSE_DETAILS[itemId];
      const pulseInfo = PULSE_TYPES.find((p) => p.id === itemId);
      if (!pulseDetail) return null;
      return (
        <>
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">脉象特征</div>
            <div className="text-foreground">{pulseDetail.feature}</div>
          </div>
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">临床意义</div>
            <div className="text-foreground">{pulseDetail.meaning}</div>
          </div>
          {pulseDetail.examples && (
            <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
              <div className="text-xs text-violet-600 mb-1">辨析要点</div>
              <div className="text-foreground">{pulseDetail.examples}</div>
            </div>
          )}
          {pulseInfo?.category && (
            <div className="text-xs text-muted-foreground">
              分类：{getCategoryName(pulseInfo.category)}
            </div>
          )}
        </>
      );

    case 'tongueColor':
      const tongueColorDetail = TONGUE_COLOR_DETAILS[itemId];
      const tongueColorInfo = TONGUE_COLORS.find((c) => c.id === itemId);
      if (!tongueColorDetail) return null;
      return (
        <>
          {tongueColorInfo?.description && (
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">舌色特征</div>
              <div className="text-foreground">{tongueColorInfo.description}</div>
            </div>
          )}
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">临床意义</div>
            <div className="text-foreground">{tongueColorDetail.meaning}</div>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
            <div className="text-xs text-violet-600 mb-1">典型表现</div>
            <div className="text-foreground">{tongueColorDetail.symptoms}</div>
          </div>
        </>
      );

    case 'tongueShape':
      const tongueShapeInfo = TONGUE_SHAPES.find((s) => s.id === itemId);
      if (!tongueShapeInfo) return null;
      return (
        <>
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">舌形特征</div>
            <div className="text-foreground">{tongueShapeInfo.description}</div>
          </div>
        </>
      );

    case 'coatColor':
      const coatColorDetail = COAT_COLOR_DETAILS[itemId];
      const coatColorInfo = COAT_COLORS.find((c) => c.id === itemId);
      if (!coatColorDetail) return null;
      return (
        <>
          {coatColorInfo?.description && (
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">苔色特征</div>
              <div className="text-foreground">{coatColorInfo.description}</div>
            </div>
          )}
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">临床意义</div>
            <div className="text-foreground">{coatColorDetail.meaning}</div>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
            <div className="text-xs text-violet-600 mb-1">典型表现</div>
            <div className="text-foreground">{coatColorDetail.symptoms}</div>
          </div>
        </>
      );

    case 'coatTexture':
      const coatTextureDetail = COAT_TEXTURE_DETAILS[itemId];
      const coatTextureInfo = COAT_TEXTURES.find((t) => t.id === itemId);
      if (!coatTextureDetail) return null;
      return (
        <>
          {coatTextureInfo?.description && (
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">苔质特征</div>
              <div className="text-foreground">{coatTextureInfo.description}</div>
            </div>
          )}
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">临床意义</div>
            <div className="text-foreground">{coatTextureDetail.meaning}</div>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
            <div className="text-xs text-violet-600 mb-1">典型表现</div>
            <div className="text-foreground">{coatTextureDetail.symptoms}</div>
          </div>
        </>
      );

    case 'faceColor':
      const faceColorDetail = FACE_COLOR_DETAILS[itemId];
      const faceColorInfo = FACE_COLORS.find((c) => c.id === itemId);
      if (!faceColorDetail) return null;
      return (
        <>
          {faceColorInfo?.description && (
            <div className="bg-primary/5 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">面色特征</div>
              <div className="text-foreground">{faceColorInfo.description}</div>
            </div>
          )}
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">对应脏腑</div>
            <div className="text-foreground font-medium">{faceColorDetail.organ}</div>
          </div>
          <div className="bg-surface-container rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">主病类型</div>
            <div className="text-foreground">{faceColorDetail.diseases}</div>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
            <div className="text-xs text-violet-600 mb-1">病机原理</div>
            <div className="text-foreground">{faceColorDetail.mechanism}</div>
          </div>
        </>
      );

    default:
      return null;
  }
}

/**
 * 获取脉象分类名称
 */
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    basic: '基本脉象',
    shape: '形态类脉象',
    strength: '力度与节律异常脉象',
    special: '特殊节律脉象',
    compound: '复合脉象',
  };
  return categoryNames[category] || category;
}

/**
 * 脉象详情弹窗（简化版，用于快速查看）
 */
export function PulseDetailButton({ pulseId }: { pulseId: string }) {
  const pulse = PULSE_TYPES.find((p) => p.id === pulseId);
  if (!pulse) return null;

  return (
    <DetailDialog
      type="pulse"
      itemId={pulseId}
      itemName={pulse.name}
    />
  );
}

/**
 * 舌色详情弹窗
 */
export function TongueColorDetailButton({ colorId }: { colorId: string }) {
  const color = TONGUE_COLORS.find((c) => c.id === colorId);
  if (!color) return null;

  return (
    <DetailDialog
      type="tongueColor"
      itemId={colorId}
      itemName={color.name}
    />
  );
}

/**
 * 苔色详情弹窗
 */
export function CoatColorDetailButton({ colorId }: { colorId: string }) {
  const color = COAT_COLORS.find((c) => c.id === colorId);
  if (!color) return null;

  return (
    <DetailDialog
      type="coatColor"
      itemId={colorId}
      itemName={color.name}
    />
  );
}

/**
 * 苔质详情弹窗
 */
export function CoatTextureDetailButton({ textureId }: { textureId: string }) {
  const texture = COAT_TEXTURES.find((t) => t.id === textureId);
  if (!texture) return null;

  return (
    <DetailDialog
      type="coatTexture"
      itemId={textureId}
      itemName={texture.name}
    />
  );
}

/**
 * 面色详情弹窗
 */
export function FaceColorDetailButton({ colorId }: { colorId: string }) {
  const color = FACE_COLORS.find((c) => c.id === colorId);
  if (!color) return null;

  return (
    <DetailDialog
      type="faceColor"
      itemId={colorId}
      itemName={color.name}
    />
  );
}