'use client';

import Link, { type LinkProps } from 'next/link';
import { useSidebarState } from '@/lib/store/useSidebarState';

interface StyledLinkProps {
  href: LinkProps['href'];
  children: React.ReactNode;
}

const StyledLink: React.FC<StyledLinkProps> = ({ href, children }) => {
  const fixedClassName = `w-full hover:bg-hoverbg bg-transparent flex flex-row items-center gap-2 rounded-md whitespace-nowrap overflow-hidden`;

  return (
    <Link
      href={href}
      className={fixedClassName}
    >
      {children}
    </Link>
  );
};

const SidebarMenu = () => {
  const { isSidebarOpen } = useSidebarState();

  return (
    <div className="w-full flex flex-col gap-1 items-start">
      {/* Menu items can be added here in the future */}
    </div>
  );
};

export default SidebarMenu;
