import mongoose from 'mongoose';
import {
  fundraisingRepository,
  DonorFilterOptions,
} from '@/server/repositories/fundraising.repository';
import { IDonorDocument } from '@/server/database/models/Donor';
import { Donation } from '@/server/database/models/Donation';
import { RecurringDonation } from '@/server/database/models/RecurringDonation';
import { adminService, AdminActor } from '@/server/services/admin.service';
import { checkRolePermission } from '@/server/authorization/permissions';
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
} from '@/lib/error-handler';
import { CreateDonorInput, UpdateDonorInput } from '@/features/donors/schemas/donor.schema';
import connectToDatabase from '@/server/database/connection';

export type DonorSegment =
  | 'FIRST_TIME'
  | 'REPEAT'
  | 'MONTHLY_RECURRING'
  | 'MAJOR'
  | 'RECENTLY_ACTIVE'
  | 'INACTIVE'
  | 'PROSPECT';

/** Major donor threshold: ₹50,000.00 = 5,000,000 minor units (paise). */
export const MAJOR_DONOR_THRESHOLD_MINOR = 5_000_000;
const RECENT_ACTIVITY_DAYS = 90;
const INACTIVE_THRESHOLD_DAYS = 365;

/**
 * Pure, deterministic donor segment calculation strictly based on verified donation history.
 */
export function computeDonorSegments(
  donor: Pick<
    IDonorDocument,
    'donationCount' | 'lifetimeAmountMinor' | 'lastDonationAt' | 'hasActiveRecurring'
  >,
  now: Date = new Date()
): DonorSegment[] {
  const segments: DonorSegment[] = [];
  const count = Math.trunc(donor.donationCount || 0);
  const lifetime = Math.trunc(donor.lifetimeAmountMinor || 0);

  if (count === 0) {
    segments.push('PROSPECT');
  } else if (count === 1) {
    segments.push('FIRST_TIME');
  } else {
    segments.push('REPEAT');
  }

  if (donor.hasActiveRecurring) {
    segments.push('MONTHLY_RECURRING');
  }

  if (lifetime >= MAJOR_DONOR_THRESHOLD_MINOR) {
    segments.push('MAJOR');
  }

  if (donor.lastDonationAt) {
    const diffDays = (now.getTime() - new Date(donor.lastDonationAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= RECENT_ACTIVITY_DAYS) {
      segments.push('RECENTLY_ACTIVE');
    } else if (diffDays >= INACTIVE_THRESHOLD_DAYS) {
      segments.push('INACTIVE');
    }
  }

  return segments;
}

export function maskPanNumber(pan?: string): string | undefined {
  if (!pan || pan.length < 4) return undefined;
  return `${pan.slice(0, 2)}******${pan.slice(-2)}`;
}

/**
 * Enforces `donors.view_sensitive` gating: masks PAN and strips restricted internal notes
 * for users lacking explicit sensitive donor clearance.
 */
export function toSafeDonorDTO(donor: IDonorDocument, canViewSensitive: boolean) {
  return {
    id: donor._id.toString(),
    name: donor.name,
    email: donor.email,
    phone: canViewSensitive ? donor.phone : donor.phone ? 'Restricted' : undefined,
    donorType: donor.donorType,
    organizationName: donor.organizationName,
    address: canViewSensitive ? donor.address : { city: donor.address?.city, state: donor.address?.state },
    communicationPreferences: donor.communicationPreferences,
    anonymousDisplayDefault: donor.anonymousDisplayDefault,
    taxDetails: {
      panNumber: canViewSensitive
        ? donor.taxDetails?.panNumber
        : maskPanNumber(donor.taxDetails?.panNumber),
    },
    firstDonationAt: donor.firstDonationAt,
    lastDonationAt: donor.lastDonationAt,
    lifetimeAmountMinor: Math.trunc(donor.lifetimeAmountMinor || 0),
    donationCount: Math.trunc(donor.donationCount || 0),
    hasActiveRecurring: Boolean(donor.hasActiveRecurring),
    segments: computeDonorSegments(donor),
    status: donor.status,
    internalNotes: canViewSensitive ? donor.internalNotes : undefined,
    tags: donor.tags || [],
    createdAt: donor.createdAt,
    updatedAt: donor.updatedAt,
  };
}

export class DonorService {
  canActorViewSensitive(actor: AdminActor): boolean {
    return actor.role === 'SUPER_ADMIN' || checkRolePermission(actor.role, 'donors.view_sensitive');
  }

  async listDonors(
    organizationId: string,
    filter: DonorFilterOptions = {},
    pagination: { page?: number; limit?: number } = {},
    actor: AdminActor
  ) {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const canViewSensitive = this.canActorViewSensitive(actor);

    const [donors, total] = await Promise.all([
      fundraisingRepository.findDonors(organizationId, filter, { page, limit }),
      fundraisingRepository.countDonors(organizationId, filter),
    ]);

    return {
      donors: donors.map((d) => toSafeDonorDTO(d, canViewSensitive)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getDonorProfile(id: string, organizationId: string, actor: AdminActor) {
    const donor = await fundraisingRepository.findDonorById(id, organizationId);
    if (!donor) throw new NotFoundError('Donor not found in this organization');

    const canViewSensitive = this.canActorViewSensitive(actor);
    const [donations, recurring] = await Promise.all([
      fundraisingRepository.findDonations(organizationId, { donorId: id }, { page: 1, limit: 50 }),
      fundraisingRepository.findRecurringDonations(organizationId, { donorId: id }, { page: 1, limit: 20 }),
    ]);

    return {
      donor: toSafeDonorDTO(donor, canViewSensitive),
      donations,
      recurringDonations: recurring,
    };
  }

  async createDonor(organizationId: string, input: CreateDonorInput, actor: AdminActor) {
    const existing = await fundraisingRepository.findDonorByEmail(input.email, organizationId);
    if (existing) {
      throw new ConflictError(`A donor with email "${input.email}" already exists in this organization`);
    }

    const canViewSensitive = this.canActorViewSensitive(actor);
    const created = await fundraisingRepository.createDonor({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: input.name,
      email: input.email.toLowerCase().trim(),
      phone: input.phone,
      donorType: input.donorType || 'INDIVIDUAL',
      organizationName: input.organizationName,
      address: input.address || {},
      communicationPreferences: {
        emailReceipts: input.communicationPreferences?.emailReceipts ?? true,
        campaignUpdates: input.communicationPreferences?.campaignUpdates ?? true,
        newsletters: input.communicationPreferences?.newsletters ?? false,
        smsAlerts: input.communicationPreferences?.smsAlerts ?? false,
      },
      anonymousDisplayDefault: input.anonymousDisplayDefault ?? false,
      taxDetails: input.panNumber ? { panNumber: input.panNumber.toUpperCase() } : {},
      status: input.status || 'ACTIVE',
      internalNotes: canViewSensitive ? input.internalNotes : undefined,
      tags: input.tags || [],
      createdBy: new mongoose.Types.ObjectId(actor.id),
    });

    await adminService.logAudit(
      actor,
      'DONOR_CREATE',
      'Donor',
      created._id.toString(),
      `Created donor profile for "${created.name}"`
    );

    return toSafeDonorDTO(created, canViewSensitive);
  }

  async updateDonor(id: string, organizationId: string, input: UpdateDonorInput, actor: AdminActor) {
    const existing = await fundraisingRepository.findDonorById(id, organizationId);
    if (!existing) throw new NotFoundError('Donor not found in this organization');

    const canViewSensitive = this.canActorViewSensitive(actor);
    if (input.internalNotes !== undefined && !canViewSensitive) {
      throw new AuthorizationError('Missing donors.view_sensitive permission to edit restricted donor notes');
    }

    const $set: Record<string, unknown> = {
      updatedBy: new mongoose.Types.ObjectId(actor.id),
    };

    if (input.name !== undefined) $set.name = input.name;
    if (input.phone !== undefined) $set.phone = input.phone;
    if (input.donorType !== undefined) $set.donorType = input.donorType;
    if (input.organizationName !== undefined) $set.organizationName = input.organizationName;
    if (input.address !== undefined) $set.address = { ...existing.address, ...input.address };
    if (input.communicationPreferences !== undefined) {
      $set.communicationPreferences = {
        ...existing.communicationPreferences,
        ...input.communicationPreferences,
      };
    }
    if (input.anonymousDisplayDefault !== undefined) {
      $set.anonymousDisplayDefault = input.anonymousDisplayDefault;
    }
    if (input.panNumber !== undefined) {
      $set['taxDetails.panNumber'] = input.panNumber ? input.panNumber.toUpperCase() : undefined;
    }
    if (input.status !== undefined) $set.status = input.status;
    if (input.internalNotes !== undefined) $set.internalNotes = input.internalNotes;
    if (input.tags !== undefined) $set.tags = input.tags;

    const updated = await fundraisingRepository.updateDonor(id, organizationId, { $set });
    if (!updated) throw new NotFoundError('Donor not found');

    await adminService.logAudit(
      actor,
      'DONOR_UPDATE',
      'Donor',
      id,
      `Updated donor profile for "${updated.name}"`
    );

    return toSafeDonorDTO(updated, canViewSensitive);
  }

  async findOrCreateDonorForDonation(
    organizationId: string,
    payload: { name: string; email: string; phone?: string; panNumber?: string; address?: string }
  ): Promise<IDonorDocument> {
    const normalizedEmail = payload.email.toLowerCase().trim();
    const existing = await fundraisingRepository.findDonorByEmail(normalizedEmail, organizationId);
    if (existing) {
      const updates: Record<string, unknown> = {};
      if (!existing.phone && payload.phone) updates.phone = payload.phone;
      if (!existing.taxDetails?.panNumber && payload.panNumber) {
        updates['taxDetails.panNumber'] = payload.panNumber.toUpperCase();
      }
      if (!existing.address?.line1 && payload.address) {
        updates['address.line1'] = payload.address;
      }
      if (Object.keys(updates).length > 0) {
        const updated = await fundraisingRepository.updateDonor(
          existing._id.toString(),
          organizationId,
          { $set: updates }
        );
        return updated || existing;
      }
      return existing;
    }

    return fundraisingRepository.createDonor({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: payload.name.trim(),
      email: normalizedEmail,
      phone: payload.phone,
      donorType: 'INDIVIDUAL',
      address: payload.address ? { line1: payload.address } : {},
      taxDetails: payload.panNumber ? { panNumber: payload.panNumber.toUpperCase() } : {},
      communicationPreferences: {
        emailReceipts: true,
        campaignUpdates: true,
        newsletters: false,
        smsAlerts: false,
      },
      status: 'ACTIVE',
    });
  }

  /**
   * Recalculates donor lifetime metrics strictly from real verified donations (net of refunds)
   * and active recurring mandates.
   */
  async recalculateDonorMetrics(organizationId: string, donorId: string): Promise<void> {
    await connectToDatabase();
    const orgObjId = new mongoose.Types.ObjectId(organizationId);
    const donorObjId = new mongoose.Types.ObjectId(donorId);

    const [agg, activeRecurringCount] = await Promise.all([
      Donation.aggregate([
        {
          $match: {
            organizationId: orgObjId,
            donorId: donorObjId,
            status: { $in: ['SUCCESSFUL', 'PARTIALLY_REFUNDED'] },
          },
        },
        {
          $group: {
            _id: null,
            grossMinor: { $sum: '$amountMinor' },
            refundedMinor: { $sum: '$refundedAmountMinor' },
            donationCount: { $sum: 1 },
            firstDonationAt: { $min: '$createdAt' },
            lastDonationAt: { $max: '$createdAt' },
          },
        },
      ]),
      RecurringDonation.countDocuments({
        organizationId: orgObjId,
        donorId: donorObjId,
        status: 'ACTIVE',
      }),
    ]);

    const row = agg[0];
    const lifetimeAmountMinor = row
      ? Math.max(0, Math.trunc(row.grossMinor || 0) - Math.trunc(row.refundedMinor || 0))
      : 0;

    await fundraisingRepository.updateDonor(donorId, organizationId, {
      $set: {
        lifetimeAmountMinor,
        donationCount: row ? Math.trunc(row.donationCount || 0) : 0,
        firstDonationAt: row?.firstDonationAt || null,
        lastDonationAt: row?.lastDonationAt || null,
        hasActiveRecurring: activeRecurringCount > 0,
      },
    });
  }

  async exportDonors(organizationId: string, actor: AdminActor) {
    if (actor.role !== 'SUPER_ADMIN' && !checkRolePermission(actor.role, 'donors.export')) {
      throw new AuthorizationError('Missing donors.export permission');
    }
    const canViewSensitive = this.canActorViewSensitive(actor);
    const donors = await fundraisingRepository.findDonors(organizationId, {}, { page: 1, limit: 5000 });

    await adminService.logAudit(
      actor,
      'DONOR_EXPORT',
      'Donor',
      organizationId,
      `Exported ${donors.length} donor records`,
      { count: donors.length, sensitiveIncluded: canViewSensitive }
    );

    return donors.map((d) => toSafeDonorDTO(d, canViewSensitive));
  }
}

export const donorService = new DonorService();
