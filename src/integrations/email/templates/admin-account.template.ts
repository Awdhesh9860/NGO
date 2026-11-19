import { renderEmailLayout } from './base.layout';
import { UserRole } from '@/types';

export interface InvitationAcceptedEmailProps {
  inviterName: string;
  acceptedUserName: string;
  acceptedUserEmail: string;
  role: UserRole;
  organizationName?: string;
}

export function renderInvitationAcceptedEmail({
  inviterName,
  acceptedUserName,
  acceptedUserEmail,
  role,
  organizationName = 'HopeHorizon Foundation',
}: InvitationAcceptedEmailProps): { subject: string; html: string; text: string } {
  const subject = `${acceptedUserName} accepted your invitation to ${organizationName}`;
  const previewText = `${acceptedUserName} (${acceptedUserEmail}) has joined as ${role}.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Invitation Accepted</h2>
    <p>Hello ${inviterName},</p>
    <p><strong>${acceptedUserName}</strong> (${acceptedUserEmail}) has accepted your invitation and joined <strong>${organizationName}</strong> with the role of <strong>${role}</strong>.</p>
    <p style="font-size: 13px; color: #64748b;">You can review their profile and department assignment anytime in the Admin Dashboard.</p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText, bodyHtml }),
    text: `Hello ${inviterName},\n\n${acceptedUserName} (${acceptedUserEmail}) has accepted your invitation and joined ${organizationName} as ${role}.`,
  };
}

export interface AccountStatusEmailProps {
  userName: string;
  status: 'active' | 'inactive' | 'suspended';
  changedBy: string;
  reason?: string;
  organizationName?: string;
}

export function renderAccountStatusEmail({
  userName,
  status,
  changedBy,
  reason,
  organizationName = 'HopeHorizon Foundation',
}: AccountStatusEmailProps): { subject: string; html: string; text: string } {
  const isActivated = status === 'active';
  const actionLabel = isActivated ? 'Activated' : status === 'suspended' ? 'Suspended' : 'Deactivated';
  const subject = `Your ${organizationName} account has been ${actionLabel}`;
  const previewText = `Account status update for ${userName}: ${actionLabel}.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: ${isActivated ? '#087F5B' : '#be123c'}; font-size: 20px;">Account ${actionLabel}</h2>
    <p>Hello ${userName},</p>
    <p>Your account status on <strong>${organizationName}</strong> has been updated to <strong>${status.toUpperCase()}</strong> by ${changedBy}.</p>
    ${reason ? `<p><strong>Note:</strong> ${reason}</p>` : ''}
    <p style="font-size: 13px; color: #64748b;">
      ${isActivated ? 'You now have active access to your authorized workspace.' : 'If you believe this was done in error, please contact your organization administrator.'}
    </p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText, bodyHtml }),
    text: `Hello ${userName},\n\nYour ${organizationName} account status has been updated to ${status.toUpperCase()} by ${changedBy}.${reason ? `\nNote: ${reason}` : ''}`,
  };
}

export interface RoleChangedEmailProps {
  userName: string;
  previousRole: UserRole;
  newRole: UserRole;
  changedBy: string;
  organizationName?: string;
}

export function renderRoleChangedEmail({
  userName,
  previousRole,
  newRole,
  changedBy,
  organizationName = 'HopeHorizon Foundation',
}: RoleChangedEmailProps): { subject: string; html: string; text: string } {
  const subject = `Your role at ${organizationName} has been updated to ${newRole}`;
  const previewText = `Role changed from ${previousRole} to ${newRole}.`;

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Role Assignment Updated</h2>
    <p>Hello ${userName},</p>
    <p>Your administrative access role at <strong>${organizationName}</strong> has been updated by ${changedBy}:</p>
    <p style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 14px;">
      <strong>Previous Role:</strong> ${previousRole}<br />
      <strong>New Role:</strong> <span style="color: #087F5B; font-weight: 700;">${newRole}</span>
    </p>
    <p style="font-size: 13px; color: #64748b;">Your permissions will reflect this role immediately on your next action or login.</p>
  `;

  return {
    subject,
    html: renderEmailLayout({ title: subject, previewText, bodyHtml }),
    text: `Hello ${userName},\n\nYour role at ${organizationName} was changed from ${previousRole} to ${newRole} by ${changedBy}.`,
  };
}
