'use client';

import Link, { type LinkProps } from 'next/link';
import NewChatIcon from '../Icons/NewChatIcon';
import { useSidebarState } from '@/app/lib/store/useSidebarState';
interface StyledLinkProps {
  href: LinkProps['href'];
  children: React.ReactNode;
}

// 2. 创建组件
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
      <StyledLink href={`/`}>
        <NewChatIcon
          className="flex-shrink-0 ml-2"
          width={20}
          height={20}
        />
        <span
          className={`transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          new chat
        </span>
      </StyledLink>
    </div>
  );
};

export default SidebarMenu;
