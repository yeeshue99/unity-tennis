import React, { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material'
import {
  SignedOut,
  SignInButton,
  useAuth,
  useUser,
  useSession,
} from '@clerk/clerk-react'
import { isPlayerInDb, registerPlayer } from '@/db/players'
import Loader from '@/components/Loader'

type REGISTER_SEARCH_PARAMS = {
  redirect: string | null
}

export const Route = createFileRoute('/register/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): REGISTER_SEARCH_PARAMS => {
    return {
      redirect: String(search.redirect) || null,
    }
  },
})

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Nonbinary', label: 'Non-binary' },
]

function RouteComponent() {
  const { redirect } = Route.useSearch()
  const { isSignedIn } = useAuth()
  const { user, isLoaded } = useUser()
  const { session } = useSession()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
  })

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
  })

  useEffect(() => {
    if (isSignedIn && user) {
      const phoneNumber = user.primaryPhoneNumber?.phoneNumber || ''
      setFormData((prevFormData) => ({
        ...prevFormData,
        phoneNumber,
      }))
    }
  }, [isSignedIn, user])

  useEffect(() => {
    const checkPlayerInDb = async () => {
      if (isSignedIn && user) {
        const playerExists = await isPlayerInDb(
          user.id,
          await session?.getToken(),
        )
        if (playerExists) {
          navigate({ to: redirect || '/tournaments' })
        }
      }
    }

    checkPlayerInDb()
  }, [isSignedIn, user, session, navigate])

  const validate = () => {
    const newErrors: {
      firstName: string
      lastName: string
      phoneNumber: string
      gender: string
    } = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      gender: '',
    }

    const nameRegex = /^[a-zA-Z ]+$/

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName =
        'First name cannot contain special characters or numbers'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName =
        'Last name cannot contain special characters or numbers'
    }

    const phoneRegex = /^\(?[0-9]{1,3}\)?[ ]?[0-9]{3}[-]?[0-9]{4}$/
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number not valid.'
    } else if (!formData.phoneNumber.startsWith('(')) {
      const digitsOnly = formData.phoneNumber.replace(/\D/g, '')
      const formattedPhoneNumber = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`
      setFormData((prevFormData) => ({
        ...prevFormData,
        phoneNumber: formattedPhoneNumber,
      }))
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    setErrors(newErrors)

    return Object.values(newErrors).every((error) => error === '')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as string
    setFormData({
      ...formData,
      gender: value === 'custom' ? '' : value,
    })
    setErrors({
      ...errors,
      gender: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const statusCode = await registerPlayer(
        user!.id,
        `${formData.firstName} ${formData.lastName}`,
        formData.gender,
        formData.phoneNumber,
        await session?.getToken(),
      )

      if (statusCode === 201) {
        navigate({ to: '/tournaments' })
      }
    }
  }

  if (!isLoaded) {
    return <Loader />
  }

  if (!isSignedIn) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <h2>Please sign in to register for the tournament</h2>
        <SignedOut>
          <SignInButton>
            <Button variant="contained" color="primary">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
      </Box>
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        margin: '0 auto',
        mt: 4,
      }}
    >
      <TextField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        variant="outlined"
        required
        error={!!errors.firstName}
        helperText={errors.firstName}
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        variant="outlined"
        required
        error={!!errors.lastName}
        helperText={errors.lastName}
      />
      <TextField
        label="Phone Number"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        variant="outlined"
        required
        type="tel"
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber}
      />
      <FormControl variant="outlined" required error={!!errors.gender}>
        <InputLabel id="gender-label">Gender</InputLabel>
        <Select
          labelId="gender-label"
          name="gender"
          value={formData.gender}
          onChange={handleGenderChange}
          label="Gender"
        >
          {GENDER_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors.gender && (
          <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.gender}</p>
        )}
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  )
}
