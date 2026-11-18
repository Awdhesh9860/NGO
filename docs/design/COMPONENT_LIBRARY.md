# Enterprise NGO Design System — Component Library
**Platform**: HopeHorizon / Vikas NGO Ecosystem  
**Component Location**: `src/components/ui/` & `@/components/ui`  

---

## 1. Master Component Catalog

```text
Basic Primitives:       Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch,
                        Label, Badge, Avatar, Separator, Skeleton, Spinner, Tooltip
Layout Primitives:      Container, Section, Card, CardHeader, CardTitle, CardDescription,
                        CardContent, CardFooter, PageHeader, EmptyState, ErrorState
Navigation Primitives:  Breadcrumb, Tabs, Pagination, Dropdown, ThemeToggle
Data Display:           DataTable, StatCard, MetricCard, ProgressBar, StatusBadge, ActivityList, ChartContainer
Feedback Primitives:    Alert, Modal, Drawer, Toast
```

---

## 2. Component Usage & Code Examples

### 2.1 Buttons (`Button` & `IconButton`)
```tsx
import { Button, IconButton } from '@/components/ui';
import { Heart, Download } from 'lucide-react';

// Primary Action Button
<Button variant="primary" size="md" leftIcon={<Heart className="h-4 w-4" />}>
  Donate Now (80G Tax-Exempt)
</Button>

// Accessible Icon-Only Button
<IconButton variant="outline" size="md" aria-label="Download 80G Receipt">
  <Download className="h-4 w-4" />
</IconButton>
```

### 2.2 Cards (`Card`)
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

<Card hoverEffect className="dark:bg-[#152721] dark:border-[#223c32]">
  <CardHeader>
    <CardTitle>Clean Water Initiative</CardTitle>
    <CardDescription>Target: 50,000 rural families</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 dark:text-slate-300">
      Installation of solar-powered filtration plants across arid communities.
    </p>
  </CardContent>
</Card>
```

### 2.3 Status Badges (`StatusBadge`)
```tsx
import { StatusBadge } from '@/components/ui';

<StatusBadge status="ACTIVE" />
<StatusBadge status="PENDING" label="Under Verification" />
<StatusBadge status="SUCCESSFUL" />
```

### 2.4 Page Header (`PageHeader`)
```tsx
import { PageHeader, Button } from '@/components/ui';
import { Plus } from 'lucide-react';

<PageHeader
  title="Field Projects & Deployments"
  description="Monitor milestone execution, funding progress, and beneficiary counts."
  badge="Operations Control"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/dashboard?tab=projects' },
  ]}
  actions={
    <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
      New Project
    </Button>
  }
/>
```
