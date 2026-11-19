// Existing public & staff exports preserved
export type { Project, Milestone } from '../../types';
export { ProjectsView } from '../../components/public/ProjectsView';
export { ProjectDetailView } from '../../components/public/ProjectDetailView';
export { StaffPortal } from '../../components/dashboard/StaffPortal';

// Phase 07 Enterprise Project Management exports
export * from './schemas/project.schema';
export * from './services/project-api.service';
export * from './components/ProjectStatusBadge';
export * from './components/ProjectProgress';
export * from './components/ProjectCard';
export * from './components/ProjectForm';
export * from './components/ProjectTimeline';
export * from './components/ProjectTeamPanel';
export * from './components/RiskRegister';
export * from './components/ProjectActivityTimeline';
