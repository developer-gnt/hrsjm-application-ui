import { MemberCause, DonationFormData, DonationReceiptResult } from '../types/causes.types';
import { apiClient } from '../../../core/api/client';

class CausesService {
  private causes: MemberCause[] = [];
  private processedTransactions = new Set<string>();

  public async getCauses(): Promise<MemberCause[]> {
    try {
      const res = await apiClient.get<any>('/assistance-requests/approved');
      const payload = (res as any)?.data || res;
      const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      // Filter out internal registration/verification tickets, trivial amounts, complaints, and fake/mock test entries
      const validCausesList = rawList.filter((item: any) => {
        const reasonLower = (item.reason || '').toLowerCase().trim();
        const descLower = (item.description || '').toLowerCase().trim();
        const nameLower = (item.full_name || '').toLowerCase().trim();
        const amount = Number(item.requested_amount || 0);

        if (
          amount < 500 ||
          reasonLower.includes('account verification') ||
          reasonLower.includes('seeker verification') ||
          descLower.includes('registration pending') ||
          descLower.includes('account verification') ||
          reasonLower.startsWith('[complaint:') ||
          reasonLower.includes('unlawful detention') ||
          reasonLower.includes('police station') ||
          descLower.includes('citizen complaint') ||
          descLower.includes('police station') ||
          descLower === 'hello' ||
          descLower === 'test' ||
          nameLower.includes('test') ||
          nameLower.includes('mock') ||
          reasonLower.includes('test') ||
          reasonLower.includes('mock')
        ) {
          return false;
        }
        return true;
      });

      const mappedBackendCauses: MemberCause[] = validCausesList.map((item: any) => {
        const reasonLower = (item.reason || '').toLowerCase();
        const descLower = (item.description || '').toLowerCase();
        const text = `${reasonLower} ${descLower}`;

        let categoryKey: any = 'education';
        let category = 'Education';
        let categoryIcon = '';
        let defaultImg = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80';

        if (
          text.includes('med') ||
          text.includes('hosp') ||
          text.includes('surg') ||
          text.includes('health') ||
          text.includes('doctor')
        ) {
          categoryKey = 'healthcare';
          category = 'Healthcare';
          categoryIcon = '';
          defaultImg = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80';
        } else if (
          text.includes('food') ||
          text.includes('ration') ||
          text.includes('relief') ||
          text.includes('flood') ||
          text.includes('disaster')
        ) {
          categoryKey = 'relief';
          category = 'Relief';
          categoryIcon = '';
          defaultImg = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80';
        } else if (
          text.includes('wom') ||
          text.includes('girl') ||
          text.includes('mother') ||
          text.includes('widow')
        ) {
          categoryKey = 'women';
          category = 'Women';
          categoryIcon = '';
          defaultImg = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80';
        } else if (
          text.includes('tree') ||
          text.includes('plant') ||
          text.includes('env') ||
          text.includes('water')
        ) {
          categoryKey = 'environment';
          category = 'Environment';
          categoryIcon = '';
          defaultImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
        }

        const target = Number(item.requested_amount || 50000);
        const raised = Math.min(target, Number(item.raised_amount || 0));
        const donorCount = Number(item.donor_count || (raised > 0 ? 1 : 0));

        const causeTitle =
          item.full_name && item.reason && item.full_name.toLowerCase() !== item.reason.toLowerCase()
            ? `${item.full_name} (${item.reason})`
            : item.full_name || item.reason || 'Assistance & Social Relief Support';

        return {
          id: item.id || `aid-${Math.random()}`,
          title: causeTitle,
          category,
          categoryKey,
          categoryIcon,
          location: 'Mumbai, Maharashtra',
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
            item.status === 'CLOSED' || raised >= target ? 'closed' : 'active',
          beneficiariesCount: 1,
          targetBeneficiaries: `1 Beneficiary (${item.full_name || 'Family'})`,
          donorCount,
          daysLeft: 30,
          isVerified: true,
          createdAt: item.created_at || new Date().toISOString(),
        };
      });

      this.causes = mappedBackendCauses;
    } catch {
      this.causes = [];
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
        c.id.toLowerCase().trim() === cleanInput ||
        c.title.toLowerCase().trim() === cleanInput ||
        c.title.toLowerCase().includes(cleanInput) ||
        cleanInput.includes(c.title.toLowerCase()),
    );

    if (match) {
      const maxAllowed = Math.max(0, match.targetAmount - match.raisedAmount);
      const effectiveAmount = maxAllowed > 0 ? Math.min(amount, maxAllowed) : 0;
      match.raisedAmount = Math.min(match.targetAmount, match.raisedAmount + effectiveAmount);
      match.donorCount += 1;
      if (match.raisedAmount >= match.targetAmount) {
        match.status = 'closed';
      }
    }
  }

  public async processDonation(formData: DonationFormData): Promise<DonationReceiptResult> {
    const cause = this.getCauseById(formData.causeId);
    if (cause) {
      const maxAllowed = Math.max(0, cause.targetAmount - cause.raisedAmount);
      const effectiveAmount = maxAllowed > 0 ? Math.min(formData.amount, maxAllowed) : 0;
      cause.raisedAmount = Math.min(cause.targetAmount, cause.raisedAmount + effectiveAmount);
      cause.donorCount += 1;
      if (cause.raisedAmount >= cause.targetAmount) {
        cause.status = 'closed';
      }
    }

    try {
      await apiClient.post('/donations', {
        cause: formData.causeTitle,
        amount: formData.amount,
        donor_name: formData.donorName || 'Member Donor',
        donor_mobile: formData.phone || '9888880002',
        donor_email: formData.email || 'member@hrsjm.org',
        remark: formData.panNumber ? `80G PAN: ${formData.panNumber}` : null,
      });
    } catch {
      // Backend donation record attempted
    }

    const now = new Date();
    const receiptNum = `HRSJM-REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      receiptNumber: receiptNum,
      donationId: `DON-${Date.now()}`,
      causeTitle: formData.causeTitle,
      amount: formData.amount,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      paymentMode: 'Online (UPI / Card)',
      donorName: formData.donorName || 'Aman Shaikh',
      panNumber: formData.panNumber,
      is80GEligible: Boolean(formData.panNumber && formData.need80GReceipt),
    };
  }
}

export const causesService = new CausesService();
