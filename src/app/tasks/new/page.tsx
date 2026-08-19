'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import type { AttackPattern } from '@/lib/task'

const EXECUTION_METHODS = ['手动', '自动脚本', 'fuzz'] as const

const formSchema = z.object({
  target_name: z
    .string()
    .min(1, '请输入目标名称')
    .max(200, '目标名称不能超过 200 个字符'),
  attack_pattern_id: z.string().min(1, '请选择攻击模式'),
  target_url: z
    .string()
    .max(500, 'URL 不能超过 500 个字符')
    .url('请输入合法的 URL')
    .or(z.literal('')),
  payload: z.string().min(1, '请输入 Payload'),
  execution_method: z.enum(EXECUTION_METHODS),
})

type FormValues = z.infer<typeof formSchema>

export default function NewTaskPage() {
  const router = useRouter()
  const [patterns, setPatterns] = useState<AttackPattern[]>([])
  const [patternsLoading, setPatternsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_name: '',
      attack_pattern_id: '',
      target_url: '',
      payload: '',
      execution_method: '手动',
    },
  })

  // 加载攻击模式列表（供下拉选择）
  useEffect(() => {
    async function fetchPatterns() {
      try {
        const res = await fetch('/api/patterns')
        if (!res.ok) {
          throw new Error(`请求失败：${res.status} ${res.statusText}`)
        }
        setPatterns(await res.json())
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : '获取攻击模式列表失败'
        )
      } finally {
        setPatternsLoading(false)
      }
    }
    fetchPatterns()
  }, [])

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attack_pattern_id: values.attack_pattern_id,
          target_name: values.target_name,
          target_url: values.target_url || null,
          payload: values.payload,
          execution_method: values.execution_method,
        }),
      })
      if (!res.ok) {
        throw new Error(`创建失败：${res.status} ${res.statusText}`)
      }
      toast.success('任务创建成功')
      router.push('/tasks')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '任务创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/tasks">
          <ArrowLeftIcon data-icon="inline-start" />
          返回任务列表
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>新建任务</CardTitle>
          <CardDescription>
            创建一个新的安全测试任务，带 * 为必填项
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <FormField
                control={form.control}
                name="target_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>目标名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：测试目标 A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attack_pattern_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>攻击模式 *</FormLabel>
                    {patternsLoading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择攻击模式" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patterns.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                              {p.attack_category
                                ? `（${p.attack_category}）`
                                : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>目标 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormDescription>可选，测试目标的地址</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="execution_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>执行方式</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXECUTION_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payload *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入测试用的 Payload..."
                        rows={5}
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/tasks')}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '提交中...' : '创建任务'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
