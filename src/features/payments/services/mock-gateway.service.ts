import { apiClient } from '../../../core/api/client';
import { PaymentMethodType, PaymentPayload, PaymentReceiptDetails } from '../types/payment.types';

export interface GatewayOrderResult {
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid';
  key_id: string;
  gateway: string;
  created_at: string;
}

export interface GatewayChargeResult {
  payment_id: string;
  order_id: string;
  status: 'captured' | 'failed' | 'pending';
  amount: number;
  currency: string;
  method: string;
  method_details: Record<string, any>;
  bank_reference_no: string;
  auth_code: string;
  gateway_signature: string;
  captured_at: string;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
}

export const TEST_GATEWAY_CARDS = [
  {
    label: 'Test Visa (Success)',
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '123',
    network: 'Visa',
  },
  {
    label: 'Test Mastercard (Success)',
    number: '5555 4444 3333 2222',
    expiry: '09/27',
    cvv: '888',
    network: 'Mastercard',
  },
  {
    label: 'Test Card (Decline)',
    number: '4000 0000 0000 0000',
    expiry: '01/29',
    cvv: '000',
    network: 'Visa',
  },
];

export const TEST_GATEWAY_UPIS = [
  { handle: 'success@upi', label: 'Instant Success' },
  { handle: 'member@okaxis', label: 'Verified Axis UPI' },
  { handle: 'fail@upi', label: 'Simulate Decline' },
];

class MockGatewayService {
  /**
   * Initiates order on backend Mock Gateway API with local offline fallback
   */
  public async createOrder(payload: PaymentPayload): Promise<GatewayOrderResult> {
    try {
      const response = await apiClient.post<GatewayOrderResult>('/mock-gateway/orders', {
        amount: payload.amount,
        currency: 'INR',
        purpose: payload.purpose,
        title: payload.title,
        entity_id: payload.entityId,
        customer_name: payload.donorName,
        customer_email: payload.donorEmail,
        customer_phone: payload.donorMobile,
      });

      if (response && response.data) {
        return response.data;
      }
    } catch {
      // Offline fallback
    }

    // High-fidelity local order simulation
    const timestamp = Date.now();
    return {
      order_id: `order_mock_${timestamp}_${Math.floor(100 + Math.random() * 900)}`,
      amount: payload.amount,
      currency: 'INR',
      status: 'created',
      key_id: 'rzp_test_hrsjm_live_sandbox',
      gateway: 'HRSJM NPCI & UPI Sandbox Gateway',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Processes charge on backend Mock Gateway API with local offline fallback
   */
  public async processCharge(params: {
    order_id: string;
    amount: number;
    payment_method: PaymentMethodType;
    upi_id?: string;
    upi_app?: string;
    card_number?: string;
    card_holder?: string;
    bank_name?: string;
    wallet_name?: string;
    simulation_mode?: 'success' | 'failure';
  }): Promise<GatewayChargeResult> {
    try {
      const response = await apiClient.post<GatewayChargeResult>('/mock-gateway/charge', params);
      if (response && response.data) {
        return response.data;
      }
    } catch {
      // Offline fallback
    }

    // High-fidelity local charge simulation
    const isExplicitFail =
      params.simulation_mode === 'failure' ||
      params.upi_id?.toLowerCase().includes('fail') ||
      params.card_number?.replace(/\s/g, '').endsWith('0000');

    const timestamp = Date.now();

    if (isExplicitFail) {
      return {
        payment_id: `pay_mock_failed_${timestamp}`,
        order_id: params.order_id,
        status: 'failed',
        amount: params.amount,
        currency: 'INR',
        method: params.payment_method,
        method_details: { upi: params.upi_id, bank: params.bank_name },
        bank_reference_no: '',
        auth_code: '',
        gateway_signature: '',
        captured_at: new Date().toISOString(),
        fee: 0,
        tax: 0,
        error_code: 'BAD_REQUEST_PAYMENT_DECLINED',
        error_description: 'Payment was declined by the simulated bank server / card issuer.',
      };
    }

    const rrn = `UPI${timestamp.toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `pay_mock_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      payment_id: paymentId,
      order_id: params.order_id,
      status: 'captured',
      amount: params.amount,
      currency: 'INR',
      method: params.payment_method,
      method_details: {
        upi: params.upi_id,
        app: params.upi_app,
        card: params.card_number ? params.card_number.slice(-4) : undefined,
      },
      bank_reference_no: rrn,
      auth_code: `AUTH${Math.floor(100000 + Math.random() * 900000)}`,
      gateway_signature: `sig_mock_${timestamp}`,
      captured_at: new Date().toISOString(),
      fee: 0,
      tax: 0,
    };
  }
}

export const mockGatewayService = new MockGatewayService();
