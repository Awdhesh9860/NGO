import mongoose from 'mongoose';
import connectToDatabase from '@/server/database/connection';
import {
  VolunteerApplication,
  IVolunteerApplicationDocument,
  VolunteerApplicationStatus,
  VolunteerProfile,
  IVolunteerProfileDocument,
  VolunteerStatus,
  VolunteerVerificationStatus,
  VolunteerAssignment,
  IVolunteerAssignmentDocument,
  VolunteerAttendance,
  IVolunteerAttendanceDocument,
  VolunteerCertificate,
  IVolunteerCertificateDocument,
  MembershipPlan,
  IMembershipPlanDocument,
  MembershipApplication,
  IMembershipApplicationDocument,
  Membership,
  IMembershipDocument,
  MembershipStatus,
  MembershipRenewal,
  IMembershipRenewalDocument,
  BeneficiaryHousehold,
  IBeneficiaryHouseholdDocument,
  Beneficiary,
  IBeneficiaryDocument,
  BeneficiaryStatus,
  BeneficiaryVerification,
  IBeneficiaryVerificationDocument,
  BeneficiaryEnrollment,
  IBeneficiaryEnrollmentDocument,
  AssistanceRecord,
  IAssistanceRecordDocument,
  BeneficiaryCase,
  IBeneficiaryCaseDocument,
  CaseNote,
  ICaseNoteDocument,
  ConsentRecord,
  IConsentRecordDocument,
} from '@/server/database/models';

export class StakeholderRepository {
  // ======================== VOLUNTEER APPLICATIONS & PROFILES ========================

  async findActiveVolunteerApplicationByEmail(
    organizationId: string,
    email: string
  ): Promise<IVolunteerApplicationDocument | null> {
    await connectToDatabase();
    return VolunteerApplication.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: email.toLowerCase().trim(),
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED'] },
    });
  }

  async findLatestVolunteerApplicationByEmail(
    organizationId: string,
    email: string
  ): Promise<IVolunteerApplicationDocument | null> {
    await connectToDatabase();
    return VolunteerApplication.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 });
  }

  async createVolunteerApplication(
    data: Partial<IVolunteerApplicationDocument>
  ): Promise<IVolunteerApplicationDocument> {
    await connectToDatabase();
    return VolunteerApplication.create(data);
  }

  async findVolunteerApplications(
    organizationId: string,
    filter: { status?: VolunteerApplicationStatus; search?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IVolunteerApplicationDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ fullName: rx }, { email: rx }, { applicationCode: rx }];
    }
    return VolunteerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countVolunteerApplications(
    organizationId: string,
    filter: { status?: VolunteerApplicationStatus } = {}
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    return VolunteerApplication.countDocuments(query);
  }

  async findVolunteerApplicationById(
    id: string,
    organizationId: string
  ): Promise<IVolunteerApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerApplication.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async updateVolunteerApplication(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IVolunteerApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerApplication.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async findVolunteers(
    organizationId: string,
    filter: {
      status?: VolunteerStatus;
      verificationStatus?: VolunteerVerificationStatus;
      skill?: string;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IVolunteerProfileDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      isDeleted: { $ne: true },
    };
    if (filter.status) query.status = filter.status;
    if (filter.verificationStatus) query.verificationStatus = filter.verificationStatus;
    if (filter.skill) query.skills = { $regex: new RegExp(filter.skill, 'i') };
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ fullName: rx }, { email: rx }, { volunteerCode: rx }, { city: rx }];
    }
    return VolunteerProfile.find(query)
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countVolunteers(
    organizationId: string,
    filter: { status?: VolunteerStatus; verificationStatus?: VolunteerVerificationStatus } = {}
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      isDeleted: { $ne: true },
    };
    if (filter.status) query.status = filter.status;
    if (filter.verificationStatus) query.verificationStatus = filter.verificationStatus;
    return VolunteerProfile.countDocuments(query);
  }

  async findVolunteerById(
    id: string,
    organizationId: string
  ): Promise<IVolunteerProfileDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerProfile.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      isDeleted: { $ne: true },
    });
  }

  async findVolunteerByEmail(
    email: string,
    organizationId: string
  ): Promise<IVolunteerProfileDocument | null> {
    await connectToDatabase();
    return VolunteerProfile.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: email.toLowerCase().trim(),
      isDeleted: { $ne: true },
    });
  }

  async createVolunteerProfile(
    data: Partial<IVolunteerProfileDocument>
  ): Promise<IVolunteerProfileDocument> {
    await connectToDatabase();
    return VolunteerProfile.create(data);
  }

  async updateVolunteerProfile(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IVolunteerProfileDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerProfile.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  // ======================== ASSIGNMENTS, ATTENDANCE & CERTIFICATES ========================

  async findVolunteerAssignments(
    organizationId: string,
    volunteerId: string
  ): Promise<IVolunteerAssignmentDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) return [];
    await connectToDatabase();
    return VolunteerAssignment.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: new mongoose.Types.ObjectId(volunteerId),
    })
      .populate('programId', 'title code')
      .populate('projectId', 'name code')
      .populate('supervisorId', 'name email role')
      .sort({ startDate: -1 });
  }

  async findVolunteerAssignmentById(
    id: string,
    organizationId: string
  ): Promise<IVolunteerAssignmentDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerAssignment.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async createVolunteerAssignment(
    data: Partial<IVolunteerAssignmentDocument>
  ): Promise<IVolunteerAssignmentDocument> {
    await connectToDatabase();
    return VolunteerAssignment.create(data);
  }

  async updateVolunteerAssignment(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IVolunteerAssignmentDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerAssignment.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async findDuplicateAttendance(
    organizationId: string,
    volunteerId: string,
    attendanceDate: string,
    assignmentId?: string
  ): Promise<IVolunteerAttendanceDocument | null> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: new mongoose.Types.ObjectId(volunteerId),
      attendanceDate,
    };
    if (assignmentId && mongoose.Types.ObjectId.isValid(assignmentId)) {
      query.assignmentId = new mongoose.Types.ObjectId(assignmentId);
    } else {
      query.assignmentId = { $exists: false };
    }
    return VolunteerAttendance.findOne(query);
  }

  async createVolunteerAttendance(
    data: Partial<IVolunteerAttendanceDocument>
  ): Promise<IVolunteerAttendanceDocument> {
    await connectToDatabase();
    return VolunteerAttendance.create(data);
  }

  async findVolunteerAttendance(
    organizationId: string,
    volunteerId: string,
    filter: { projectId?: string; approvalStatus?: string } = {}
  ): Promise<IVolunteerAttendanceDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) return [];
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: new mongoose.Types.ObjectId(volunteerId),
    };
    if (filter.projectId && mongoose.Types.ObjectId.isValid(filter.projectId)) {
      query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    }
    if (filter.approvalStatus) query.approvalStatus = filter.approvalStatus;
    return VolunteerAttendance.find(query)
      .populate('projectId', 'name code')
      .sort({ attendanceDate: -1, createdAt: -1 })
      .limit(200);
  }

  async findAttendanceById(
    id: string,
    organizationId: string
  ): Promise<IVolunteerAttendanceDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerAttendance.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async updateVolunteerAttendance(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IVolunteerAttendanceDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return VolunteerAttendance.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async createVolunteerCertificate(
    data: Partial<IVolunteerCertificateDocument>
  ): Promise<IVolunteerCertificateDocument> {
    await connectToDatabase();
    return VolunteerCertificate.create(data);
  }

  async findVolunteerCertificates(
    organizationId: string,
    volunteerId: string
  ): Promise<IVolunteerCertificateDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) return [];
    await connectToDatabase();
    return VolunteerCertificate.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      volunteerId: new mongoose.Types.ObjectId(volunteerId),
    }).sort({ issueDate: -1 });
  }

  async findCertificateByCodePublic(code: string): Promise<IVolunteerCertificateDocument | null> {
    await connectToDatabase();
    const normalized = code.trim().toUpperCase();
    return VolunteerCertificate.findOne({
      $or: [{ certificateNumber: normalized }, { verificationCode: normalized }],
    });
  }

  // ======================== MEMBERSHIP ========================

  async findMembershipPlans(
    organizationId: string,
    onlyPublicActive = false
  ): Promise<IMembershipPlanDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (onlyPublicActive) {
      query.isActive = true;
      query.isPublicVisible = true;
    }
    return MembershipPlan.find(query).sort({ feeAmountMinor: 1, createdAt: 1 });
  }

  async findMembershipPlanById(
    id: string,
    organizationId: string
  ): Promise<IMembershipPlanDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return MembershipPlan.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async findMembershipPlanByCode(
    organizationId: string,
    code: string
  ): Promise<IMembershipPlanDocument | null> {
    await connectToDatabase();
    return MembershipPlan.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      code: code.toUpperCase().trim(),
    });
  }

  async createMembershipPlan(
    data: Partial<IMembershipPlanDocument>
  ): Promise<IMembershipPlanDocument> {
    await connectToDatabase();
    return MembershipPlan.create(data);
  }

  async findActiveMembershipApplicationByEmail(
    organizationId: string,
    email: string
  ): Promise<IMembershipApplicationDocument | null> {
    await connectToDatabase();
    return MembershipApplication.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: email.toLowerCase().trim(),
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
    });
  }

  async createMembershipApplication(
    data: Partial<IMembershipApplicationDocument>
  ): Promise<IMembershipApplicationDocument> {
    await connectToDatabase();
    return MembershipApplication.create(data);
  }

  async findMembershipApplications(
    organizationId: string,
    filter: { status?: string } = {}
  ): Promise<IMembershipApplicationDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    return MembershipApplication.find(query)
      .populate('planId', 'name code category feeAmountMinor currency validityDays isLifetime')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async findMembershipApplicationById(
    id: string,
    organizationId: string
  ): Promise<IMembershipApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return MembershipApplication.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async updateMembershipApplication(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IMembershipApplicationDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return MembershipApplication.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async createMembership(data: Partial<IMembershipDocument>): Promise<IMembershipDocument> {
    await connectToDatabase();
    return Membership.create(data);
  }

  async findMemberships(
    organizationId: string,
    filter: { status?: MembershipStatus; category?: string; search?: string } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IMembershipDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.category) query.category = filter.category;
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ fullName: rx }, { email: rx }, { membershipNumber: rx }];
    }
    return Membership.find(query)
      .populate('planId', 'name code category validityDays isLifetime feeAmountMinor currency')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countMemberships(
    organizationId: string,
    filter: { status?: MembershipStatus; category?: string } = {}
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.category) query.category = filter.category;
    return Membership.countDocuments(query);
  }

  async findMembershipById(
    id: string,
    organizationId: string
  ): Promise<IMembershipDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Membership.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    }).populate('planId', 'name code category validityDays gracePeriodDays isLifetime feeAmountMinor currency');
  }

  async findActiveMembershipByEmail(
    organizationId: string,
    email: string
  ): Promise<IMembershipDocument | null> {
    await connectToDatabase();
    return Membership.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      email: email.toLowerCase().trim(),
      status: { $in: ['APPROVED', 'ACTIVE'] },
    });
  }

  async updateMembership(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IMembershipDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Membership.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async createMembershipRenewal(
    data: Partial<IMembershipRenewalDocument>
  ): Promise<IMembershipRenewalDocument> {
    await connectToDatabase();
    return MembershipRenewal.create(data);
  }

  async findRenewalsByMembership(
    organizationId: string,
    membershipId: string
  ): Promise<IMembershipRenewalDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(membershipId)) return [];
    await connectToDatabase();
    return MembershipRenewal.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      membershipId: new mongoose.Types.ObjectId(membershipId),
    }).sort({ createdAt: -1 });
  }

  // ======================== BENEFICIARIES, CASES & CONSENTS ========================

  async createHousehold(
    data: Partial<IBeneficiaryHouseholdDocument>
  ): Promise<IBeneficiaryHouseholdDocument> {
    await connectToDatabase();
    return BeneficiaryHousehold.create(data);
  }

  async findHouseholds(organizationId: string): Promise<IBeneficiaryHouseholdDocument[]> {
    await connectToDatabase();
    return BeneficiaryHousehold.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .sort({ createdAt: -1 })
      .limit(100);
  }

  async findHouseholdById(
    id: string,
    organizationId: string
  ): Promise<IBeneficiaryHouseholdDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return BeneficiaryHousehold.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async createBeneficiary(data: Partial<IBeneficiaryDocument>): Promise<IBeneficiaryDocument> {
    await connectToDatabase();
    return Beneficiary.create(data);
  }

  async findBeneficiaries(
    organizationId: string,
    filter: {
      status?: BeneficiaryStatus;
      verificationStatus?: string;
      assistanceCategory?: string;
      projectId?: string;
      district?: string;
      requiresSafeguarding?: boolean;
      search?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 25 }
  ): Promise<IBeneficiaryDocument[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.verificationStatus) query.verificationStatus = filter.verificationStatus;
    if (filter.assistanceCategory) query.assistanceCategory = filter.assistanceCategory;
    if (filter.projectId && mongoose.Types.ObjectId.isValid(filter.projectId)) {
      query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    }
    if (filter.district) query.district = new RegExp(filter.district, 'i');
    if (typeof filter.requiresSafeguarding === 'boolean') {
      query.requiresSafeguarding = filter.requiresSafeguarding;
    }
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ fullName: rx }, { beneficiaryCode: rx }, { district: rx }, { village: rx }];
    }
    return Beneficiary.find(query)
      .populate('programId', 'title code')
      .populate('projectId', 'name code')
      .populate('assignedCaseWorkerId', 'name role')
      .sort({ createdAt: -1 })
      .skip((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit);
  }

  async countBeneficiaries(
    organizationId: string,
    filter: { status?: BeneficiaryStatus; verificationStatus?: string } = {}
  ): Promise<number> {
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.verificationStatus) query.verificationStatus = filter.verificationStatus;
    return Beneficiary.countDocuments(query);
  }

  async findBeneficiaryById(
    id: string,
    organizationId: string
  ): Promise<IBeneficiaryDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Beneficiary.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })
      .populate('householdId', 'householdCode headOfHouseholdName memberCount district village')
      .populate('programId', 'title code')
      .populate('projectId', 'name code')
      .populate('assignedCaseWorkerId', 'name email role');
  }

  async updateBeneficiary(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IBeneficiaryDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return Beneficiary.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async createBeneficiaryVerification(
    data: Partial<IBeneficiaryVerificationDocument>
  ): Promise<IBeneficiaryVerificationDocument> {
    await connectToDatabase();
    return BeneficiaryVerification.create(data);
  }

  async findBeneficiaryVerifications(
    organizationId: string,
    beneficiaryId: string
  ): Promise<IBeneficiaryVerificationDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) return [];
    await connectToDatabase();
    return BeneficiaryVerification.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: new mongoose.Types.ObjectId(beneficiaryId),
    })
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });
  }

  async createEnrollment(
    data: Partial<IBeneficiaryEnrollmentDocument>
  ): Promise<IBeneficiaryEnrollmentDocument> {
    await connectToDatabase();
    return BeneficiaryEnrollment.create(data);
  }

  async findEnrollmentsByBeneficiary(
    organizationId: string,
    beneficiaryId: string
  ): Promise<IBeneficiaryEnrollmentDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) return [];
    await connectToDatabase();
    return BeneficiaryEnrollment.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: new mongoose.Types.ObjectId(beneficiaryId),
    })
      .populate('programId', 'title code')
      .populate('projectId', 'name code')
      .populate('caseWorkerId', 'name role')
      .sort({ enrollmentDate: -1 });
  }

  async createAssistanceRecord(
    data: Partial<IAssistanceRecordDocument>
  ): Promise<IAssistanceRecordDocument> {
    await connectToDatabase();
    return AssistanceRecord.create(data);
  }

  async findAssistanceByBeneficiary(
    organizationId: string,
    beneficiaryId: string
  ): Promise<IAssistanceRecordDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) return [];
    await connectToDatabase();
    return AssistanceRecord.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: new mongoose.Types.ObjectId(beneficiaryId),
    })
      .populate('projectId', 'name code')
      .sort({ createdAt: -1 });
  }

  async createCase(data: Partial<IBeneficiaryCaseDocument>): Promise<IBeneficiaryCaseDocument> {
    await connectToDatabase();
    return BeneficiaryCase.create(data);
  }

  async findCasesByBeneficiary(
    organizationId: string,
    beneficiaryId: string
  ): Promise<IBeneficiaryCaseDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) return [];
    await connectToDatabase();
    return BeneficiaryCase.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: new mongoose.Types.ObjectId(beneficiaryId),
    })
      .populate('assignedCaseWorkerId', 'name role')
      .sort({ createdAt: -1 });
  }

  async findCaseById(
    id: string,
    organizationId: string
  ): Promise<IBeneficiaryCaseDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return BeneficiaryCase.findOne({
      _id: new mongoose.Types.ObjectId(id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    });
  }

  async updateCase(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IBeneficiaryCaseDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return BeneficiaryCase.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }

  async createCaseNote(data: Partial<ICaseNoteDocument>): Promise<ICaseNoteDocument> {
    await connectToDatabase();
    return CaseNote.create(data);
  }

  async findCaseNotes(
    organizationId: string,
    beneficiaryId: string,
    includeSafeguardingNotes: boolean
  ): Promise<ICaseNoteDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(beneficiaryId)) return [];
    await connectToDatabase();
    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      beneficiaryId: new mongoose.Types.ObjectId(beneficiaryId),
    };
    if (!includeSafeguardingNotes) {
      query.isRestrictedSafeguardingNote = { $ne: true };
    }
    return CaseNote.find(query).sort({ createdAt: -1 }).limit(100);
  }

  async createConsentRecord(data: Partial<IConsentRecordDocument>): Promise<IConsentRecordDocument> {
    await connectToDatabase();
    return ConsentRecord.create(data);
  }

  async findConsentsBySubject(
    organizationId: string,
    subjectType: 'BENEFICIARY' | 'VOLUNTEER' | 'MEMBER',
    subjectId: string
  ): Promise<IConsentRecordDocument[]> {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) return [];
    await connectToDatabase();
    return ConsentRecord.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      subjectType,
      subjectId: new mongoose.Types.ObjectId(subjectId),
    }).sort({ createdAt: -1 });
  }

  async updateConsentRecord(
    id: string,
    organizationId: string,
    update: Record<string, unknown>
  ): Promise<IConsentRecordDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectToDatabase();
    return ConsentRecord.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      update,
      { new: true }
    );
  }
}

export const stakeholderRepository = new StakeholderRepository();
