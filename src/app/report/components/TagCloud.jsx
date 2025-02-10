"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

/** 计算标签出现次数 */
function getTagFrequency(list) {
  const freq = {};
  list.forEach((r) => {
    (r.tags || []).forEach((tg) => {
      freq[tg] = (freq[tg] || 0) + 1;
    });
  });
  return freq;
}

/** 计算标签累计金额 */
function getTagAmount(list) {
  const amt = {};
  list.forEach((r) => {
    (r.tags || []).forEach((tg) => {
      amt[tg] = (amt[tg] || 0) + r.amount;
    });
  });
  return amt;
}

export function TagCloud({ records, mode = "freq" }) {
  const { t } = useTranslation();

  const freqMap = useMemo(() => getTagFrequency(records), [records]);
  const amtMap = useMemo(() => getTagAmount(records), [records]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set([...Object.keys(freqMap), ...Object.keys(amtMap)])
    );
  }, [freqMap, amtMap]);

  const maxFreq = useMemo(() => {
    return allTags.length
      ? Math.max(...allTags.map((tg) => freqMap[tg] || 0))
      : 1;
  }, [allTags, freqMap]);

  const maxAmt = useMemo(() => {
    return allTags.length
      ? Math.max(...allTags.map((tg) => amtMap[tg] || 0))
      : 1;
  }, [allTags, amtMap]);

  // 生成用于云布局的 “words”
  const words = useMemo(() => {
    const minFont = 12;
    const maxFont = 36;
    return allTags.map((tg) => {
      const fVal = freqMap[tg] || 0;
      const aVal = amtMap[tg] || 0;

      if (mode === "freq") {
        const ratio = maxFreq > 0 ? fVal / maxFreq : 0;
        const size = minFont + ratio * (maxFont - minFont);
        return {
          text: tg,
          size,
          tooltip: `${tg}: ${fVal} ${t("times")}`,
        };
      } else {
        // "amount"
        const ratio = maxAmt > 0 ? aVal / maxAmt : 0;
        const size = minFont + ratio * (maxFont - minFont);
        return {
          text: tg,
          size,
          tooltip: `${tg}: ${t("currencySymbol")}${aVal.toFixed(2)}`,
        };
      }
    });
  }, [allTags, freqMap, amtMap, mode, maxFreq, maxAmt, t]);

  // 用 d3-cloud 布局
  const [layoutData, setLayoutData] = useState([]);
  useEffect(() => {
    if (!words.length) {
      setLayoutData([]);
      return;
    }
    import("d3-cloud").then((cloudModule) => {
      const cloud = cloudModule.default;
      const layout = cloud()
        .size([500, 500])
        .words(words)
        .padding(2)
        .spiral("archimedean")
        .rotate(() => 0)
        .font("sans-serif")
        .fontSize((d) => d.size)
        .on("end", (out) => setLayoutData(out));
      layout.start();
    });
  }, [words]);

  // 若无数据
  if (!records.length || !allTags.length) {
    return <Typography color="text.secondary">{t("noData")}</Typography>;
  }
  if (!layoutData.length) {
    return <Typography color="text.secondary">{t("noData")}</Typography>;
  }

  const size = 500;
  const half = size / 2;
  const colorPalette = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#d0ed57",
    "#a4de6c",
    "#ffd700",
  ];

  return (
    <Box
      sx={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      {layoutData.map((w, i) => {
        const style = {
          position: "absolute",
          left: half + w.x,
          top: half + w.y,
          fontSize: w.size,
          fontWeight: "bold",
          color: colorPalette[i % colorPalette.length],
          transform: "translate(-50%, -50%)",
          whiteSpace: "nowrap",
          cursor: "pointer",
        };
        return (
          <span key={w.text + i} style={style} title={w.tooltip}>
            {w.text}
          </span>
        );
      })}
    </Box>
  );
}
