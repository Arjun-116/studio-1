'use client';
import { DashboardLayout } from '@/components/app/dashboard-layout';
import { User, Calendar, Users, Handshake } from 'lucide-react';

const navItems = [
  { href: '/alumni-dashboard', label: 'My Profile', icon: <User /> },
  { href: '/alumni-dashboard/events', label: 'Events & Opportunities', icon: <Calendar /> },
  { href: '/alumni-dashboard/mentor-matching', label: 'Mentor Matching', icon: <Handshake /> },
];

export default function AlumniDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navItems={navItems} title="Alumni Portal">{children}</DashboardLayout>;
}
