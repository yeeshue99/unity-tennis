import { createFileRoute } from '@tanstack/react-router'
import { useCurrentUser } from '@/db/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTournament, fetchTournaments } from '@/db/tournaments'
import { createBracket } from '@/db/brackets'
import { fetchAllPlayersAdmin, updatePlayerAdminStatus } from '@/db/players'
import { registerPlayer } from '@/db/players'
import { registerUser } from '@/db/users'
import Loader from '@/components/Loader'
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function TabPanel({
  children,
  value,
  index,
}: {
  children?: React.ReactNode
  value: number
  index: number
}) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null
}

function TournamentsTab() {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['admin', 'tournaments'],
    queryFn: fetchTournaments,
  })

  const statusColor = (
    status: string,
  ): 'warning' | 'success' | 'default' | 'error' => {
    if (status === 'IN_PROGRESS') return 'success'
    if (status === 'COMPLETED') return 'default'
    return 'warning'
  }

  if (isLoading) return <Loader />

  return (
    <>
      <Typography variant="h6" gutterBottom>
        All Tournaments
      </Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Round</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tournaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tournaments yet.
                </TableCell>
              </TableRow>
            ) : (
              tournaments.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.format}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.status}
                      size="small"
                      color={statusColor(t.status)}
                    />
                  </TableCell>
                  <TableCell>{t.current_round ?? '—'}</TableCell>
                  <TableCell>
                    {t.start_date
                      ? new Date(t.start_date).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {t.end_date
                      ? new Date(t.end_date).toLocaleDateString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  )
}

function CreateTournamentTab() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [format, setFormat] = useState('SINGLE_ELIMINATION')
  const [success, setSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: () => createTournament(name.trim(), format),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tournaments'] })
      setName('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Create New Tournament
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {success && <Alert severity="success">Tournament created!</Alert>}
        {mutation.isError && (
          <Alert severity="error">{(mutation.error as any)?.message}</Alert>
        )}
        <TextField
          label="Tournament Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Format</InputLabel>
          <Select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <MenuItem value="SINGLE_ELIMINATION">Single Elimination</MenuItem>
            <MenuItem value="DOUBLE_ELIMINATION">Double Elimination</MenuItem>
            <MenuItem value="ROUND_ROBIN">Round Robin</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          disabled={!name.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Creating...' : 'Create Tournament'}
        </Button>
      </Stack>
    </>
  )
}

function CreateBracketTab() {
  const queryClient = useQueryClient()
  const [bracketName, setBracketName] = useState('')
  const [tournamentId, setTournamentId] = useState<number | ''>('')
  const [success, setSuccess] = useState(false)

  const { data: tournaments = [] } = useQuery({
    queryKey: ['admin', 'tournaments'],
    queryFn: fetchTournaments,
  })

  const mutation = useMutation({
    mutationFn: () => createBracket(bracketName.trim(), tournamentId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['brackets', tournamentId],
      })
      setBracketName('')
      setTournamentId('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    },
  })

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Create New Bracket
      </Typography>
      <Stack spacing={2} sx={{ maxWidth: 420 }}>
        {success && <Alert severity="success">Bracket created!</Alert>}
        {mutation.isError && (
          <Alert severity="error">{(mutation.error as any)?.message}</Alert>
        )}
        <FormControl fullWidth>
          <InputLabel>Tournament</InputLabel>
          <Select
            label="Tournament"
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value as number)}
          >
            {tournaments.map((t: any) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Bracket Name"
          value={bracketName}
          onChange={(e) => setBracketName(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          disabled={!bracketName.trim() || !tournamentId || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Creating...' : 'Create Bracket'}
        </Button>
      </Stack>
    </>
  )
}

function ManageUsersTab() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newGender, setNewGender] = useState('M')
  const [newPhone, setNewPhone] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['admin', 'players'],
    queryFn: fetchAllPlayersAdmin,
  })

  const toggleAdmin = useMutation({
    mutationFn: ({
      playerId,
      isAdmin,
    }: {
      playerId: number
      isAdmin: boolean
    }) => updatePlayerAdminStatus(playerId, isAdmin),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] }),
  })

  const addUser = useMutation({
    mutationFn: async () => {
      const authUser = await registerUser(newEmail.trim(), newPassword)
      if (!authUser?.id) throw new Error('Failed to create auth user')
      await registerPlayer(
        authUser.id,
        newName.trim(),
        newGender,
        newPhone.trim(),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] })
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setNewGender('M')
      setNewPhone('')
      setShowAddForm(false)
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
    },
  })

  if (isLoading) return <Loader />

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6">Manage Users</Typography>
        <Button
          variant={showAddForm ? 'outlined' : 'contained'}
          size="small"
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? 'Cancel' : '+ Add User'}
        </Button>
      </Stack>

      <Collapse in={showAddForm}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            New User
          </Typography>
          {addUser.isError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {(addUser.error as any)?.message}
            </Alert>
          )}
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                fullWidth
                size="small"
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value)}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                size="small"
              />
            </Stack>
            <TextField
              label="Phone Number"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              size="small"
              sx={{ maxWidth: 220 }}
            />
            <Box>
              <Button
                variant="contained"
                disabled={
                  !newName.trim() ||
                  !newEmail.trim() ||
                  !newPassword ||
                  addUser.isPending
                }
                onClick={() => addUser.mutate()}
              >
                {addUser.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Collapse>

      {addSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          User created successfully!
        </Alert>
      )}

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No players found.
                </TableCell>
              </TableRow>
            ) : (
              players.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell>{p.phone_number || '—'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={!!p.isAdmin}
                      size="small"
                      onChange={(e) =>
                        toggleAdmin.mutate({
                          playerId: p.id,
                          isAdmin: e.target.checked,
                        })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </>
  )
}

function RouteComponent() {
  const { isAdmin, isLoaded } = useCurrentUser()
  const [tab, setTab] = useState(0)

  if (!isLoaded) return <Loader />

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          You must be an admin to view this page.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Admin Panel
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'var(--color-border)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Tournaments" />
          <Tab label="Create Tournament" />
          <Tab label="Create Bracket" />
          <Tab label="Manage Users" />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <TournamentsTab />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <CreateTournamentTab />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <CreateBracketTab />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <ManageUsersTab />
      </TabPanel>
    </Box>
  )
}
