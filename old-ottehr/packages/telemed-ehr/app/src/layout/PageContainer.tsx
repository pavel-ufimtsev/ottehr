import { Container, Tooltip, Typography } from '@mui/material';
import { ReactElement, useState } from 'react';
import { Sidebar, SidebarItem } from '../components/navigation/Sidebar';
import useOttehrUser from '../hooks/useOttehrUser';
import { RoleType } from '../types/types';

const { VITE_APP_ORGANIZATION_NAME_LONG: ORGANIZATION_NAME_LONG } = import.meta.env;
if (ORGANIZATION_NAME_LONG == null) {
  throw new Error('Could not load env variable');
}

interface PageContainerProps {
  sidebarItems?: SidebarItem[][];
  tabTitle?: string;
  title?: string;
  children: ReactElement;
}

export default function PageContainer({ sidebarItems, tabTitle, title, children }: PageContainerProps): ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useOttehrUser();

  if (title != null || tabTitle != null) {
    document.title = `${tabTitle != null ? tabTitle : title} | ${ORGANIZATION_NAME_LONG} EHR`;
  }

  const container = (
    <Container sx={{ my: 5, maxWidth: '1400px !important' }}>
      {title && (
        <Typography variant="h3" color="primary.dark" sx={{ fontWeight: 600, mb: 4 }}>
          {title}
        </Typography>
      )}
      {children}
    </Container>
  );

  return (
    <>
      {sidebarItems ? (
        <Sidebar sidebarItems={sidebarItems} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          {container}
        </Sidebar>
      ) : (
        container
      )}
    </>
  );
}
