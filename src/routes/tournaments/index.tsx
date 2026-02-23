import { useMemo } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Loader from '@/components/Loader'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import './index.css'
import { fetchTournaments } from '@/db/tournaments'
import { useQuery } from '@tanstack/react-query'
import { useCurrentUser } from '@/db/users'

export const Route = createFileRoute('/tournaments/')({
  component: Tournaments,
})

type FORMAT = 'ROUND_ROBIN' | 'COMPASS' | 'SWISS'
type STATUS = 'PLANNING' | 'ONGOING' | 'COMPLETED'

type Tournament = {
  id: number
  name: string
  start_date?: string | null
  end_date?: string | null
  format: FORMAT
  status: STATUS
}

function Tournaments() {
  const { isLoaded } = useCurrentUser()

  const { data: allTournaments = [] } = useQuery<Tournament[]>({
    queryKey: ['allTournaments'],
    queryFn: async () => {
      const response = await fetchTournaments()
      if (!response) {
        throw new Error('Failed to fetch all tournaments')
      }

      console.log('Fetched tournaments:', response)

      return response as unknown as Tournament[]
    },
  })

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'name',
        headerName: 'Tournament Name',
        flex: 1,
        renderCell: (params) => (
          <Link
            to="/tournaments/$tournamentId"
            params={{ tournamentId: String(params.row.id) }}
            className="tournamentLink"
            search={(prev) => ({ bracketId: null })}
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: 'start_date',
        headerName: 'Start Date',
        width: 160,
        renderCell: (params) => <i>{params.value || 'TBD'}</i>,
      },
      {
        field: 'end_date',
        headerName: 'End Date',
        width: 160,
        renderCell: (params) => <i>{params.value || 'TBD'}</i>,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        renderCell: (params) => <i>{params.value}</i>,
      },
    ],
    [],
  )

  if (!isLoaded) {
    return <Loader />
  }

  return (
    <div className="tournaments-page">
      <header className="tournaments-header">
        <h1 className="h1">Tournaments</h1>
      </header>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={allTournaments}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'var(--color-header-bg)',
              color: 'var(--color-header-text)',
            },
            '& .MuiDataGrid-columnHeader .MuiSvgIcon-root': {
              color: 'var(--color-header-text)',
              fill: 'var(--color-header-text)',
            },
            '& .MuiDataGrid-columnHeader .MuiIconButton-root': {
              color: 'var(--color-header-text)',
            },
            '& .MuiDataGrid-cell': {
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: 'var(--color-surface-2)',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'var(--color-surface-2) !important',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            },
            '& .MuiDataGrid-footerContainer .MuiIconButton-root': {
              color: 'var(--color-text)',
            },
            '& .MuiTablePagination-root': {
              color: 'var(--color-text)',
            },
            '& .MuiDataGrid-filler': {
              backgroundColor: 'var(--color-surface)',
            },
          }}
        />
      </div>
    </div>
  )
}

export default Tournaments
