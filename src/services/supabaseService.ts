/**
 * Centralized Supabase Service Layer.
 *
 * All future Supabase database queries and mutations must reside in this layer.
 * UI components must consume data through these service functions rather than
 * calling Supabase directly.
 *
 * In this initial foundation phase, placeholder methods return an explicit
 * "not connected" state when configuration is absent or tables are not yet wired.
 * They deliberately DO NOT return fake analytical results.
 */

import { supabase, isSupabaseReady } from '../lib/supabase'

export interface ServiceResponse<T> {
  connected: boolean
  data?: T
  error?: string
}

export interface CaseRecord {
  id: string
  caseNumber: string
  title: string
  status: string
  created_at?: string
}

export interface PersonRecord {
  id: string
  name: string
  aliases?: string[]
  threatLevel?: string
  role?: string
}

export interface RelationshipRecord {
  id: string
  sourceId: string
  targetId: string
  relationshipType: string
  confidence?: number
}

export interface AlertRecord {
  id: string
  title: string
  severity: string
  timestamp: string
  status: string
}

export interface EvidenceRecord {
  id: string
  caseId: string
  fileName: string
  fileType: string
  storagePath?: string
  uploadedAt?: string
}

const NOT_CONNECTED_RESPONSE: ServiceResponse<any> = {
  connected: false,
  error: 'Supabase is not connected. Please provide valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
  data: undefined,
}

/**
 * Fetch active investigation cases from Supabase.
 */
export async function getCases(): Promise<ServiceResponse<CaseRecord[]>> {
  if (!isSupabaseReady() || !supabase) {
    return NOT_CONNECTED_RESPONSE
  }

  try {
    const { data, error } = await supabase.from('cases').select('*')
    if (error) {
      return { connected: true, error: error.message, data: undefined }
    }
    return { connected: true, data: data as CaseRecord[] }
  } catch (err) {
    return {
      connected: true,
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}

/**
 * Fetch persons of interest from Supabase.
 */
export async function getPersons(): Promise<ServiceResponse<PersonRecord[]>> {
  if (!isSupabaseReady() || !supabase) {
    return NOT_CONNECTED_RESPONSE
  }

  try {
    const { data, error } = await supabase.from('persons').select('*')
    if (error) {
      return { connected: true, error: error.message, data: undefined }
    }
    return { connected: true, data: data as PersonRecord[] }
  } catch (err) {
    return {
      connected: true,
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}

/**
 * Fetch entity relationships/links for network graph from Supabase.
 */
export async function getRelationships(): Promise<ServiceResponse<RelationshipRecord[]>> {
  if (!isSupabaseReady() || !supabase) {
    return NOT_CONNECTED_RESPONSE
  }

  try {
    const { data, error } = await supabase.from('relationships').select('*')
    if (error) {
      return { connected: true, error: error.message, data: undefined }
    }
    return { connected: true, data: data as RelationshipRecord[] }
  } catch (err) {
    return {
      connected: true,
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}

/**
 * Fetch intelligence alerts and triggers from Supabase.
 */
export async function getAlerts(): Promise<ServiceResponse<AlertRecord[]>> {
  if (!isSupabaseReady() || !supabase) {
    return NOT_CONNECTED_RESPONSE
  }

  try {
    const { data, error } = await supabase.from('alerts').select('*')
    if (error) {
      return { connected: true, error: error.message, data: undefined }
    }
    return { connected: true, data: data as AlertRecord[] }
  } catch (err) {
    return {
      connected: true,
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}

/**
 * Fetch evidence and ingested document records from Supabase.
 */
export async function getEvidence(): Promise<ServiceResponse<EvidenceRecord[]>> {
  if (!isSupabaseReady() || !supabase) {
    return NOT_CONNECTED_RESPONSE
  }

  try {
    const { data, error } = await supabase.from('evidence').select('*')
    if (error) {
      return { connected: true, error: error.message, data: undefined }
    }
    return { connected: true, data: data as EvidenceRecord[] }
  } catch (err) {
    return {
      connected: true,
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }
}
