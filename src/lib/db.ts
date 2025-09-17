import { supabase } from './supabase'
import type { Dataset } from '../types'

export async function saveDataset(dataset: Dataset) {
  const { data, error } = await supabase
    .from('datasets')
    .upsert({
      id: dataset.id,
      owner_id: dataset.ownerId,
      title: dataset.title,
      description: dataset.description ?? null,
      data: dataset,
      is_published: dataset.isPublished,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listMyDatasets() {
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function listPublished() {
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}


