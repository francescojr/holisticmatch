/**
 * Image defaults for profile photos
 * Centralized management of default images used throughout the application
 */
import defaultNoImagePng from '../assets/images/defaultNoImage.png'

/**
 * Get the default profile image URL
 * Used when a professional hasn't uploaded a profile photo
 * 
 * @returns {string} URL to the default no-image placeholder
 */
export const getDefaultProfileImageUrl = (): string => {
  return defaultNoImagePng
}

/**
 * Get profile image URL with fallback to default
 * Safely returns either the photo_url or the default image
 * 
 * @param {string | null | undefined} photoUrl - The photo URL from the API
 * @returns {string} Either the photo URL or the default image URL
 */
export const getProfileImageUrl = (photoUrl: string | null | undefined): string => {
  return photoUrl || getDefaultProfileImageUrl()
}
