import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Not Implemented yet! Here you will be able to create new tournaments and
      brackets.
    </div>
  )
}
