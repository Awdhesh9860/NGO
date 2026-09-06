import React from 'react';
import {
  Building,
  Compass,
  Eye,
  ShieldCheck,
  HeartHandshake,
  Users,
  Users2,
  Award,
  GraduationCap,
  Laptop,
  Activity,
  Heart,
  Smile,
  Sprout,
  Trees,
  Home,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  TrendingUp,
  BarChart3,
  BookOpen,
  FileText,
  CheckSquare,
  HandHeart,
  Briefcase,
  UserCheck,
  Sparkles,
  CalendarDays,
  Newspaper,
  Image,
  Files,
  BadgeCheck,
  HelpCircle,
  FolderOpen,
  FileSpreadsheet
} from 'lucide-react';

interface NavIconProps {
  name?: string;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ name, className = 'h-4 w-4' }) => {
  switch (name) {
    case 'Building': return <Building className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Eye': return <Eye className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'HeartHandshake': return <HeartHandshake className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Users2': return <Users2 className={className} />;
    case 'Award': return <Award className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'Sprout': return <Sprout className={className} />;
    case 'Trees': return <Trees className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'BarChart3': return <BarChart3 className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'HandHeart': return <HandHeart className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'UserCheck': return <UserCheck className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'CalendarDays': return <CalendarDays className={className} />;
    case 'Newspaper': return <Newspaper className={className} />;
    case 'Image': return <Image className={className} />;
    case 'Files': return <Files className={className} />;
    case 'BadgeCheck': return <BadgeCheck className={className} />;
    case 'HelpCircle': return <HelpCircle className={className} />;
    case 'FileSpreadsheet': return <FileSpreadsheet className={className} />;
    default: return <FolderOpen className={className} />;
  }
};
