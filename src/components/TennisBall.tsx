import { Icon } from 'lucide-react'
import { tennisBall } from '@lucide/lab'

type TennisBallProps = {
  size?: number
}

const TennisBall = ({ size = 20 }: TennisBallProps) => {
  return <Icon iconNode={tennisBall} size={size} />
}

export default TennisBall
