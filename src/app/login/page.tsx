'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldIcon } from 'lucide-react'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setSubmitting(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.replace('/tasks')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data.session) {
          // 未开启邮箱验证：注册即登录
          router.replace('/tasks')
        } else {
          // 开启了邮箱验证：需要先去邮箱确认
          setNotice('注册成功，请先到邮箱完成验证后再登录')
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '操作失败，请稍后重试'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <ShieldIcon className="size-5 text-primary" />
            <span className="font-semibold">AI 安全测试平台</span>
          </div>
          <CardTitle>
            <Tabs
              value={mode}
              onValueChange={(v) => {
                setMode(v as 'login' | 'register')
                setError(null)
                setNotice(null)
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">
                  登录
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  注册
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? '使用邮箱和密码登录'
              : '注册一个新账号'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {notice}
              </p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting
                ? '提交中...'
                : mode === 'login'
                  ? '登录'
                  : '注册'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
