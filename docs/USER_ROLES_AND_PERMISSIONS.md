# Enterprise NGO Application — User Roles & Permissions Architecture
**Project Name**: HopeHorizon / Vikas NGO Ecosystem  
**Model**: 13-Tier Role-Based Access Control (RBAC) with Granular Policy Envelopes  

---

## 1. Overview & RBAC Principles

The platform enforces a strict, hierarchical **Role-Based Access Control (RBAC)** architecture coupled with resource-level scoping (organization-level, department-level, and project-assignment-level).

### Foundational Security Rules:
1. **Least Privilege by Default**: Users are granted the minimum set of permissions necessary to execute their assigned responsibilities.
2. **Dual-Layer Enforcement**: Permissions are evaluated in the browser for UI rendering and navigation, but are **strictly validated on the server** during every API Route Handler invocation.
3. **Immutability of Administrative Audits**: Sensitive actions (refunds, role modifications, certificate revocations, settings changes) automatically generate immutable audit log entries.
4. **No Self-Privilege Escalation**: Users cannot assign roles, grant permissions, or modify accounts that possess higher privilege levels than their own.

---

## 2. Complete Inventory of the 13 User Roles

### Category A: Platform-Level Role
1. **`SUPER_ADMIN`**: Global system architect. Oversees all tenant organizations, manages root configuration, provisions new organizations, inspects platform-wide audit logs, and monitors multi-tenant infrastructure health.

### Category B: Organization-Level Management Roles
2. **`ADMIN`**: Primary organizational administrator. Manages organization-wide settings, user accounts, program budgets, operational campaigns, and compliance archives.
3. **`EXECUTIVE_DIRECTOR`**: Executive leadership and governance. Possesses broad read-only access to strategic finances, program impacts, board reports, and organizational KPIs, with high-level approval permissions.
4. **`MANAGER`**: Departmental head. Manages cross-project coordination, task delegation, team performance tracking, and resource allocation across specific departments.
5. **`PROJECT_MANAGER`**: Field operation lead. Coordinates specific field projects, tracks milestone completions, supervises team members, and updates beneficiary statistics.
6. **`ACCOUNTANT`**: Financial custodian. Manages incoming donations, issues 80G tax certificates, reconciles bank transfers, processes authorized refunds, tracks expenses, and generates statutory Form 10BE ledgers.
7. **`COMMUNICATIONS`**: Outreach and PR coordinator. Manages public announcements, campaign fundraising dispatches, newsletter distribution lists, and press communications.
8. **`CONTENT_EDITOR`**: Digital storyteller and web editor. Creates and publishes CMS articles, manages the photo/video media gallery, updates success stories, and curates public event listings.

### Category C: Operational Roles
9. **`TEAM_MEMBER`**: Active employee or field staff. Reviews assigned tasks, clocks daily attendance, submits leave requests, logs field updates, and posts project progress reports.
10. **`VOLUNTEER`**: Grassroots field contributor. Accesses the Volunteer Service Hub, views assigned community drives, logs service hours, and claims verifiable volunteer certificates.
11. **`DONOR`**: Financial contributor or philanthropic patron. Accesses the Donor Impact Portfolio, reviews personal giving history, calculates estimated 80G tax deductions, and downloads official PDF receipts.
12. **`MEMBER`**: General Assembly or voting NGO member. Accesses the Member Governance Portal, views annual assembly documents, displays a digital membership pass with QR verification, and tracks membership renewals.

### Category D: Public Access Role
13. **`GUEST`**: Unauthenticated public visitor. Can browse public pages, explore transparent impact metrics, read CMS articles, register as a volunteer or donor, and initiate donations.

---

## 3. Granular Permission Catalog (36 Permissions)

Permissions are organized into discrete operational domains:

```text
Personnel & RBAC:      users.view, users.manage, roles.manage, departments.manage
Programs & Projects:   programs.view, programs.manage, projects.view, projects.manage, projects.view_assigned
Field Coordination:    tasks.assign_manage, tasks.update_assigned, attendance.manage, attendance.record
Fundraising & Giving:  campaigns.view, campaigns.manage, donations.view_all, donations.view_own, donations.refund
Volunteer Operations:  volunteers.view, volunteers.manage, volunteers.log_hours
Governance & Members:  members.view, members.manage, members.portal_access
Finance & Compliance:  finance.view, finance.manage, expenses.manage, reports.export_financial, compliance.manage
Trust & Public Proof:  certificates.issue, certificates.revoke, certificates.verify
CMS & Communications:  content.publish, content.edit, emails.broadcast, notifications.manage
Platform Governance:   audit_logs.view, settings.manage
```

---

## 4. Comprehensive Role-Permission Matrix

| Permission Key | `SUPER_ADMIN` | `ADMIN` | `EXEC_DIR` | `MANAGER` | `PROJ_MGR` | `ACCOUNTANT` | `COMMUNICATIONS` | `CONTENT_ED` | `TEAM_MEMBER` | `VOLUNTEER` | `DONOR` | `MEMBER` | `GUEST` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `users.view` | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `roles.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `departments.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `programs.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | 🔍 | 🔍 |
| `programs.manage` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `projects.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | 🔍 | 🔍 |
| `projects.manage` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `projects.view_assigned` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `tasks.assign_manage` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `tasks.update_assigned` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `attendance.manage` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `attendance.record` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `campaigns.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | 🔍 | 🔍 |
| `campaigns.manage` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `donations.view_all` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `donations.view_own` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `donations.refund` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `volunteers.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `volunteers.manage` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `volunteers.log_hours` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `members.view` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `members.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `members.portal_access`| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `finance.view` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `finance.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `expenses.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `reports.export_financial`| ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `compliance.manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `certificates.issue` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `certificates.revoke`| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `certificates.verify`| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `content.publish` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `content.edit` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `emails.broadcast` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `audit_logs.view` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `settings.manage` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

*Legend: ✅ Full Access | 🔍 Read-Only / Scoped View | ❌ No Access*

---

## 5. Server-Side RBAC Enforcement Pattern

Every Next.js 16 Route Handler validates authorization through reusable middleware guards:

```typescript
// Example: src/lib/auth-guard.ts
import { NextRequest } from 'next/server';
import { verifyJwtSession } from './session';
import { PermissionKey, UserRole } from '@/types';
import { ForbiddenError, UnauthorizedError } from './error-handler';

export async function authorizeRequest(
  req: NextRequest,
  requiredPermissions: PermissionKey[] = [],
  allowedRoles: UserRole[] = []
) {
  const session = await verifyJwtSession(req);
  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }

  // Super Admin bypasses role checks within legitimate tenant context
  if (session.role === 'SUPER_ADMIN') {
    return session;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new ForbiddenError('Insufficient role privileges');
  }

  for (const perm of requiredPermissions) {
    if (!session.permissions.includes(perm)) {
      throw new ForbiddenError(`Missing required permission: ${perm}`);
    }
  }

  return session;
}
```
