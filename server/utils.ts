export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function validateSolanaAddress(address: string): boolean {
  // Basic Solana address validation
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
}

export function calculateReferralCommission(level: number): string {
  switch (level) {
    case 1:
      return '10.00';
    case 2:
      return '5.00';
    case 3:
      return '2.00';
    default:
      return '0.00';
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateSecretKey(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
