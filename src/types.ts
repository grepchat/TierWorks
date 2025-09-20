export type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'U'

export interface MediaItem {
  id: string
  title: string
  imageUrl: string
}

export type TierAssignment = Record<TierId, MediaItem[]>

export interface SavedResult {
  id: string
  templateId: string
  templateName: string
  createdAt: number
  tiers: TierAssignment
  title?: string
}

