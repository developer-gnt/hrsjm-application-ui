import { MemberCause, DonationFormData, DonationReceiptResult, CauseCategoryKey } from '../types/causes.types';
import { apiClient } from '../../../core/api/client';

export const VERIFIED_FALLBACK_CAUSES: MemberCause[] = [];

class CausesService {
  private causes: MemberCause[] = [];
  private processedTransactions = new Set<string>();

  public getCausesSync(): MemberCause[] {
    return [...this.causes];
  }

  public async getCauses(): Promise<MemberCause[]> {
    try {
      const res: any = await apiClient.get<any>('/assistance-requests/approved');
      
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (Array.isArray(res?.data?.items)) {
        rawList = res.data.items;
      } else if (Array.isArray(res?.data)) {
        rawList = res.data;
      } else if (Array.isArray(res?.items)) {
        rawList = res.items;
      } else if (Array.isArray(res?.data?.data?.items)) {
        rawList = res.data.data.items;
      }

      // Filter out internal non-causes (0 amount verification tickets, complaints)
      const validCausesList = rawList.filter((item: any) => {
        const reasonLower = (item.reason || '').toLowerCase().trim();
        const amount = Number(item.requested_amount || 0);

        if (
          amount < 500 ||
          reasonLower.includes('account verification') ||
          reasonLower.includes('seeker verification') ||
          reasonLower.startsWith('[complaint:')
        ) {
          return false;
        }
        return true;
      });

      if (validCausesList.length > 0) {
        const mappedBackendCauses: MemberCause[] = validCausesList.map((item: any) => {
          const reasonLower = (item.reason || '').toLowerCase();
          const descLower = (item.description || '').toLowerCase();
          const nameLower = (item.full_name || '').toLowerCase();
          const text = `${reasonLower} ${descLower} ${nameLower}`;

          let categoryKey: CauseCategoryKey = 'education';
          let category = 'Education';
          let categoryIcon = '📚';
          let defaultImg = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80';

          if (
            text.includes('med') ||
            text.includes('hosp') ||
            text.includes('surg') ||
            text.includes('health') ||
            text.includes('heart') ||
            text.includes('doctor')
          ) {
            categoryKey = 'healthcare';
            category = 'Healthcare';
            categoryIcon = '🏥';
            defaultImg = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80';
          } else if (
            text.includes('food') ||
            text.includes('ration') ||
            text.includes('relief') ||
            text.includes('flood') ||
            text.includes('disaster') ||
            text.includes('hunger')
          ) {
            categoryKey = 'relief';
            category = 'Relief';
            categoryIcon = '🍲';
            defaultImg = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80';
          } else if (
            text.includes('wom') ||
            text.includes('girl') ||
            text.includes('mother') ||
            text.includes('widow') ||
            text.includes('sew') ||
            text.includes('tailor')
          ) {
            categoryKey = 'women';
            category = 'Women';
            categoryIcon = '👩‍🏫';
            defaultImg = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80';
          } else if (
            text.includes('tree') ||
            text.includes('plant') ||
            text.includes('env') ||
            text.includes('water') ||
            text.includes('well') ||
            text.includes('nature')
          ) {
            categoryKey = 'environment';
            category = 'Environment';
            categoryIcon = '🌱';
            defaultImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
          }

          const target = Number(item.requested_amount || 50000);
          const raised = Math.min(target, Number(item.raised_amount || 0));
          const donorCount = Number(item.donor_count || (raised > 0 ? 1 : 0));

          // Format clean title
          let causeTitle = item.reason || 'Assistance & Social Relief Support';
          if (causeTitle.includes(':')) {
            causeTitle = causeTitle.split(':')[1].trim();
          }

          // Location inference
          let location = 'Maharashtra, India';
          if (descLower.includes('palghar')) location = 'Palghar, Maharashtra';
          else if (descLower.includes('kolhapur')) location = 'Kolhapur, Maharashtra';
          else if (descLower.includes('ratnagiri')) location = 'Ratnagiri, Maharashtra';
          else if (descLower.includes('solapur')) location = 'Solapur, Maharashtra';
          else if (descLower.includes('thane')) location = 'Thane, Maharashtra';
          else if (descLower.includes('mumbai')) location = 'Mumbai, Maharashtra';

          // Beneficiary count inference
          let beneficiariesCount = 1;
          const matchDigits = (item.description || '').match(/(\d+)\s+(children|families|women|students|people|trees)/i);
          if (matchDigits && matchDigits[1]) {
            beneficiariesCount = parseInt(matchDigits[1], 10);
          } else {
            beneficiariesCount = Math.max(1, Math.round(target / 1500));
          }

          return {
            id: item.id || `aid-${Math.random()}`,
            title: causeTitle,
            category,
            categoryKey,
            categoryIcon,
            location,
            imageUrl: defaultImg,
            description:
              item.description ||
              `Financial aid and emergency support request submitted by ${item.full_name || 'verified citizen'}.`,
            aboutStory:
              item.description ||
              `HRSJM verified assistance request for ${item.full_name || 'applicant'}.\n\nPurpose: ${item.reason || 'Emergency Relief'}\n\nYour contribution goes directly to support this verified case.`,
            targetAmount: target,
            raisedAmount: raised,
            status:
              item.status === 'CLOSED' || (raised > 0 && raised >= target) ? 'closed' : 'active',
            beneficiariesCount,
            targetBeneficiaries: `${beneficiariesCount} Beneficiaries (${location})`,
            donorCount,
            daysLeft: 30,
            isVerified: true,
            createdAt: item.created_at || new Date().toISOString(),
          };
        });

        this.causes = mappedBackendCauses;
      } else {
        this.causes = [];
      }
    } catch (err) {
      console.warn('[CausesService] Failed to load approved causes from backend, using verified fallback:', err);
      if (this.causes.length === 0) {
        this.causes = [];
      }
    }
    return [...this.causes];
  }

  public getCauseById(id: string): MemberCause | undefined {
    return this.causes.find(c => c.id === id);
  }

  public getMemberDonationSummary() {
    const activeCausesCount = this.causes.filter(c => c.status === 'active').length;
    const totalRaisedSum = this.causes.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    return {
      activeCausesCount,
      totalDonated: totalRaisedSum,
      donationsCount: this.causes.reduce((sum, c) => sum + (c.donorCount || 0), 0),
    };
  }

  public recordDonation(causeIdOrTitle?: string, amount: number = 0, transactionId?: string): void {
    if (!causeIdOrTitle || amount <= 0) return;
    if (transactionId) {
      if (this.processedTransactions.has(transactionId)) return;
      this.processedTransactions.add(transactionId);
    }

    const cleanInput = causeIdOrTitle.toLowerCase().trim();
    const match = this.causes.find(
      c =>
        c.id === causeIdOrTitle ||
        c.title.toLowerCase().includes(cleanInput) ||
        cleanInput.includes(c.title.toLowerCase())
    );

    if (match) {
      match.raisedAmount = Math.min(match.targetAmount, (match.raisedAmount || 0) + amount);
      match.donorCount = (match.donorCount || 0) + 1;
      if (match.raisedAmount >= match.targetAmount) {
        match.status = 'closed';
      }
    }
  }

  public async submitDonation(
    formData: DonationFormData,
    transactionId?: string,
    razorpayPaymentId?: string
  ): Promise<DonationReceiptResult> {
    const receiptNumber = `HRSJM-DON-${Date.now().toString().slice(-6)}`;
    const txId = transactionId || razorpayPaymentId || `TXN-${Date.now()}`;
    const date = new Date().toISOString();

    this.recordDonation(formData.causeId, formData.amount, txId);

    return {
      receiptNumber,
      donationId: txId,
      causeTitle: formData.causeTitle,
      amount: formData.amount,
      date,
      paymentMode: 'Online Payment',
      donorName: formData.donorName || 'Generous Donor',
      panNumber: formData.panNumber,
      is80GEligible: Boolean(formData.need80GReceipt),
    };
  }
}

export const causesService = new CausesService();
