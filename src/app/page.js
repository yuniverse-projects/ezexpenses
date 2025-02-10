"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  // 使用 i18n
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #fce8e6 0%, #fdeff0 100%)",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
      }}
    >
      {/* 产品名称，多语言键示例： homepageTitle */}
      <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
        {t("homepageTitle")}
        {/* 例: "EXExpenses" 或根据你在 i18n translation.json 里定义 */}
      </Typography>

      {/* 介绍文案，多语言键: homepageDescription */}
      <Typography variant="h6" sx={{ color: "text.secondary", mb: 3 }}>
        {t("homepageDescription")}
      </Typography>

      {/* “开始记账吧”按钮，多语言键: startBookkeeping */}
      <Link href="/bookkeeping" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="primary" sx={{ px: 4, py: 1.5 }}>
          {t("startBookkeeping")}
        </Button>
      </Link>
    </Box>
  );
}
