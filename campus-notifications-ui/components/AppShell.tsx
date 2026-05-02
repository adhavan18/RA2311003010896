"use client";

import CampaignIcon from "@mui/icons-material/Campaign";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { createClientLogger } from "@/lib/client-logger";

const log = createClientLogger("AppShell");

const nav = [
  { href: "/notifications/all", label: "All notifications", icon: <CampaignIcon /> },
  {
    href: "/notifications/priority",
    label: "Priority notifications",
    icon: <NotificationsActiveIcon />,
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  const onNavigate = (href: string) => {
    log.info("nav:click", { href, pathname });
    setOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 280 }} role="presentation">
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Campus feed
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {nav.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            onClick={() => onNavigate(item.href)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="menu"
              onClick={() => {
                log.info("ui:drawer_open", {});
                setOpen(true);
              }}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          <Typography variant="h6" sx={{ flexGrow: isMobile ? 1 : 0, fontWeight: 800 }}>
            Campus notifications
          </Typography>
          {!isMobile ? (
            <Box sx={{ display: "flex", gap: 1, ml: 3 }}>
              {nav.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  color="inherit"
                  variant={pathname === item.href ? "outlined" : "text"}
                  onClick={() => onNavigate(item.href)}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="md">{children}</Container>
      </Box>
    </Box>
  );
}
