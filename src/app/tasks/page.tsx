'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Task {
  target_name: string
  status: string
  severity: string | null
  is_success: boolean | null
  created_at: string
}

const statusStyles: Record<string, { className: string }> = {
  待执行: { className: 'bg-gray-500/15 text-gray-600 dark:text-gray-400' },
  执行中: { className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  完成: { className: 'bg-green-500/15 text-green-600 dark:text-green-400' },
  失败: { className: 'bg-red-500/15 text-red-600 dark:text-red-400' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks')
        if (!res.ok) {
          throw new Error(`请求失败：${res.status} ${res.statusText}`)
        }
        const data: Task[] = await res.json()
        setTasks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取任务数据失败')
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI 安全测试平台</h1>
        <Button>新建任务</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="py-8 text-center text-muted-foreground">加载中...</p>
          )}

          {error && (
            <p className="py-8 text-center text-destructive">
              出错了：{error}
            </p>
          )}

          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>目标名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>严重等级</TableHead>
                  <TableHead>是否成功</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      暂无任务
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {task.target_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusStyles[task.status]?.className ??
                            statusStyles['待执行'].className
                          }
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.severity ?? '—'}</TableCell>
                      <TableCell>
                        {task.is_success === null
                          ? '—'
                          : task.is_success
                            ? '是'
                            : '否'}
                      </TableCell>
                      <TableCell>
                        {new Date(task.created_at).toLocaleString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
