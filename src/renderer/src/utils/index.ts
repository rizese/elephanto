import { DatabaseConnection } from 'src/types/electronAPI';

export const generateID = (): string => {
  return 'db-xxxxxxxxx'.replace(/[x]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const makeName = (connection: DatabaseConnection): string => {
  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  if (connection.host === 'localhost') {
    return `Local ${capitalize(connection.database)}`;
  }

  return `${capitalize(connection.host)} ${capitalize(connection.database)}`;
};
