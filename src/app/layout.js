"use client";

import React, { useEffect } from "react";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../app/theme";
import { useTranslation } from "react-i18next";
import "../app/i18n";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import ErrorBoundary from "./ErrorBoundary";

// MUI 组件
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SENTRY_DSN = "https://your_dsn@sentry.io/project_id";

export default function RootLayout({ children }) {
  // Sentry 初始化
  useEffect(() => {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
    });
  }, []);

  // i18n
  const { i18n, t } = useTranslation();

  // 当前路径
  const pathname = usePathname();
  // 若是首页 => 不渲染顶部菜单
  const isHomePage = pathname === "/";

  // 判断路由 => 用于按钮高亮
  const isBookkeeping = pathname === "/bookkeeping";
  const isReport = pathname === "/report";
  // 如果想“首页”也高亮，可加:
  // const isHome = (pathname === "/");

  // 版权信息
  const startYear = 2024;
  const currentYear = new Date().getFullYear();
  const yearDisplay =
    currentYear > startYear ? `${startYear}-${currentYear}` : `${startYear}`;

  // 语言切换按钮
  const LanguageButton = ({ code, flag, title }) => (
    <Box
      component="button"
      onClick={() => i18n.changeLanguage(code)}
      title={title}
      sx={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "1.2rem",
      }}
    >
      {flag}
    </Box>
  );

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            {/* 若非首页 => 显示菜单AppBar */}
            {!isHomePage && (
              <AppBar
                position="static"
                elevation={0}
                sx={{
                  backgroundColor: "#fff",
                  borderBottom: "1px solid #eee",
                  color: "#000",
                }}
              >
                <Toolbar>
                  {/* 左侧：三个按钮 (首页 / 记账 / 报表) */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {/* “首页” - 保持 outlined */}
                    <Button
                      variant="outlined"
                      color="warning"
                      sx={{ borderRadius: "4px" }}
                    >
                      <Link
                        href="/"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          padding: "0 8px",
                        }}
                      >
                        {t("homeButton")}
                      </Link>
                    </Button>

                    {/* “记账” => 高亮 if isBookkeeping */}
                    <Button
                      variant={isBookkeeping ? "contained" : "outlined"}
                      color="warning"
                      sx={{ borderRadius: "4px" }}
                    >
                      <Link
                        href="/bookkeeping"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          padding: "0 8px",
                        }}
                      >
                        {t("bookkeeping")}
                      </Link>
                    </Button>

                    {/* “报表” => 高亮 if isReport */}
                    <Button
                      variant={isReport ? "contained" : "outlined"}
                      color="warning"
                      sx={{ borderRadius: "4px" }}
                    >
                      <Link
                        href="/report"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          padding: "0 8px",
                        }}
                      >
                        {t("report")}
                      </Link>
                    </Button>
                  </Box>

                  {/* 占位撑开 */}
                  <Box sx={{ flex: 1 }} />

                  {/* 右侧：国旗语言切换 */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <LanguageButton code="zh" flag="🇨🇳" title="中文(简体)" />
                    <LanguageButton code="zh-TW" flag="🇨🇳" title="中文(繁体)" />
                    <LanguageButton code="en" flag="🇺🇸" title="English(US)" />
                    <LanguageButton code="es" flag="🇪🇸" title="Español" />
                    <LanguageButton code="fr" flag="🇫🇷" title="Français" />
                  </Box>
                </Toolbar>
              </AppBar>
            )}

            {/* 中间主体 (背景略淡灰 #f7f9fc) */}
            <Box component="main" sx={{ flex: 1, backgroundColor: "#f7f9fc" }}>
              {children}
            </Box>

            {/* 底部Footer */}
            <Box
              component="footer"
              sx={{
                borderTop: "1px solid #ddd",
                backgroundColor: "#fff",
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                ©{yearDisplay} Yuniverse
              </Typography>
            </Box>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
