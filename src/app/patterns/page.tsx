'use client'

import { useEffect, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { severityMap, type AttackPattern } from '@/lib/task'
import { apiFetch } from '@/lib/api'

/** 单个模式卡片：点击展开查看判定规则 */
function PatternCard({ pattern }: { pattern: AttackPattern }) {
  const [open, setOpen] = useState(false)
  const severity = pattern.default_severity
    ? severityMap[pattern.default_severity]
    : null

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
      >
        <span className="font-medium">{pattern.name}</span>
        {pattern.attack_category && (
          <Badge variant="secondary">{pattern.attack_category}</Badge>
        )}
        {pattern.attack_sub_type && (
          <Badge variant="outline">{pattern.attack_sub_type}</Badge>
        )}
        {severity && (
          <Badge className={severity.className}>{severity.label}</Badge>
        )}
        <ChevronDownIcon
          className={`ml-auto size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <CardContent className="flex flex-col gap-4 border-t pt-4">
          {pattern.payload_template && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                Payload 模板
              </p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-sm whitespace-pre-wrap">
                {pattern.payload_template}
              </pre>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              命中规则（响应含任一 → 攻击成功）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pattern.success_patterns?.length ? (
                pattern.success_patterns.map((p) => (
                  <Badge
                    key={p}
                    className="bg-green-500/15 text-green-600 dark:text-green-400"
                  >
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">未配置</span>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              拒绝规则（响应含任一 → 防御成功，优先于命中规则）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pattern.refusal_patterns?.length ? (
                pattern.refusal_patterns.map((p) => (
                  <Badge
                    key={p}
                    className="bg-red-500/15 text-red-600 dark:text-red-400"
                  >
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">未配置</span>
              )}
            </div>
          </div>

          {pattern.mitigation && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">修复建议</p>
              <p className="text-sm">{pattern.mitigation}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<AttackPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPatterns() {
      try {
        const res = await apiFetch('/api/patterns')
        if (!res.ok) {
          throw new Error(`请求失败：${res.status} ${res.statusText}`)
        }
        setPatterns(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取攻击模式失败')
      } finally {
        setLoading(false)
      }
    }
    fetchPatterns()
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">攻击模式库</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共享的攻击模式与判定规则，点击卡片展开查看
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {error && (
        <p className="py-8 text-center text-destructive">出错了：{error}</p>
      )}

      {!loading && !error && patterns.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">暂无攻击模式</p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {patterns.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </div>
      )}
    </div>
  )
}
