import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
// import * as TanstackQuery from './integrations/tanstack-query/root-provider'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  // const rqContext = TanstackQuery.getContext()
  const queryClient = new QueryClient()

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },

    defaultPreload: 'intent',
  })

  setupRouterSsrQueryIntegration({ router, queryClient: queryClient })

  return router
}
