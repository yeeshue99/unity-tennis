import { TextField, type TextFieldProps } from '@mui/material'

const themedSx: TextFieldProps['sx'] = {
  '& .MuiOutlinedInput-root': {
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface)',
    '& fieldset': { borderColor: 'var(--color-border)' },
    '&:hover fieldset': { borderColor: 'var(--color-primary)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' },
  },
  '& .MuiInputLabel-root': { color: 'var(--color-text-muted)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-primary)' },
  '& .MuiSvgIcon-root': { color: 'var(--color-text)' },
}

/**
 * A MUI TextField pre-wired with the project's CSS-variable theme.
 * Accepts all standard TextField props — sx is merged on top of the defaults.
 */
export function ThemedTextField({ sx, ...props }: TextFieldProps) {
  return <TextField sx={{ ...themedSx, ...(sx as object) }} {...props} />
}
