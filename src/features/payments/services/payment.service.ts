import { apiClient } from '../../../core/api/client';
import {
  PaymentPayload,
  PaymentReceiptDetails,
  PaymentMethodType,
} from '../types/payment.types';
import { mockGatewayService } from './mock-gateway.service';

export class GlobalPaymentService {
  /**
   * Processes the checkout transaction using Mock Gateway API and records to backend
   */
  public async executePayment(
    payload: PaymentPayload,
    paymentMethodType: PaymentMethodType,
    methodDetails: {
      upiId?: string;
      selectedUpiApp?: string;
      cardNumber?: string;
      cardHolderName?: string;
      bankName?: string;
      walletName?: string;
      simulationMode?: 'success' | 'failure';
    },
  ): Promise<PaymentReceiptDetails> {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // 1. Create order on mock gateway
    const order = await mockGatewayService.createOrder(payload);

    // 2. Process gateway charge
    const charge = await mockGatewayService.processCharge({
      order_id: order.order_id,
      amount: payload.amount,
      payment_method: paymentMethodType,
      upi_id: methodDetails.upiId,
      upi_app: methodDetails.selectedUpiApp,
      card_number: methodDetails.cardNumber,
      card_holder: methodDetails.cardHolderName,
      bank_name: methodDetails.bankName,
      wallet_name: methodDetails.walletName,
      simulation_mode: methodDetails.simulationMode,
    });

    if (charge.status === 'failed') {
      throw new Error(
        charge.error_description || 'Payment was declined by the simulated bank server.',
      );
    }

    const paymentId = charge.payment_id;
    const orderId = charge.order_id;
    const receiptNumber = `HRSJM-REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    let methodLabel = 'UPI';
    if (paymentMethodType === 'upi') {
      methodLabel = methodDetails.selectedUpiApp
        ? `UPI (${methodDetails.selectedUpiApp})`
        : `UPI (${methodDetails.upiId || 'Direct UPI'})`;
    } else if (paymentMethodType === 'card') {
      const last4 = (methodDetails.cardNumber || '3456').replace(/\s/g, '').slice(-4);
      methodLabel = `Credit / Debit Card (ending in ${last4})`;
    } else if (paymentMethodType === 'netbanking') {
      methodLabel = `Net Banking (${methodDetails.bankName || 'HDFC Bank'})`;
    } else if (paymentMethodType === 'wallet') {
      methodLabel = `Wallet (${methodDetails.walletName || 'Paytm'})`;
    }

    try {
      if (payload.purpose === 'donation') {
        await apiClient.post('/donations', {
          cause: payload.title,
          cause_id: payload.entityId || undefined,
          amount: payload.amount,
          donor_name: payload.donorName || 'Donor',
          donor_mobile: payload.donorMobile || undefined,
          donor_email: payload.donorEmail || undefined,
          remark: payload.panNumber
            ? `80G PAN: ${payload.panNumber} | Gateway Ref: ${charge.bank_reference_no} | Payment ID: ${paymentId}`
            : `Payment ID: ${paymentId} | Gateway Ref: ${charge.bank_reference_no} | Cause ID: ${payload.entityId || 'N/A'}`,
        });
      }
    } catch {
      // Offline / handled gracefully
    }

    return {
      paymentId,
      orderId,
      donationId: orderId,
      amount: payload.amount,
      platformFee: 0,
      taxCharges: 0,
      totalPayable: payload.amount,
      date: dateFormatted,
      time: timeFormatted,
      paymentMethod: methodLabel,
      paymentMethodType,
      status: 'Completed',
      purpose: payload.purpose,
      title: payload.title,
      category: payload.category || 'Human Rights',
      location: payload.location || 'Mumbai, Maharashtra',
      imageUrl: payload.imageUrl,
      donorName: payload.donorName || 'Donor',
      donorEmail: payload.donorEmail,
      donorMobile: payload.donorMobile,
      panNumber: payload.panNumber,
      is80GEligible: Boolean(payload.panNumber && payload.need80GReceipt),
      receiptNumber,
      bankReferenceNo: charge.bank_reference_no,
      authCode: charge.auth_code,
      gatewaySignature: charge.gateway_signature,
    };
  }
}

export const globalPaymentService = new GlobalPaymentService();
