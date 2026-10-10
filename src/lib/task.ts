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
  verdict_source: string | null
  needs_review: boolean | null
  /** Sprint 0：裁判判定理由/证据 + 靶模型版本快照 + 最新 run 指针 */
  judge_reason: string | null
  judge_evidence: string | null
  target_model: string | null
  latest_probe_run_id: string | null
  /** v3：防御签名 */
  defense_signature: string | null
  created_at: string
  updated_at: string | null
}

export interface AttackPattern {
  id: string
  name: string
  attack_category: string | null
  attack_sub_type: string | null
  target_component: string | null
  attack_vector: string | null
  payload_template: string | null
  default_severity: string | null
  success_patterns: string[] | null
  refusal_patterns: string[] | null
  mitigation: string | null
  created_at: string | null
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

/** 判定结果：攻击成功=红、防御成功=绿、不确定=黄 */
export const verdictMap: Record<string, { label: string; className: string }> = {
  attack_success: {
    label: '攻击成功',
    className: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  defense_success: {
    label: '防御成功',
    className: 'bg-green-500/15 text-green-600 dark:text-green-400',
  },
  uncertain: {
    label: '不确定',
    className: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  },
}

/** 判定来源：regex=规则裁判、llm=裁判模型、platform_filter=平台内容过滤、
 *  funnel_*=三级漏斗各级（Sprint 3）、prompt_guard=Prompt Guard 分类器 */
export const verdictSourceMap: Record<string, string> = {
  regex: '规则判定',
  llm: 'LLM 判定',
  platform_filter: '平台过滤',
  prompt_guard: 'Prompt Guard',
  funnel_regex: '漏斗·规则层',
  funnel_prompt_guard: '漏斗·Prompt Guard 层',
  funnel_llm: '漏斗·LLM 终裁',
}

/** 防御签名（v3）：模型的防御姿态——verdict 是结果，签名是方式 */
export const defenseSignatureMap: Record<
  string,
  { label: string; className: string }
> = {
  hard_refusal: {
    label: '硬拒绝',
    className: 'bg-green-500/15 text-green-600 dark:text-green-400',
  },
  soft_refusal: {
    label: '软拒绝',
    className: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  },
  platform_block: {
    label: '平台拦截',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  partial_compliance: {
    label: '部分服从',
    className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  compliance: {
    label: '服从',
    className: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  hallucinated_execution: {
    label: '幻觉执行',
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  none: {
    label: '无法判断',
    className: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  },
}

/** 多轮探测的一轮（probe_turns 表） */
export interface ProbeTurn {
  id: string
  task_id: string
  probe_run_id: string | null
  round_no: number
  agent_thought: string | null
  action: string | null
  pattern_id: string | null
  payload: string
  response: string | null
  verdict: string | null
  verdict_source: string | null
  judge_reason: string | null
  judge_evidence: string | null
  defense_signature: string | null
  path_deviation: string | null
  tool_calls: Array<{ tool: string; params: Record<string, unknown> }> | null
  strategies_used: unknown[] | null
  created_at: string | null
}

/** 探测历史（probe_runs 表，Sprint 0 起 append-only） */
export interface ProbeRun {
  id: string
  task_id: string
  entrypoint: string | null
  probe_mode: string | null
  target_model: string | null
  judge_model: string | null
  agent_model: string | null
  rounds: number | null
  final_verdict: string | null
  verdict_source: string | null
  needs_review: boolean | null
  stop_reason: string | null
  judge_reason: string | null
  judge_evidence: string | null
  prompt_tokens: number | null
  completion_tokens: number | null
  started_at: string | null
  finished_at: string | null
  created_at: string | null
}

/** 汇总报表（GET /reports/summary，Sprint 6） */
export interface ReportSummary {
  asr_matrix: Record<
    string,
    Record<
      string,
      {
        success: number
        refusal: number
        partial: number
        total: number
        asr: number | null
      }
    >
  >
  flips: Array<{
    task_id: string
    target_name: string | null
    target_model: string | null
    before: string
    after: string
    before_run_id: string
    after_run_id: string
    at: string | null
  }>
  cost: Record<
    string,
    { runs: number; prompt_tokens: number; completion_tokens: number }
  >
  /** v3 Sprint 6：策略库命中统计 */
  strategy_stats: {
    injected_turns: number
    runs_with_strategy: number
    asr_when_used: number | null
  } | null
  runs: number
}

/** 探测 Agent 动作类型徽章：追问=蓝、切换模式=紫、验证劫持=橙、终止=灰 */
export const actionMap: Record<string, { label: string; className: string }> = {
  follow_up: {
    label: '追问',
    className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  switch_pattern: {
    label: '切换模式',
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  verify_hijack: {
    label: '验证劫持',
    className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  stop: {
    label: '终止',
    className: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  },
}

export function formatDateTime(value: string | null): string {  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN')
}
