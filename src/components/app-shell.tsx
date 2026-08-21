'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  MenuIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  SwordsIcon,
} from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navItems = [
  { label: '仪表盘', href: '/', icon: LayoutDashboardIcon, enabled: false },
  { label: '任务列表', href: '/tasks', icon: ListChecksIcon, enabled: true },
  { label: '攻击模式库', href: '/patterns', icon: SwordsIcon, enabled: false },
  { label: '测试报告', href: '/reports', icon: ScrollTextIcon, enabled: false },
  { label: '设置', href: '/settings', icon: SettingsIcon, enabled: false },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive =
          item.enabled &&
          (item.href === '/tasks'
            ? pathname.startsWith('/tasks')
            : pathname === item.href)

        if (!item.enabled) {
          return (
            <span
              key={item.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
              title="即将上线"
            >
              <item.icon className="size-4" />
              {item.label}
            </span>
          )
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3">
      <ShieldIcon className="size-5 text-primary" />
      <span className="font-semibold">AI 安全测试平台</span>
    </div>
  )
}

/** 侧边栏底部：当前用户邮箱 + 退出登录 */
function UserSection() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user.email ?? null)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="flex flex-col gap-2 px-3">
      {email && (
        <p
          className="truncate px-3 text-xs text-muted-foreground"
          title={email}
        >
          {email}
        </p>
      )}
      <Button
        variant="ghost"
        className="justify-start text-muted-foreground"
        onClick={handleLogout}
      >
        <LogOutIcon data-icon="inline-start" />
        退出登录
      </Button>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4">
        {/* 移动端：汉堡菜单 + 抽屉导航 */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="打开菜单"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-60 flex-col p-0">
            <SheetHeader className="h-14 justify-center border-b px-3">
              <SheetTitle>
                <Brand />
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 py-4">
              <NavList />
            </div>
            <Separator />
            <div className="py-3">
              <UserSection />
            </div>
          </SheetContent>
        </Sheet>

        <div className="md:hidden">
          <Brand />
        </div>
      </header>

      <div className="flex flex-1">
        {/* 侧边栏：桌面端常显，移动端隐藏 */}
        <aside className="hidden w-60 shrink-0 border-r md:flex md:flex-col">
          <div className="flex h-14 items-center border-b">
            <Brand />
          </div>
          <div className="flex-1 py-4">
            <NavList />
          </div>
          <Separator />
          <div className="py-3">
            <UserSection />
          </div>
        </aside>

        {/* 内容区 */}
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
