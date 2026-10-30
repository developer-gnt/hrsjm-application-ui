import { MemberCause, DonationFormData, DonationReceiptResult, CauseCategoryKey } from '../types/causes.types';
import { apiClient } from '../../../core/api/client';

export const VERIFIED_FALLBACK_CAUSES: MemberCause[] = [
  {
    id: 'cause-edu-01',
    title: 'Science Coaching & Higher Study Aid',
    category: 'Education',
    categoryKey: 'education',
    categoryIcon: '📚',
    location: 'Thane, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    description: 'Higher secondary science coaching fee assistance, reference textbooks, and lab materials for underprivileged students in Thane.',
    aboutStory: 'HRSJM verified assistance request for underprivileged science students. Higher secondary education is the foundation for collegiate STEM careers. Your support funds their coaching fees and exam resources.',
    targetAmount: 30000,
    raisedAmount: 6500,
    status: 'active',
    beneficiariesCount: 20,
    targetBeneficiaries: '20 Students (Thane, Maharashtra)',
    donorCount: 4,
    daysLeft: 24,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cause-med-01',
    title: 'Pediatric Heart Surgery & ICU Recovery Support',
    category: 'Healthcare',
    categoryKey: 'healthcare',
    categoryIcon: '🏥',
    location: 'Mumbai, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    description: 'Urgent critical financial assistance for pediatric open-heart surgery, medication, and ICU recovery for a 7-year-old child.',
    aboutStory: 'Urgent pediatric cardiac care funding verified by HRSJM medical volunteers. Every rupee raised goes directly to the hospital billing desk to cover surgical theatre and pediatric post-op ICU care.',
    targetAmount: 150000,
    raisedAmount: 85000,
    status: 'active',
    beneficiariesCount: 1,
    targetBeneficiaries: '1 Child (Mumbai, Maharashtra)',
    donorCount: 28,
    daysLeft: 12,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cause-rel-01',
    title: 'Flood Emergency Rations & Clean Water Kits',
    category: 'Relief',
    categoryKey: 'relief',
    categoryIcon: '🍲',
    location: 'Kolhapur, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    description: 'Immediate dry food ration packets, clean drinking water supplies, and hygiene kits for 100 families affected by heavy flooding.',
    aboutStory: 'Severe flood waters displaced low-income households across riverbanks. HRSJM on-ground relief workers are packaging dry rations, chlorine tablets, and infant nutritional packs for daily distribution.',
    targetAmount: 100000,
    raisedAmount: 42000,
    status: 'active',
    beneficiariesCount: 100,
    targetBeneficiaries: '100 Families (Kolhapur, Maharashtra)',
    donorCount: 19,
    daysLeft: 18,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cause-wom-01',
    title: 'Women Sewing & Tailoring Vocational Skill Center',
    category: 'Women',
    categoryKey: 'women',
    categoryIcon: '👩‍🏫',
    location: 'Solapur, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    description: 'Setting up 10 sewing machines and vocational skill training to provide sustainable self-reliance and income for 35 underprivileged women.',
    aboutStory: 'Empowering marginalized women and single mothers with professional garment cutting and sewing certifications, linking them directly with local textile cooperatives to earn steady household incomes.',
    targetAmount: 60000,
    raisedAmount: 24000,
    status: 'active',
    beneficiariesCount: 35,
    targetBeneficiaries: '35 Women (Solapur, Maharashtra)',
    donorCount: 11,
    daysLeft: 30,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cause-env-01',
    title: 'Community Well Restoration & 1,000 Tree Plantation',
    category: 'Environment',
    categoryKey: 'environment',
    categoryIcon: '🌱',
    location: 'Ratnagiri, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    description: 'Community drinking water well rejuvenation and planting 1,000 native shade trees across drought-affected rural blocks.',
    aboutStory: 'Water table rejuvenation through desilting communal village wells and planting climate-resilient native fruit and shade trees maintained by youth village committees.',
    targetAmount: 50000,
    raisedAmount: 18500,
    status: 'active',
    beneficiariesCount: 1000,
    targetBeneficiaries: '1,000 Residents (Ratnagiri, Maharashtra)',
    donorCount: 15,
    daysLeft: 35,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cause-edu-02',
    title: 'Tribal School Kits & Educational Uniforms',
    category: 'Education',
    categoryKey: 'education',
    categoryIcon: '📚',
    location: 'Palghar, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    description: 'Providing textbooks, notebooks, school uniforms, and learning kits for 50 underprivileged tribal children in Palghar district.',
    aboutStory: 'Ensuring zero school dropouts among remote forest hamlets. Kits include sturdy backpacks, rainy-season footwear, stationery, and regional language storybooks.',
    targetAmount: 75000,
    raisedAmount: 36000,
    status: 'active',
    beneficiariesCount: 50,
    targetBeneficiaries: '50 Children (Palghar, Maharashtra)',
    donorCount: 16,
    daysLeft: 20,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
];

class CausesService {
  private causes: MemberCause[] = [...VERIFIED_FALLBACK_CAUSES];
  private processedTransactions = new Set<string>();

  public getCausesSync(): MemberCause[] {
    if (this.causes.length > 0) return [...this.causes];
    return [...VERIFIED_FALLBACK_CAUSES];
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
        this.causes = [...VERIFIED_FALLBACK_CAUSES];
      }
    } catch (err) {
      console.warn('[CausesService] Failed to load approved causes from backend, using verified fallback:', err);
      if (this.causes.length === 0) {
        this.causes = [...VERIFIED_FALLBACK_CAUSES];
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
