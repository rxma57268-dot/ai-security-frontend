import { supabase } from '@/lib/supabase'

/**
 * 统一的 API 请求包装：自动携带 Supabase session 的 access_token。
 * 所有走 /api/... 代理的后端请求都应使用它，代替裸 fetch。
 * 收到 401（token 过期/无效）时清除本地 session 并跳转登录页。
 */
export async function apiFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(init?.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  const res = await fetch(input, { ...init, headers })

  if (res.status === 401 && window.location.pathname !== '/login') {
    // 本地 session 已失效：清除后跳登录页，避免守卫循环
    await supabase.auth.signOut({ scope: 'local' })
    window.location.href = '/login'
  }

  return res
}
