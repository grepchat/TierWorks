export type Tier = { id: string; label: string; color: string }
export type DatasetItem = {
  id: string
  title: string
  imageUrl?: string
  attributes?: Record<string, number>
  meta?: Record<string, unknown>
}
export type Dataset = {
  id: string
  ownerId: string
  title: string
  description?: string
  items: DatasetItem[]
  tiers: Tier[]
  // itemId -> tierId
  placements?: Record<string, string>
  createdAt: string
  updatedAt: string
  isPublished: boolean
}


