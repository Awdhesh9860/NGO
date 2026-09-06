export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  return phoneRegex.test(phone.trim());
};

export const validateTaxIdOrPan = (taxId: string): boolean => {
  if (!taxId) return false;
  const clean = taxId.trim().toUpperCase();
  // Matches either Indian PAN (e.g. ABCDE1234F) or generic Tax ID (5-15 alphanumeric)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const genericTaxRegex = /^[A-Z0-9\-]{5,18}$/;
  return panRegex.test(clean) || genericTaxRegex.test(clean);
};

export const validateDonationForm = (data: {
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  panOrTaxId?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Please specify a donation amount greater than 0';
  }

  if (!data.donorName || data.donorName.trim().length < 2) {
    errors.donorName = 'Full name must be at least 2 characters';
  }

  if (!data.donorEmail || !validateEmail(data.donorEmail)) {
    errors.donorEmail = 'Please provide a valid email address';
  }

  if (data.donorPhone && !validatePhone(data.donorPhone)) {
    errors.donorPhone = 'Please provide a valid phone number';
  }

  if (data.panOrTaxId && !validateTaxIdOrPan(data.panOrTaxId)) {
    errors.panOrTaxId = 'Please provide a valid PAN / Tax ID format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateVolunteerForm = (data: {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full legal name';
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.phone = 'Please provide a reachable contact number';
  }

  if (!data.location || data.location.trim().length < 2) {
    errors.location = 'Please specify your primary city or region';
  }

  if (!data.skills || data.skills.length === 0) {
    errors.skills = 'Please select at least one skill or interest area';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
