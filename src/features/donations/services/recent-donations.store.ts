import type { DonationRecord } from '../types/donation.types';

type Listener = () => void;

class RecentDonationsStore {
  private recentDonations: DonationRecord[] = [];
  private listeners: Set<Listener> = new Set();

  public addDonation(donation: DonationRecord): void {
    // Avoid duplicate insertions
    this.recentDonations = [
      donation,
      ...this.recentDonations.filter(
        d => d.id !== donation.id && d.transactionId !== donation.transactionId,
      ),
    ];
    this.notify();
  }

  public getRecentDonations(): DonationRecord[] {
    return [...this.recentDonations];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch {}
    });
  }
}

export const recentDonationsStore = new RecentDonationsStore();
