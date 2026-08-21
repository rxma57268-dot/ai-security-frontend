'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

/**
 * 布局级路由守卫：除 /login 外，未登录一律跳转 /login。
 * 已登录访问 /login 时跳转到 /tasks。
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isLoginPage) {
        router.replace('/login')
        return
      }
      if (session && isLoginPage) {
        router.replace('/tasks')
        return
      }
      setChecked(true)
    })

    // 登出（含其他标签页登出）时跳回登录页
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !isLoginPage) {
        router.replace('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [pathname, isLoginPage, router])

  // 登录页直接渲染
  if (isLoginPage) {
    return <>{children}</>
  }

  // 会话检查完成前不渲染受保护内容，避免闪烁
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return <>{children}</>
}
