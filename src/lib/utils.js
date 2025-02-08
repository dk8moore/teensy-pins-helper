import { clsx } from "clsx"
import { twMerge } from "tailwind-merge" 

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export class TeensyDataError extends Error {
  constructor(userMessage, technicalDetails) {
    super(userMessage);
    this.name = 'TeensyDataError';
    this.userMessage = userMessage;
    this.technicalDetails = technicalDetails;
  }
}

export const safeJsonFetch = async (url) => {
  try {
      const response = await fetch(url);
      
      if (!response.ok) {
          throw new TeensyDataError(
              'Failed to load configuration files',
              `HTTP error! status: ${response.status} for ${url}`
          );
      }
      
      try {
          const data = await response.json();
          if (!data) {
              throw new TeensyDataError(
                  'Failed to load configuration files',
                  `Empty response from ${url}`
              );
          }
          return data;
      } catch (parseError) {
          throw new TeensyDataError(
              'Failed to load configuration files',
              `Failed to parse JSON from ${url}: ${parseError.message}`
          );
      }
  } catch (fetchError) {
      if (fetchError instanceof TeensyDataError) {
          throw fetchError;
      }
      throw new TeensyDataError(
          'Failed to load configuration files',
          `Failed to fetch ${url}: ${fetchError.message}`
      );
  }
};