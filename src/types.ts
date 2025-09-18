export type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'U'

export interface MediaItem {
  id: string
  title: string
  imageUrl: string
}

export type TierAssignment = Record<TierId, MediaItem[]>

