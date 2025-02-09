import { DatabaseConnection } from '../../../types/electronAPI';

/**
 * Generates a consistent hash string from a DatabaseConnection object.
 * Simple but effective for browser environments.
 *
 * @param connection The database connection object to hash
 * @returns A consistent string hash of the connection details
 */
export function generateID(connection: DatabaseConnection): string {
  // Create a normalized object with all fields, including optional ones
  const normalizedConnection = {
    name: connection.name ?? '',
    host: connection.host,
    port: connection.port,
    username: connection.username,
    password: connection.password,
    database: connection.database,
  };

  // Sort the keys to ensure consistent order
  const sortedKeys = Object.keys(normalizedConnection).sort();

  // Create a string representation with sorted keys
  const stringToHash = sortedKeys
    .map((key) => {
      const value =
        normalizedConnection[key as keyof typeof normalizedConnection];
      return `${key}:${value}`;
    })
    .join('|');

  // Simple string hashing function
  let hash = 0;
  for (let i = 0; i < stringToHash.length; i++) {
    const char = stringToHash.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive hex string and ensure it's always the same length
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  return positiveHash;
}

/**
 * Generates a name for a database connection.
 *
 * @param connection The database connection object
 * @returns A name for the database connection
 */
export const makeName = (connection: DatabaseConnection): string => {
  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  if (connection.host === 'localhost') {
    return `Local ${capitalize(connection.database)}`;
  }

  try {
    const url = new URL(connection.host);
    return `${capitalize(url.hostname)} ${capitalize(connection.database)}`;
  } catch (e) {}

  const p = connection.host.split('.');
  if (p.length > 3) {
    return `${capitalize(p[p.length - 2])} ${capitalize(connection.database)}`;
  }

  return `${capitalize(connection.host)} ${capitalize(connection.database)}`;
};
