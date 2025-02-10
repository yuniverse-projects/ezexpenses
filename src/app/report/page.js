"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getAllRecords } from "../lib/BookkeepingService";
import BarChartWithTwoAverages from "../components/BarChartWithTwoAverages";

// 拆分出的组件
import { TagCloud } from "./components/TagCloud";
import {
  AllRecordsSummary,
  YearSummary,
  MonthSummary,
} from "./components/Summaries";

// ====== 帮助函数(计算收支合计) ======
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

export default function BookkeepingReportPage() {
  const { t } = useTranslation();

  // 全部记录
  const [records, setRecords] = useState([]);

  // 多级视图: 'allYears' | 'yearMonths' | 'monthDays'
  const [viewLevel, setViewLevel] = useState("yearMonths");

  // 当前选中的 年 / 月
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0-based

  // 是否显示收入 / 支出
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);

  // 标签云模式 ('freq'|'amount')
  const [tagCloudMode, setTagCloudMode] = useState("freq");

  // 页面加载时拿到记录
  useEffect(() => {
    const data = getAllRecords();
    setRecords(data);
  }, []);

  // 顶部概览(选中年的收入/支出/结余)
  const {
    income: topInc,
    expense: topExp,
    net: topNet,
  } = useMemo(() => {
    return sumIncomeExpense(records, selectedYear);
  }, [records, selectedYear]);

  // ========== 统计 allYearsData, yearMonthsData, monthDaysData ==========

  // 1) allYearsData
  const allYearsData = useMemo(() => {
    const map = new Map(); // year => {income, expense}
    records.forEach((r) => {
      const y = new Date(r.date).getFullYear();
      if (!map.has(y)) {
        map.set(y, { income: 0, expense: 0 });
      }
      if (r.type === "income") map.get(y).income += r.amount;
      else if (r.type === "expense") map.get(y).expense += r.amount;
    });

    const arr = [...map.entries()].map(([year, val]) => ({
      label: year.toString(),
      income: val.income,
      expense: val.expense,
    }));
    arr.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    return arr;
  }, [records]);

  // 2) yearMonthsData
  const yearMonthsData = useMemo(() => {
    const arr = Array.from({ length: 12 }, (_, i) => ({
      label: (i + 1).toString(),
      income: 0,
      expense: 0,
    }));
    records.forEach((r) => {
      const d = new Date(r.date);
      if (d.getFullYear() === selectedYear) {
        if (r.type === "income") arr[d.getMonth()].income += r.amount;
        else arr[d.getMonth()].expense += r.amount;
      }
    });
    return arr;
  }, [records, selectedYear]);

  // 3) monthDaysData
  const monthDaysData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      label: (i + 1).toString(),
      income: 0,
      expense: 0,
    }));
    records.forEach((r) => {
      const d = new Date(r.date);
      if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
        if (r.type === "income") arr[d.getDate() - 1].income += r.amount;
        else arr[d.getDate() - 1].expense += r.amount;
      }
    });
    return arr;
  }, [records, selectedYear, selectedMonth]);

  // 根据viewLevel 选取图表数据
  const chartData = useMemo(() => {
    if (viewLevel === "allYears") return allYearsData;
    if (viewLevel === "yearMonths") return yearMonthsData;
    if (viewLevel === "monthDays") return monthDaysData;
    return [];
  }, [viewLevel, allYearsData, yearMonthsData, monthDaysData]);

  // 点击柱子 => 下一级
  function handleBarClick(e) {
    if (!e?.activePayload) return;
    const payload = e.activePayload[0]?.payload;
    if (!payload) return;

    if (viewLevel === "allYears") {
      const year = parseInt(payload.label, 10);
      setSelectedYear(year);
      setViewLevel("yearMonths");
    } else if (viewLevel === "yearMonths") {
      const m = parseInt(payload.label, 10) - 1;
      setSelectedMonth(m);
      setViewLevel("monthDays");
    }
  }

  // 返回上一级
  function handleBack() {
    if (viewLevel === "monthDays") {
      setViewLevel("yearMonths");
    } else if (viewLevel === "yearMonths") {
      setViewLevel("allYears");
    }
  }

  // ========== 下方额外信息: allRecords / year / month合计 ==========

  // const {
  //   income: allInc,
  //   expense: allExp,
  //   net: allNet,
  // } = useMemo(() => {
  //   return sumIncomeExpense(records, null, null);
  // }, [records]);

  // const {
  //   income: yearInc,
  //   expense: yearExp,
  //   net: yearNet,
  // } = useMemo(() => {
  //   return sumIncomeExpense(records, selectedYear, null);
  // }, [records, selectedYear]);

  // const {
  //   income: monthInc,
  //   expense: monthExp,
  //   net: monthNet,
  // } = useMemo(() => {
  //   if (viewLevel === "monthDays") {
  //     return sumIncomeExpense(records, selectedYear, selectedMonth);
  //   }
  //   return { income: 0, expense: 0, net: 0 };
  // }, [records, viewLevel, selectedYear, selectedMonth]);

  // 动态图表标题
  function getChartTitle() {
    if (viewLevel === "allYears") {
      return t("allYearsTrend");
    } else if (viewLevel === "yearMonths") {
      return `${selectedYear}年 ${t("monthlyTrend")}`;
    } else if (viewLevel === "monthDays") {
      return `${selectedYear}年${selectedMonth + 1}月 ${t("dailyTrend")}`;
    }
    return "";
  }

  // 拆分“支出”和“收入”记录 用于标签云
  const expenseRecords = useMemo(
    () => records.filter((r) => r.type === "expense"),
    [records]
  );
  const incomeRecords = useMemo(
    () => records.filter((r) => r.type === "income"),
    [records]
  );

  return (
    <Box sx={{ backgroundColor: "#f7f9fc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* 顶部标题 */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {t("EZExpensesReport")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t("poweredBy")}
          </Typography>
        </Box>

        {/* 当前年概况 */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t("currentYearStats", { year: selectedYear })}
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-evenly"
              sx={{ mb: 2 }}
            >
              <Box textAlign="center">
                <Typography variant="subtitle2" color="text.secondary">
                  {t("yearlyIncome")}
                </Typography>
                <Typography variant="h6">
                  {t("currencySymbol")}
                  {topInc.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2" color="text.secondary">
                  {t("yearlyExpense")}
                </Typography>
                <Typography variant="h6">
                  {t("currencySymbol")}
                  {topExp.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2" color="text.secondary">
                  {t("yearlyBalance")}
                </Typography>
                <Typography
                  variant="h6"
                  color={topNet >= 0 ? "success.main" : "error.main"}
                >
                  {t("currencySymbol")}
                  {topNet.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 主图表 */}
        <Card variant="outlined">
          <CardContent>
            {/* 返回上一级按钮 */}
            {viewLevel !== "allYears" && (
              <Button variant="outlined" onClick={handleBack} sx={{ mb: 2 }}>
                {t("back")}
              </Button>
            )}

            {/* 图表标题 */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
              {getChartTitle()}
            </Typography>

            {/* 收入/支出 复选框 */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showIncome}
                    onChange={(e) => setShowIncome(e.target.checked)}
                    color="success"
                  />
                }
                label={t("income")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showExpense}
                    onChange={(e) => setShowExpense(e.target.checked)}
                    color="error"
                  />
                }
                label={t("expense")}
              />
            </Stack>

            {/* 柱状图 */}
            <Box sx={{ width: "100%", height: 400 }}>
              {!chartData.length ? (
                <Typography color="text.secondary">{t("noData")}</Typography>
              ) : (
                <BarChartWithTwoAverages
                  data={chartData}
                  showIncome={showIncome}
                  showExpense={showExpense}
                  t={t}
                  onBarClick={handleBarClick}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 下方额外信息，拆分成 Summaries组件 */}
            {viewLevel === "allYears" && (
              <AllRecordsSummary records={records} />
            )}
            {viewLevel === "yearMonths" && (
              <YearSummary records={records} year={selectedYear} />
            )}
            {viewLevel === "monthDays" && (
              <MonthSummary
                records={records}
                year={selectedYear}
                month={selectedMonth}
              />
            )}
          </CardContent>
        </Card>

        {/* --- 支出标签云 --- */}
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {t("tagCloud")} - {t("expenseStats")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant={tagCloudMode === "freq" ? "contained" : "outlined"}
                onClick={() => setTagCloudMode("freq")}
              >
                {t("frequency")}
              </Button>
              <Button
                variant={tagCloudMode === "amount" ? "contained" : "outlined"}
                onClick={() => setTagCloudMode("amount")}
              >
                {t("amount")}
              </Button>
            </Stack>

            {/* 只包含支出记录的标签云 */}
            <TagCloud records={expenseRecords} mode={tagCloudMode} />
          </CardContent>
        </Card>

        {/* --- 收入标签云 --- */}
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              {t("tagCloud")} - {t("incomeStats")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* 如果也想让收入标签云能切换 freq/amount，这里可再加按钮，也可复用同一个tagCloudMode */}
            <TagCloud records={incomeRecords} mode={tagCloudMode} />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
