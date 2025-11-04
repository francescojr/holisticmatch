/**
 * useCities Hook Tests
 * Tests for city data loading and caching
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCities } from './useCities'

// Mock the API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn()
  }
}))

import api from '../services/api'

describe('useCities Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty cities when state is null', () => {
    const { result } = renderHook(() => useCities(null))

    expect(result.current.cities).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should return empty cities when state is undefined', () => {
    const { result } = renderHook(() => useCities(undefined))

    expect(result.current.cities).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should return empty cities when state is empty string', () => {
    const { result } = renderHook(() => useCities(''))

    expect(result.current.cities).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should fetch cities for valid state', async () => {
    const mockCities = ['São Paulo', 'Campinas', 'Santos']
    ;(api.get as any).mockResolvedValue({
      data: { cities: mockCities, state: 'SP', count: 3 }
    })

    const { result } = renderHook(() => useCities('SP'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cities).toEqual(mockCities)
    expect(result.current.error).toBeNull()
  })

  it('should handle API error gracefully', async () => {
    const errorMessage = 'Erro ao carregar cidades'
    ;(api.get as any).mockRejectedValue({
      response: { data: { error: errorMessage } }
    })

    const { result } = renderHook(() => useCities('XX'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cities).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should cache results for repeated state requests', async () => {
    const mockCities = ['Rio de Janeiro', 'Niterói']
    ;(api.get as any).mockResolvedValue({
      data: { cities: mockCities, state: 'RJ', count: 2 }
    })

    const { result: result1, unmount: unmount1 } = renderHook(() => useCities('RJ'))

    await waitFor(() => {
      expect(result1.current.loading).toBe(false)
    })

    unmount1()

    // Second call should use cache
    const { result: result2 } = renderHook(() => useCities('RJ'))

    // Should immediately return cached data without loading
    expect(result2.current.cities).toEqual(mockCities)
    expect(result2.current.loading).toBe(false)
    expect(result2.current.error).toBeNull()

    // API should only be called once
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('should convert state to uppercase for API call', async () => {
    ;(api.get as any).mockResolvedValue({
      data: { cities: [], state: 'MG', count: 0 }
    })

    const { result } = renderHook(() => useCities('mg'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(api.get).toHaveBeenCalledWith('/professionals/cities/MG/')
  })

  it('should provide refetch function to clear cache and reload', async () => {
    const mockCitiesV1 = ['Belo Horizonte']
    const mockCitiesV2 = ['Belo Horizonte', 'Uberlândia']

    ;(api.get as any).mockResolvedValueOnce({
      data: { cities: mockCitiesV1, state: 'MG', count: 1 }
    })

    const { result } = renderHook(() => useCities('MG'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cities).toEqual(mockCitiesV1)

    // Mock new data and refetch
    ;(api.get as any).mockResolvedValueOnce({
      data: { cities: mockCitiesV2, state: 'MG', count: 2 }
    })

    await result.current.refetch()

    expect(result.current.cities).toEqual(mockCitiesV2)
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('should handle case-insensitive state input', async () => {
    ;(api.get as any).mockResolvedValue({
      data: { cities: ['Salvador'], state: 'BA', count: 1 }
    })

    const { result } = renderHook(() => useCities('ba'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cities).toEqual(['Salvador'])
    expect(api.get).toHaveBeenCalledWith('/professionals/cities/BA/')
  })
})
