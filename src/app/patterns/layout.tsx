import { AppShell } from '@/components/app-shell'

export default function PatternsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
