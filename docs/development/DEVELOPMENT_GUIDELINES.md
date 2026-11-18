# Enterprise NGO Platform — Development Guidelines
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Target Audience**: Platform Developers, Feature Engineers & Contributors  

---

## 1. Local Environment Setup

### Prerequisites:
- **Node.js**: `v20.x` or higher (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **Git**: `v2.40+`

### Setup Steps:
```bash
# 1. Clone repository & install dependencies
git clone <repo-url>
cd NGO
npm install

# 2. Configure local environment
cp .env.example .env

# 3. Start development server with Turbopack
npm run dev

# 4. Verify test suite
npm run test:run
```

---

## 2. Standard Development Workflows

### How to Create a New Feature:
1. Create directory `src/features/<feature-name>/`.
2. Populate internal folders: `components/`, `hooks/`, `services/`, `schemas/`, `types/`.
3. Create `index.ts` declaring public exports.
4. Create `README.md` documenting ownership, dependencies, and permissions.
5. Create unit tests under `tests/` verifying schemas and services.

### How to Add a New Public Page:
1. Create route directory under `src/app/(public)/<route-name>/page.tsx`.
2. Ensure `page.tsx` is lightweight: configure SEO metadata and mount the corresponding feature component.
3. Add navigation link in `src/config/navigation.config.ts`.

### How to Add a New API Route Handler:
1. Create directory under `src/app/api/v1/<resource>/route.ts`.
2. Wrap execution in standardized try/catch block with `handleApiError`.
3. Invoke `authorizeRequest` for authenticated or privileged endpoints.
4. Validate incoming payload against Zod schema using `.safeParse()`.
5. Return standardized `ApiResponse<T>` envelope via `createSuccessResponse()`.

### How to Add a New Reusable UI Primitive:
1. Create component under `src/components/ui/<ComponentName>.tsx`.
2. Ensure component is completely business-agnostic (no references to donations, volunteers, or NGO business entities).
3. Export from `src/components/ui/index.ts`.
