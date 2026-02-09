import { useAuth, useUser } from '@clerk/clerk-react'

interface RegisterPlayersToBracketProps {
  bracketId: number | null
}

const RegisterPlayersToBracket: React.FC<RegisterPlayersToBracketProps> = ({
  bracketId,
}) => {
  const { isSignedIn } = useUser()
  const { has } = useAuth()
  const canManage = has ? has({ role: 'org:admin' }) : false
  const isAdmin = isSignedIn && canManage

  return <>RegisterPlayersToBracket</>
}

export default RegisterPlayersToBracket
