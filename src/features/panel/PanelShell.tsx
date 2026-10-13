'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { LogoMark } from '@/components/Logo';
import { Avatar, ErrorState } from '@/ui/Display';
import { Icon, type IconName } from '@/ui/Icon';
import { Menu } from '@/ui/Menu';
import { useToast } from '@/ui/Toast';

import { signOut } from '../auth/api';
import { useAuth } from '../auth/AuthProvider';
import { selectNeedsAttention } from '../leads/domain/collection';
import { useEnrichedLeads } from '../leads/hooks';
import { useUnreadNotificationCount } from '../notifications/hooks';
import { useProfile } from '../workspace/hooks';
import { useWorkspaceContext } from '../workspace/WorkspaceProvider';
import { NotificationsPanel } from './NotificationsPanel';
import styles from './panel.module.css';

const NAV: { href: string; label: string; icon: IconName; exact?: boolean }[] = [
  { href: '/app', label: 'Today', icon: 'home', exact: true },
  { href: '/app/leads', label: 'Leads', icon: 'users' },
  { href: '/app/activity', label: 'Activity', icon: 'activity' },
  { href: '/app/insights', label: 'Insights', icon: 'bar-chart-2' },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The web app's frame: workspace and navigation on the left, the page on the
 * right. Before a workspace exists, only setup is shown.
 */
export function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const workspace = useWorkspaceContext();
  const onSetup = pathname === '/app/setup';

  useEffect(() => {
    if (workspace.status === 'none' && !onSetup) router.replace('/app/setup');
  }, [workspace.status, onSetup, router]);

  if (workspace.status === 'loading' || (workspace.status === 'none' && !onSetup)) {
    return <Boot />;
  }
  if (workspace.status === 'error') {
    return (
      <div className={styles.center}>
        <ErrorState title="Unable to load your workspace" error={workspace.error} onRetry={workspace.retry} />
      </div>
    );
  }
  if (onSetup) return <>{children}</>;
  return <Frame>{children}</Frame>;
}

function Boot() {
  return (
    <div className={styles.center} role="status" aria-label="Loading Leads">
      <div className={styles.boot}>
        <LogoMark size={44} />
      </div>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Navigating closes the mobile drawer (adjusted while rendering, no effect needed).
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setDrawerOpen(false);
  }

  return (
    <div className={styles.frame}>
      <header className={styles.mobileBar}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}>
          <Icon name="menu" size={18} />
        </button>
        <Link href="/app" className={styles.mobileBrand}>
          <LogoMark size={24} />
        </Link>
        <Link href="/app/leads/new" className={styles.iconButton} aria-label="New lead">
          <Icon name="plus" size={18} />
        </Link>
      </header>

      {drawerOpen ? (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <Sidebar
        open={drawerOpen}
        onNotifications={() => setNotificationsOpen(true)}
        pathname={pathname}
      />

      <main className={styles.main}>{children}</main>

      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}

function Sidebar({
  open,
  pathname,
  onNotifications,
}: {
  open: boolean;
  pathname: string;
  onNotifications: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const profile = useProfile();
  const { workspace, memberships, switchWorkspace } = useWorkspaceContext();
  const { leads } = useEnrichedLeads();
  const attention = selectNeedsAttention(leads).length;
  const unread = useUnreadNotificationCount();
  const name = profile.data?.display_name || user.email || 'You';

  const logOut = async () => {
    try {
      await signOut();
      // A full load, so nothing from this account stays in memory.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    } catch (error) {
      toast.error(error, 'Unable to log out');
    }
  };

  return (
    <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`} aria-label="Leads">
      <Menu
        label="Workspaces"
        align="left"
        entries={[
          { heading: 'Workspaces' },
          ...memberships.map((membership) => ({
            label: membership.workspace.name,
            icon: (membership.workspace_id === workspace?.id ? 'check' : 'briefcase') as IconName,
            onSelect: () => {
              switchWorkspace(membership.workspace_id);
              router.push('/app');
            },
          })),
          'divider' as const,
          { label: 'Create or join a workspace', icon: 'plus', onSelect: () => router.push('/app/setup') },
        ]}
        trigger={({ toggle, open: menuOpen }) => (
          <button
            type="button"
            className={styles.workspace}
            onClick={toggle}
            aria-expanded={menuOpen}
            aria-haspopup="menu">
            <LogoMark size={26} />
            <span className={styles.workspaceName}>{workspace?.name}</span>
            <Icon name="chevron-down" size={14} className={styles.workspaceChevron} />
          </button>
        )}
      />

      <Link href="/app/leads/new" className={styles.newLead}>
        <Icon name="plus" size={15} />
        New lead
      </Link>

      <nav className={styles.nav} aria-label="Main">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${active ? styles.navActive : ''}`}
              aria-current={active ? 'page' : undefined}>
              <Icon name={item.icon} size={16} />
              {item.label}
              {item.href === '/app' && attention > 0 ? (
                <span className={styles.count} aria-label={`${attention} need you`}>
                  {attention}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarBottom}>
        <button type="button" className={styles.navItem} onClick={onNotifications}>
          <Icon name="bell" size={16} />
          Notifications
          {unread > 0 ? <span className={styles.countAccent}>{unread}</span> : null}
        </button>
        <Link
          href="/app/settings"
          className={`${styles.navItem} ${pathname.startsWith('/app/settings') ? styles.navActive : ''}`}>
          <Icon name="settings" size={16} />
          Settings
        </Link>

        <Menu
          label="Account"
          align="left"
          direction="up"
          entries={[
            { label: 'Profile', icon: 'user', onSelect: () => router.push('/app/settings/profile') },
            { label: 'Leads website', icon: 'external-link', onSelect: () => window.open('/', '_blank') },
            'divider',
            { label: 'Log out', icon: 'log-out', onSelect: () => void logOut() },
          ]}
          trigger={({ toggle, open: menuOpen }) => (
            <button
              type="button"
              className={styles.account}
              onClick={toggle}
              aria-expanded={menuOpen}
              aria-haspopup="menu">
              <Avatar name={name} size={28} />
              <span className={styles.accountText}>
                <span className={styles.accountName}>{name}</span>
                <span className={styles.accountEmail}>{user.email}</span>
              </span>
            </button>
          )}
        />
      </div>
    </aside>
  );
}
