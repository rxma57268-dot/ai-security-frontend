export interface Task {
  id: string
  attack_pattern_id: string
  target_name: string
  target_url: string | null
  payload: string
  execution_method: string | null
  tool_used: string | null
  status: string
  is_success: boolean | null
  severity: string | null
  impact_scope: string | null
  actual_behavior: string | null
  expected_behavior: string | null
  evidence: string | null
  regression_tested: boolean
  created_at: string
  updated_at: string | null
}

export interface AttackPattern {
  id: string
  name: string
  attack_category: string | null
  attack_sub_type: string | null
  target_component: string | null
  default_severity: string | null
}

/** 任务状态徽章样式：待执行=灰、执行中=蓝、完成=绿、失败=红 */
export const statusStyles: Record<string, string> = {
  待执行: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  执行中: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  完成: 'bg-green-500/15 text-green-600 dark:text-green-400',
  失败: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export function getStatusStyle(status: string): string {
  return statusStyles[status] ?? statusStyles['待执行']
}

/** 严重等级：标签 + 颜色 */
export const severityMap: Record<string, { label: string; className: string }> = {
  critical: { label: '严重', className: 'bg-red-700/15 text-red-700 dark:text-red-400' },
  high: { label: '高危', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  medium: { label: '中危', className: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' },
  low: { label: '低危', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  info: { label: '信息', className: 'bg-gray-500/15 text-gray-600 dark:text-gray-400' },
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN')
}
