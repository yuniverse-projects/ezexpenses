"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

/**
 * Next.js 13 的全局错误页面
 * 当在 Layout 范围内出现渲染错误（未被你手动 ErrorBoundary 捕获）时，会显示本组件。
 */
export default function GlobalError({ error, reset }) {
  // i18n
  const { t } = useTranslation();

  return (
    <html>
      <body
        style={{
          padding: "16px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h2>{t("errorTitle")}</h2>
        <p>
          {t("errorMessage")}: {error?.message}
        </p>

        {/* 提供一个 retry 按钮，让用户重试 */}
        <button
          onClick={() => reset()}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {t("retry")}
        </button>

        {/* 可选：也可加一个返回首页按钮 */}
        <div style={{ marginTop: "8px" }}>
          <Link href="/" style={{ textDecoration: "underline", color: "blue" }}>
            {t("goHome")}
          </Link>
        </div>
      </body>
    </html>
  );
}
