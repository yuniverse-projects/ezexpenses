"use client";

import React from "react";
import { Typography, Stack, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

// 如果 sumIncomeExpense 在别处，你也可以 import 它。也可以直接复制粘贴函数。
function sumIncomeExpense(records, year = null, month = null) {
  let inc = 0,
    exp = 0;
  records.forEach((r) => {
    const d = new Date(r.date);
    if (year !== null && d.getFullYear() !== year) return;
    if (month !== null && d.getMonth() !== month) return;

    if (r.type === "income") inc += r.amount;
    else if (r.type === "expense") exp += r.amount;
  });
  return { income: inc, expense: exp, net: inc - exp };
}

/** 全部记录汇总 */
export function AllRecordsSummary({ records }) {
  const { t } = useTranslation();
  const { income, expense, net } = sumIncomeExpense(records, null, null);

  return (
    <Stack direction="row" spacing={2} justifyContent="space-evenly">
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("allRecordsIncome")}
        </Typography>
        <Typography variant="h6">
          {t("currencySymbol")}
          {income.toFixed(2)}
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("allRecordsExpense")}
        </Typography>
        <Typography variant="h6">
          {t("currencySymbol")}
          {expense.toFixed(2)}
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("allRecordsBalance")}
        </Typography>
        <Typography
          variant="h6"
          color={net >= 0 ? "success.main" : "error.main"}
        >
          {t("currencySymbol")}
          {net.toFixed(2)}
        </Typography>
      </Box>
    </Stack>
  );
}

/** 某年汇总 */
export function YearSummary({ records, year }) {
  const { t } = useTranslation();
  const { income, expense, net } = sumIncomeExpense(records, year, null);

  return (
    <Stack direction="row" spacing={2} justifyContent="space-evenly">
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("yearTotalIncome")}
        </Typography>
        <Typography variant="h6">
          {t("currencySymbol")}
          {income.toFixed(2)}
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("yearTotalExpense")}
        </Typography>
        <Typography variant="h6">
          {t("currencySymbol")}
          {expense.toFixed(2)}
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("yearTotalBalance")}
        </Typography>
        <Typography
          variant="h6"
          color={net >= 0 ? "success.main" : "error.main"}
        >
          {t("currencySymbol")}
          {net.toFixed(2)}
        </Typography>
      </Box>
    </Stack>
  );
}

/** 某年某月汇总 */
export function MonthSummary({ records, year, month }) {
  const { t } = useTranslation();
  const { income, expense, net } = sumIncomeExpense(records, year, month);

  return (
    <Stack direction="row" spacing={2} justifyContent="space-evenly">
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("monthTotalIncome")}
        </Typography>
        <Typography variant="h6">
          {t("currencySymbol")}
          {income.toFixed(2)}
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("monthTotalExpense")}
        </Typography>
        <Typography variant="h6">
          {t("currencySymbol")}
          {expense.toFixed(2)}
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary">
          {t("monthTotalBalance")}
        </Typography>
        <Typography
          variant="h6"
          color={net >= 0 ? "success.main" : "error.main"}
        >
          {t("currencySymbol")}
          {net.toFixed(2)}
        </Typography>
      </Box>
    </Stack>
  );
}
