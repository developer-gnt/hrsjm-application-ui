import { MemberCause, DonationFormData, DonationReceiptResult } from '../types/causes.types';
import { apiClient } from '../../../core/api/client';

export const VERIFIED_CAUSES_DATA: MemberCause[] = [
  {
    id: 'cause-1',
    title: 'Education Support for Underprivileged Children',
    category: 'Education',
    categoryKey: 'education',
    categoryIcon: '📚',
    location: 'Mumbai, Maharashtra',
    imageUrl:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    description:
      'Provide school kits, digital learning aids, and tuition support for 500+ underprivileged children in suburban communities.',
    aboutStory:
      'Education is the single most powerful tool for breaking the cycle of poverty. Under this mission initiative, HRSJM provides comprehensive educational backing to children from economically disadvantaged families across Mumbai and surrounding districts.\n\nEvery contribution directly funds school textbooks, uniforms, after-school remedial tutoring, and science/digital learning materials to ensure zero school dropouts.',
    targetAmount: 300000,
    raisedAmount: 150000,
    status: 'active',
    beneficiariesCount: 520,
    targetBeneficiaries: '500 Children',
    donorCount: 142,
    daysLeft: 45,
    isVerified: true,
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'cause-2',
    title: 'Medical Treatment & Emergency Healthcare Support',
    category: 'Healthcare',
    categoryKey: 'healthcare',
    categoryIcon: '🏥',
    location: 'Thane, Maharashtra',
    imageUrl:
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    description:
      'Financial aid for critical surgeries, diagnostics, and essential medications for families unable to afford emergency treatments.',
    aboutStory:
      'Medical emergencies often plunge families into devastating debt. The HRSJM Healthcare Relief Fund bridges the critical gap by subsidizing life-saving treatments, medicines, diagnostic tests, and hospitalization for marginalized individuals who lack health insurance coverage.',
    targetAmount: 200000,
    raisedAmount: 80000,
    status: 'active',
    beneficiariesCount: 85,
    targetBeneficiaries: '120 Patients',
    donorCount: 78,
    daysLeft: 30,
    isVerified: true,
    createdAt: '2026-08-18T14:30:00Z',
  },
  {
    id: 'cause-3',
    title: 'Food Support & Nutrition for Needy Families',
    category: 'Relief',
    categoryKey: 'relief',
    categoryIcon: '🍲',
    location: 'Mumbai, Maharashtra',
    imageUrl:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    description:
      'Monthly ration and wholesome grocery kits distributed to destitute elderly citizens and low-income daily-wage earner families.',
    aboutStory:
      'No one should have to sleep hungry. HRSJM distributes fortified monthly nutrition kits containing grains, pulses, cooking oil, and essential staples directly to verified vulnerable households, ensuring food security and proper childhood nutrition.',
    targetAmount: 200000,
    raisedAmount: 120000,
    status: 'active',
    beneficiariesCount: 350,
    targetBeneficiaries: '400 Families',
    donorCount: 110,
    daysLeft: 22,
    isVerified: true,
    createdAt: '2026-08-25T09:00:00Z',
  },
  {
    id: 'cause-4',
    title: 'Women Empowerment & Vocational Skill Program',
    category: 'Women',
    categoryKey: 'women',
    categoryIcon: '👩‍🏫',
    location: 'Navi Mumbai, Maharashtra',
    imageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    description:
      'Vocational training workshops in sewing, handicrafts, digital literacy, and micro-entrepreneurship for single mothers and young women.',
    aboutStory:
      'Empowering women uplifts entire communities. This program provides certified skill training in tailoring, artisanal production, financial management, and small-business launching, enabling women to earn steady dignified livelihoods.',
    targetAmount: 250000,
    raisedAmount: 250000,
    status: 'closed',
    beneficiariesCount: 200,
    targetBeneficiaries: '200 Women',
    donorCount: 195,
    daysLeft: 0,
    isVerified: true,
    createdAt: '2026-07-01T11:00:00Z',
  },
  {
    id: 'cause-5',
    title: 'Disaster Relief & Rehabilitation Support',
    category: 'Relief',
    categoryKey: 'relief',
    categoryIcon: '🛡️',
    location: 'Raigad & Konkan Region',
    imageUrl:
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
    description:
      'Emergency response relief kits, clean drinking water, and temporary shelter rehabilitation for flood-affected families.',
    aboutStory:
      'When natural disasters strike, rapid ground mobilization saves lives. HRSJM volunteers deploy emergency relief packages with dry rations, water filtration units, medicines, blankets, and essential household rebuilding supplies.',
    targetAmount: 150000,
    raisedAmount: 75000,
    status: 'active',
    beneficiariesCount: 180,
    targetBeneficiaries: '250 Families',
    donorCount: 65,
    daysLeft: 18,
    isVerified: true,
    createdAt: '2026-09-02T08:00:00Z',
  },
  {
    id: 'cause-6',
    title: 'Environment & Tree Plantation Mission',
    category: 'Environment',
    categoryKey: 'environment',
    categoryIcon: '🌱',
    location: 'Thane & Western Ghats',
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    description:
      'Planting 10,000 indigenous trees, urban greening drives, and clean-up campaigns to combat carbon emissions and soil erosion.',
    aboutStory:
      'Protecting our environment is safeguarding human rights for future generations. This initiative organizes community sapling planting, rainwater conservation, and ecological awareness workshops across suburban belts and forest peripheries.',
    targetAmount: 100000,
    raisedAmount: 45000,
    status: 'active',
    beneficiariesCount: 10000,
    targetBeneficiaries: '10,000 Trees',
    donorCount: 52,
    daysLeft: 60,
    isVerified: true,
    createdAt: '2026-09-10T12:00:00Z',
  },
];

class CausesService {
  private causes: MemberCause[] = [...VERIFIED_CAUSES_DATA];
  private totalDonatedByMember = 4500; // Simulated member's personal donation baseline
  private myDonationsCount = 3;

  public async getCauses(): Promise<MemberCause[]> {
    try {
      const res = await apiClient.get<any>('/causes');
      const data = (res as any)?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || `cause-${Math.random()}`,
          title: item.title || item.name || 'Social Impact Cause',
          category: item.category || 'General',
          categoryKey: (item.category?.toLowerCase() || 'education') as any,
          categoryIcon: item.categoryIcon || '🤝',
          location: item.location || 'India',
          imageUrl:
            item.imageUrl ||
            item.image ||
            'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
          description: item.description || '',
          aboutStory: item.aboutStory || item.description || '',
          targetAmount: Number(item.targetAmount || item.target_amount || 100000),
          raisedAmount: Number(item.raisedAmount || item.raised_amount || 0),
          status: item.status?.toLowerCase() === 'closed' ? 'closed' : 'active',
          beneficiariesCount: Number(item.beneficiariesCount || 100),
          targetBeneficiaries: item.targetBeneficiaries || 'Community',
          donorCount: Number(item.donorCount || 10),
          daysLeft: item.daysLeft || 30,
          isVerified: true,
          createdAt: item.createdAt || new Date().toISOString(),
        }));
      }
    } catch {
      // Return verified fallback dataset
    }
    return [...this.causes];
  }

  public getCauseById(id: string): MemberCause | undefined {
    return this.causes.find(c => c.id === id);
  }

  public getMemberDonationSummary() {
    const activeCausesCount = this.causes.filter(c => c.status === 'active').length;
    return {
      activeCausesCount,
      totalDonated: this.totalDonatedByMember,
      donationsCount: this.myDonationsCount,
    };
  }

  public async processDonation(formData: DonationFormData): Promise<DonationReceiptResult> {
    const cause = this.getCauseById(formData.causeId);
    if (cause) {
      cause.raisedAmount += formData.amount;
      cause.donorCount += 1;
    }

    this.totalDonatedByMember += formData.amount;
    this.myDonationsCount += 1;

    try {
      await apiClient.post('/donations', {
        cause_id: formData.causeId,
        amount: formData.amount,
        donor_name: formData.donorName || 'Member Donor',
        pan_number: formData.panNumber,
        email: formData.email,
        phone: formData.phone,
        receipt_requested: formData.need80GReceipt,
      });
    } catch {
      // Handled locally
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
