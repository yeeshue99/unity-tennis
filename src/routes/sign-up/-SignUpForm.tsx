import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import {
  InputLabel,
  Card,
  CardContent,
  Button,
  CardHeader,
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import { registerPlayer } from '@/db/players'
import { registerUser, signInUser } from '@/db/users'

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Nonbinary', label: 'Non-binary' },
]

export default function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
    phoneNumber: '',
    gender: '',
  })

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
    phoneNumber: '',
    gender: '',
    response: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      repeatPassword: '',
      phoneNumber: '',
      gender: '',
      response: '',
    })

    // Test that all fields are filled out
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [key]: 'This field is required',
        }))
      }
    }

    // Test that email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Please enter a valid email address',
      }))
    }

    if (formData.password !== formData.repeatPassword) {
      setErrors({
        ...errors,
        password: 'Passwords do not match',
        repeatPassword: 'Passwords do not match',
      })
    }

    if (Object.values(errors).some((error) => error)) {
      return
    }

    setIsLoading(true)

    try {
      // Sign up the user with Supabase Auth
      await registerUser(formData.email, formData.password)

      // Automatically sign in the user after successful sign-up
      const signedInUser = await signInUser(formData.email, formData.password)

      // Register the player in the database
      await registerPlayer(
        signedInUser!.id,
        `${formData.firstName} ${formData.lastName}`,
        formData.gender,
        formData.phoneNumber,
      )

      // Redirect to a success page or the main app
      await navigate({ to: '/tournaments' })
    } catch (error: unknown) {
      console.error('Error signing up:', error)
      setErrors({
        ...errors,
        response:
          error instanceof Error ? error.message : 'An unknown error occurred',
      })
    } finally {
      setIsLoading(false)
    }
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

  const handleSavePhoneNumber = (phoneNumber: string) => {
    // Change phone number to (XXX) XXX-XXXX format
    const formattedPhoneNumber = phoneNumber
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    console.log(formattedPhoneNumber)
    setFormData({
      ...formData,
      phoneNumber: formattedPhoneNumber,
    })
  }

  return (
    <div className="flex flex-col gap-6" {...props}>
      <Card>
        <CardHeader title="Sign up" subheader="Create a new account" />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 400,
              margin: '0 auto',
            }}
          >
            <div className="flex gap-2">
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
            </div>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              required
              type="email"
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleSavePhoneNumber(e.target.value)}
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
                onChange={handleChange}
                label="Gender"
              >
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.gender && (
                <p style={{ color: 'red', fontSize: '0.8rem' }}>
                  {errors.gender}
                </p>
              )}
            </FormControl>
            <TextField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              required
              type="password"
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              label="Repeat Password"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleChange}
              variant="outlined"
              required
              type="password"
              error={!!errors.repeatPassword}
              helperText={errors.repeatPassword}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              Submit
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  )
}
