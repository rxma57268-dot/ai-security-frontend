import { supabase } from '@/lib/supabase'

/**
 * 统一的 API 请求包装：自动携带 Supabase session 的 access_token。
 * 所有走 /api/... 代理的后端请求都应使用它，代替裸 fetch。
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

  return fetch(input, { ...init, headers })
}
