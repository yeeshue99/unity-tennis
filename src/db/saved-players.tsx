import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'
import { z } from 'zod'
import { Player } from '@/db/players'

const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  clerk_id: z.string(),
})

export type SavedPlayer = z.infer<typeof PlayerSchema>

export const savedPlayersCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (player) => player.id,
    schema: PlayerSchema,
  }),
)
