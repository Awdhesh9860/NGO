import {
  GatewayConfigStatus,
  IEnterprisePaymentGateway,
  PaymentGatewayName,
} from './payment.adapter';
import { razorpayPaymentProvider } from './razorpay.provider';
import { stripePaymentProvider } from './stripe.provider';
import { upiPaymentProvider, bankTransferPaymentProvider } from './manual.provider';

export * from './payment.adapter';
export * from './razorpay.provider';
export * from './stripe.provider';
export * from './manual.provider';

export function getPaymentGateway(provider: PaymentGatewayName): IEnterprisePaymentGateway {
  switch (provider) {
    case 'RAZORPAY':
      return razorpayPaymentProvider;
    case 'STRIPE':
      return stripePaymentProvider;
    case 'UPI':
      return upiPaymentProvider;
    case 'BANK_TRANSFER':
      return bankTransferPaymentProvider;
  }
}

export function getPaymentProviderStatuses(): GatewayConfigStatus[] {
  return [
    razorpayPaymentProvider.getStatus(),
    stripePaymentProvider.getStatus(),
    upiPaymentProvider.getStatus(),
    bankTransferPaymentProvider.getStatus(),
  ];
}
