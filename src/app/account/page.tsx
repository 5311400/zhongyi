import { AppHeader } from '@/components/app-header';
import { User, Building2, Bell, Shield, Save, Camera } from 'lucide-react';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">账号设置</h1>
          <p className="text-sm text-muted-foreground mt-1">个人资料、诊所信息、通知与安全</p>
        </div>

        {/* Profile */}
        <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
          <div className="p-5 border-b border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">个人资料</h2>
              <p className="text-xs text-muted-foreground mt-0.5">医师基本信息与执业信息</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center text-2xl font-bold">
                  王
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-card hover:bg-primary/90"
                  aria-label="更换头像"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">王志远</div>
                <div className="text-xs text-muted-foreground mt-0.5">中医主治医师 · 从业 18 年</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">ID: 10086</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="姓名" value="王志远" />
              <FieldRow label="执业证号" value="1410125*****" type="password" />
              <FieldRow label="手机号" value="139-0000-1234" />
              <FieldRow label="邮箱" value="wangzhiyuan@bencao.clinic" />
              <FieldRow label="擅长领域" value="脾胃病、妇科、情志病" full />
              <FieldRow
                label="个人简介"
                value="三代家传中医，临床擅长运用经方治疗慢性脾胃病、月经不调及失眠焦虑等情志疾病。"
                full
                textarea
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5 shadow-card"
              >
                <Save className="w-3.5 h-3.5" />
                保存修改
              </button>
            </div>
          </div>
        </section>

        {/* Clinic */}
        <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
          <div className="p-5 border-b border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">诊所信息</h2>
              <p className="text-xs text-muted-foreground mt-0.5">用于病历抬头、打印与外发</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow label="诊所名称" value="本草堂中医诊所" />
              <FieldRow label="诊所地址" value="北京市朝阳区建国路 88 号 SOHO 现代城 B 座 1208" full />
              <FieldRow label="联系电话" value="010-1234-5678" />
              <FieldRow label="营业时间" value="周一至周日 09:00 - 21:00" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
          <div className="p-5 border-b border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">通知偏好</h2>
              <p className="text-xs text-muted-foreground mt-0.5">复诊提醒与系统通知</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <ToggleRow label="站内复诊提醒" desc="复诊前 1 天在仪表盘提醒" defaultOn />
            <ToggleRow label="新病历保存通知" desc="每次病历保存后向医生邮箱发送备份" />
            <ToggleRow label="微信小程序推送（即将上线）" desc="复诊提醒同步至微信" disabled />
          </div>
        </section>

        {/* Security */}
        <section className="bg-surface rounded-xl border border-outline-variant/30 shadow-card">
          <div className="p-5 border-b border-outline-variant/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">账号安全</h2>
              <p className="text-xs text-muted-foreground mt-0.5">密码与登录设备</p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 bg-surface-container border border-outline-variant/40 rounded-md text-sm font-medium text-foreground hover:bg-surface-container/70"
            >
              修改密码
            </button>
            <button
              type="button"
              className="ml-0 sm:ml-2 w-full sm:w-auto px-4 py-2 bg-error/10 text-error border border-error/20 rounded-md text-sm font-medium hover:bg-error/15"
            >
              退出登录
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function FieldRow({
  label,
  value,
  type,
  full,
  textarea,
}: {
  label: string;
  value: string;
  type?: string;
  full?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea
          defaultValue={value}
          rows={2}
          className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
        />
      ) : (
        <input
          type={type || 'text'}
          defaultValue={value}
          className="w-full h-9 px-3 bg-surface-container border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultOn,
  disabled,
}: {
  label: string;
  desc?: string;
  defaultOn?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={
        disabled
          ? 'flex items-center justify-between gap-3 p-3 rounded-md bg-surface-container/30 opacity-60'
          : 'flex items-center justify-between gap-3 p-3 rounded-md hover:bg-surface-container/40'
      }
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={defaultOn ? 'true' : 'false'}
        disabled={disabled}
        className={
          defaultOn
            ? 'w-10 h-6 rounded-full bg-primary flex items-center px-0.5 transition-colors'
            : 'w-10 h-6 rounded-full bg-surface-container border border-outline-variant/40 flex items-center px-0.5 transition-colors'
        }
      >
        <span
          className={
            defaultOn
              ? 'w-5 h-5 rounded-full bg-surface shadow translate-x-4 transition-transform'
              : 'w-5 h-5 rounded-full bg-surface shadow transition-transform'
          }
        />
      </button>
    </div>
  );
}
