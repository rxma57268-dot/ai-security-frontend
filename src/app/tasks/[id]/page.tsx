'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  formatDateTime,
  getStatusStyle,
  severityMap,
  type Task,
} from '@/lib/task'

/** 状态选项：label 为界面显示文案，value 为后端接口接受的枚举值 */
const STATUS_OPTIONS = [
  { value: '待执行', label: '待执行' },
  { value: '执行中', label: '执行中' },
  { value: '完成', label: '已完成' },
  { value: '失败', label: '失败' },
] as const

function InfoRow({
  label,
  children,
  mono = false,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm break-all ${mono ? 'font-mono' : ''}`}>
        {children}
      </span>
    </div>
  )
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusDirty, setStatusDirty] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchTask = useCallback(async (): Promise<Task | null> => {
    try {
      const res = await fetch(`/api/tasks/${id}`)
      if (!res.ok) {
        throw new Error(`请求失败：${res.status} ${res.statusText}`)
      }
      const data: Task = await res.json()
      setTask(data)
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务详情失败')
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  // 初始加载
  useEffect(() => {
    fetchTask()
  }, [fetchTask])

  // 执行中的任务每 5 秒轮询刷新
  useEffect(() => {
    if (task?.status !== '执行中') return
    const timer = setInterval(fetchTask, 5000)
    return () => clearInterval(timer)
  }, [task?.status, fetchTask])

  // 任务数据变化时同步下拉框（用户已手动选择但未提交时则不覆盖）
  useEffect(() => {
    if (task && !statusDirty) {
      setSelectedStatus(task.status)
    }
  }, [task, statusDirty])

  async function handleUpdateStatus() {
    if (!selectedStatus || selectedStatus === task?.status) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      })
      if (!res.ok) {
        throw new Error(`更新失败：${res.status} ${res.statusText}`)
      }
      toast.success('状态更新成功')
      setStatusDirty(false)
      await fetchTask()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '状态更新失败')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/tasks">
            <ArrowLeftIcon data-icon="inline-start" />
            返回任务列表
          </Link>
        </Button>
        <p className="py-8 text-center text-destructive">
          出错了：{error ?? '任务不存在'}
        </p>
      </div>
    )
  }

  const severity = task.severity ? severityMap[task.severity] : null

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/tasks">
          <ArrowLeftIcon data-icon="inline-start" />
          返回任务列表
        </Link>
      </Button>

      {/* 标题行 + 状态操作区 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{task.target_name}</h1>
        <Badge className={getStatusStyle(task.status)}>{task.status}</Badge>
        {severity && (
          <Badge className={severity.className}>{severity.label}</Badge>
        )}
        <div className="flex items-center gap-2 sm:ml-auto">
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value)
              setStatusDirty(true)
            }}
            disabled={updating}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleUpdateStatus}
            disabled={
              updating || !selectedStatus || selectedStatus === task.status
            }
          >
            {updating ? '更新中...' : '更新状态'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="result">测试结果</TabsTrigger>
          <TabsTrigger value="log">执行日志</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>任务的目标与配置信息</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow label="任务 ID" mono>
                {task.id}
              </InfoRow>
              <InfoRow label="目标名称">{task.target_name}</InfoRow>
              <InfoRow label="目标 URL" mono>
                {task.target_url ?? '—'}
              </InfoRow>
              <InfoRow label="执行方式">
                {task.execution_method ?? '—'}
              </InfoRow>
              <InfoRow label="使用工具">{task.tool_used ?? '—'}</InfoRow>
              <InfoRow label="影响范围">{task.impact_scope ?? '—'}</InfoRow>
              <InfoRow label="创建时间">
                {formatDateTime(task.created_at)}
              </InfoRow>
              <InfoRow label="更新时间">
                {formatDateTime(task.updated_at)}
              </InfoRow>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 测试结果 */}
        <TabsContent value="result">
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
              <CardDescription>测试执行后的行为与结论</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow label="是否成功">
                {task.is_success === null ? (
                  '—'
                ) : task.is_success ? (
                  <Badge className="bg-green-500/15 text-green-600 dark:text-green-400">
                    是
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/15 text-red-600 dark:text-red-400">
                    否
                  </Badge>
                )}
              </InfoRow>
              <InfoRow label="实际行为">
                {task.actual_behavior ?? '—'}
              </InfoRow>
              <InfoRow label="预期行为">
                {task.expected_behavior ?? '—'}
              </InfoRow>
              <InfoRow label="已回归测试">
                {task.regression_tested ? '是' : '否'}
              </InfoRow>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 执行日志 */}
        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>执行日志</CardTitle>
              <CardDescription>Payload 与证据信息</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Payload</p>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-sm whitespace-pre-wrap">
                  {task.payload}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted-foreground">证据</p>
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-sm whitespace-pre-wrap">
                  {task.evidence ?? '暂无证据'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
