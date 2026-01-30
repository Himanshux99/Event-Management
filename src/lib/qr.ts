export interface QRPayload {
  userId: string;
  eventId: string;
  issuedAt: number; // epoch ms
}

export function generateQRPayload(userId: string, eventId: string): string {
  const payload: QRPayload = {
    userId,
    eventId,
    issuedAt: Date.now(),
  };
  return JSON.stringify(payload);
}
