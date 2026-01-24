import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tournaments/$tournamentId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/tournaments/$tournamentId"!</div>
}
