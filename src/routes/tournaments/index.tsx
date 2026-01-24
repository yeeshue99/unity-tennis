import {
  ColumnFiltersState,
  createColumnHelper,
  FilterFn,
  FilterFnOption,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import Loader from '@/components/Loader'
import { useUser } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/tournaments/')({
  component: Tournaments,
})

import './index.css'

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
  const { isLoaded } = useUser()

  const data: Tournament[] = [
    {
      id: 1,
      name: '2026 Adult League Jan',
      start_date: null,
      end_date: null,
      format: 'ROUND_ROBIN',
      status: 'PLANNING',
    },
    {
      id: 2,
      name: '2026 Adult League Mar',
      start_date: null,
      end_date: null,
      format: 'COMPASS',
      status: 'PLANNING',
    },
    {
      id: 3,
      name: '2026 Adult League May',
      start_date: null,
      end_date: null,
      format: 'SWISS',
      status: 'PLANNING',
    },
    // Add more tournaments as needed
  ]
  const columnHelper = createColumnHelper<Tournament>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        cell: (info) => (
          <Link
            to="/tournaments/$tournamentId"
            params={{ tournamentId: String(info.row.original.id) }}
            className="tournamentLink"
          >
            {info.getValue()}
          </Link>
        ),
        header: () => <span>Tournament Name</span>,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row.start_date, {
        id: 'start_date',
        cell: (info) => <i>{info.getValue() || 'TBD'}</i>,
        header: () => <span>Start Date</span>,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor((row) => row.end_date, {
        id: 'end_date',
        cell: (info) => <i>{info.getValue() || 'TBD'}</i>,
        header: () => <span>End Date</span>,
        footer: (info) => info.column.id,
      }),
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {} as Record<'fuzzy', FilterFn<any>>,
  })

  if (!isLoaded) {
    return <Loader />
  }

  return (
    <div className="tournaments-page">
      <header className="tournaments-header">
        <h1 className="h1">Tournaments</h1>
      </header>

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  )
}

export default Tournaments
