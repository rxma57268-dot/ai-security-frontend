'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, SearchIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  formatDateTime,
  getStatusStyle,
  severityMap,
  type Task,
} from '@/lib/task'
import { apiFetch } from '@/lib/api'

const STATUS_OPTIONS = ['全部', '待执行', '执行中', '完成', '失败'] as const
const PAGE_SIZE = 8

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await apiFetch('/api/tasks')
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

  // 筛选 + 搜索（筛选条件变化时回到第 1 页）
  const filteredTasks = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchStatus =
        statusFilter === '全部' || task.status === statusFilter
      const matchKeyword =
        !kw ||
        task.target_name.toLowerCase().includes(kw) ||
        (task.target_url ?? '').toLowerCase().includes(kw)
      return matchStatus && matchKeyword
    })
  }, [tasks, statusFilter, keyword])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, keyword])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageTasks = filteredTasks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="mx-auto max-w-6xl">
      {/* 标题行 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">任务列表</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            查看和管理所有安全测试任务
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <PlusIcon data-icon="inline-start" />
            新建任务
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>全部任务</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 筛选工具栏 */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索目标名称或 URL..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === '全部' ? '全部状态' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="py-8 text-center text-destructive">
              出错了：{error}
            </p>
          )}

          {!error && (
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
                {loading ? (
                  // 加载骨架屏：5 行
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full max-w-28" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : pageTasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {tasks.length === 0 ? '暂无任务' : '没有符合条件的任务'}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <TableCell className="font-medium">
                        {task.target_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusStyle(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.severity && severityMap[task.severity] ? (
                          <Badge
                            className={severityMap[task.severity].className}
                          >
                            {severityMap[task.severity].label}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {task.is_success === null
                          ? '—'
                          : task.is_success
                            ? '是'
                            : '否'}
                      </TableCell>
                      <TableCell>{formatDateTime(task.created_at)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* 分页 */}
          {!loading && !error && filteredTasks.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                共 {filteredTasks.length} 条，第 {currentPage} / {totalPages} 页
              </p>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      text="上一页"
                      href="#"
                      aria-disabled={currentPage <= 1}
                      className={
                        currentPage <= 1
                          ? 'pointer-events-none opacity-50'
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        setPage((p) => Math.max(1, p - 1))
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(i + 1)
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      text="下一页"
                      href="#"
                      aria-disabled={currentPage >= totalPages}
                      className={
                        currentPage >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : undefined
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        setPage((p) => Math.min(totalPages, p + 1))
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
