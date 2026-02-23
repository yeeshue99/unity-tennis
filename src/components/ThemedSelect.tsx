import {
  FormControl,
  InputLabel,
  Select,
  type SelectProps,
} from '@mui/material'

type ThemedSelectProps = {
  formFullWidth?: boolean
}

const themedSx: SelectProps['sx'] = {
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-surface)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-border)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-primary)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--color-primary)',
  },
  '& .MuiSvgIcon-root': { color: 'var(--color-text)' },
}

const themedMenuProps: SelectProps['MenuProps'] = {
  PaperProps: {
    sx: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
      '& .MuiMenuItem-root:hover': {
        backgroundColor: 'var(--color-surface-2)',
      },
      '& .Mui-selected': {
        backgroundColor:
          'color-mix(in srgb, var(--color-primary) 20%, var(--color-surface))',
      },
      '& .Mui-selected:hover': {
        backgroundColor:
          'color-mix(in srgb, var(--color-primary) 30%, var(--color-surface))',
      },
    },
  },
}

/**
 * A MUI Select pre-wired with the project's CSS-variable theme.
 * Accepts all standard Select props — sx and MenuProps are merged on top of
 * the defaults so callers can still override individual values if needed.
 */
export function ThemedSelect({
  sx,
  MenuProps,
  formFullWidth = true,
  ...props
}: SelectProps & ThemedSelectProps) {
  return (
    <FormControl fullWidth={formFullWidth} disabled={props.disabled}>
      <InputLabel id={props.labelId} sx={{ color: 'var(--color-text)' }}>
        {props.label}
      </InputLabel>
      <Select
        id={props.id}
        labelId={props.labelId}
        sx={{ ...themedSx, ...(sx as object) }}
        MenuProps={{ ...themedMenuProps, ...MenuProps }}
        {...props}
      />
    </FormControl>
  )
}
