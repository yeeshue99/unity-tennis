import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './__root.css';

const queryClient = new QueryClient()
const theme = createTheme({
  palette: {
    background: {
      default: '#FFF8E1', // Warm white color
    },
  },
});

const RootLayout = () => (
    <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <Header />
          <Outlet />
          <TanStackRouterDevtools />
          <Footer />
        </QueryClientProvider>
    </ThemeProvider>
)

export const Route = createRootRoute({ component: RootLayout })