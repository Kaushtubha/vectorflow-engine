export interface CursorData {
  createdAt: string; // ISO string
  id: number;
}

export function encodeCursor(data: CursorData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeCursor(cursor: string): CursorData | null {
  try {
    const json = Buffer.from(cursor, 'base64').toString('utf8');
    const data = JSON.parse(json);
    if (typeof data.createdAt === 'string' && typeof data.id === 'number') {
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}
