'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCwIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { formatDateTime, verdictMap, type ReportSummary } from '@/lib/task'

function formatAsr(asr: number | null): string {
  return asr === null ? '—' : `${Math.round(asr * 100)}%`
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/reports/summary')
      if (!res.ok) {
        throw new Error(`请求失败：${res.status} ${res.statusText}`)
      }
      setSummary(await res.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取报表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="mx-auto max-w-5xl">
        <p className="py-8 text-center text-destructive">
          出错了：{error ?? '无数据'}
        </p>
      </div>
    )
  }

  const models = Object.keys(summary.asr_matrix).sort()
  const categories = Array.from(
    new Set(
      models.flatMap((m) => Object.keys(summary.asr_matrix[m] ?? {}))
    )
  ).sort()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">测试报告</h1>
          <p className="text-sm text-muted-foreground">
            基于探测历史账本（probe_runs，共 {summary.runs} 次执行）聚合
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={fetchSummary}
        >
          <RefreshCwIcon data-icon="inline-start" />
          刷新
        </Button>
      </div>

      {/* ASR 矩阵 */}
      <Card>
        <CardHeader>
          <CardTitle>ASR 矩阵（靶模型 × 攻击类别）</CardTitle>
          <CardDescription>
            攻击成功率 = attack_success / 有效执行次数
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              暂无探测历史。先到任务列表执行一次任务或多轮探测。
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>攻击类别</TableHead>
                  {models.map((m) => (
                    <TableHead key={m} className="font-mono">
                      {m}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat}>
                    <TableCell className="font-medium">{cat}</TableCell>
                    {models.map((m) => {
                      const cell = summary.asr_matrix[m]?.[cat]
                      if (!cell || cell.asr === null) {
                        return <TableCell key={m}>—</TableCell>
                      }
                      return (
                        <TableCell key={m}>
                          <span
                            className={
                              cell.asr > 0.5
                                ? 'font-medium text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                            }
                          >
                            {formatAsr(cell.asr)}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({cell.success}/{cell.total})
                          </span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 翻转告警 */}
      <Card>
        <CardHeader>
          <CardTitle>翻转告警</CardTitle>
          <CardDescription>
            同一任务相邻两次执行的判定结论发生变化（模型行为漂移 / 回归信号）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.flips.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">无翻转。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务</TableHead>
                  <TableHead>靶模型</TableHead>
                  <TableHead>上次判定</TableHead>
                  <TableHead>本次判定</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.flips.map((f) => (
                  <TableRow key={f.after_run_id}>
                    <TableCell>
                      <Link
                        href={`/tasks/${f.task_id}`}
                        className="text-primary hover:underline"
                      >
                        {f.target_name ?? f.task_id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">
                      {f.target_model ?? '—'}
                    </TableCell>
                    <TableCell>
                      {verdictMap[f.before] ? (
                        <Badge className={verdictMap[f.before].className}>
                          {verdictMap[f.before].label}
                        </Badge>
                      ) : (
                        f.before
                      )}
                    </TableCell>
                    <TableCell>
                      {verdictMap[f.after] ? (
                        <Badge className={verdictMap[f.after].className}>
                          {verdictMap[f.after].label}
                        </Badge>
                      ) : (
                        f.after
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(f.at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 策略库命中统计（v3） */}
      {summary.strategy_stats && (
        <Card>
          <CardHeader>
            <CardTitle>策略库命中统计</CardTitle>
            <CardDescription>
              动态红队检索策略库的效果度量（越打越聪明的证据）
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-8">
            <div>
              <p className="text-2xl font-bold">
                {summary.strategy_stats.injected_turns}
              </p>
              <p className="text-sm text-muted-foreground">策略注入轮次</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {summary.strategy_stats.runs_with_strategy}
              </p>
              <p className="text-sm text-muted-foreground">覆盖探测次数</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {summary.strategy_stats.asr_when_used !== null
                  ? `${Math.round(summary.strategy_stats.asr_when_used * 100)}%`
                  : '—'}
              </p>
              <p className="text-sm text-muted-foreground">
                使用策略后的 ASR
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 成本统计 */}
      <Card>
        <CardHeader>
          <CardTitle>成本统计</CardTitle>
          <CardDescription>按靶模型汇总的 token 用量</CardDescription>
        </CardHeader>        <CardContent>
          {Object.keys(summary.cost).length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">暂无数据。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>靶模型</TableHead>
                  <TableHead>执行次数</TableHead>
                  <TableHead>prompt tokens</TableHead>
                  <TableHead>completion tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(summary.cost).map(([model, c]) => (
                  <TableRow key={model}>
                    <TableCell className="font-mono">{model}</TableCell>
                    <TableCell>{c.runs}</TableCell>
                    <TableCell>{c.prompt_tokens}</TableCell>
                    <TableCell>{c.completion_tokens}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
