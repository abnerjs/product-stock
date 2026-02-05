import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/raw/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/raw/"!</div>
}
