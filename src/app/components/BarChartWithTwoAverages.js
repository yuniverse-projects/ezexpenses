"use client";
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ReferenceLine,
} from "recharts";

/**
 * data: [{ label:'1', income:..., expense:...}, ...]
 * showIncome: bool
 * showExpense: bool
 * t: i18n 函数
 * onBarClick: function(e) => 外层用来处理多级跳转
 */
export default function BarChartWithTwoAverages({
  data,
  showIncome,
  showExpense,
  t,
  onBarClick, // 关键: 用来接收外部的点击回调
}) {
  // 1) 计算两条均值 + 最大值
  const { incomeAvg, expenseAvg } = useMemo(() => {
    if (!data || !data.length) {
      return { incomeAvg: 0, expenseAvg: 0 };
    }
    let incSum = 0,
      expSum = 0;
    let maxVal = 0;
    data.forEach((item) => {
      if (item.income > maxVal) maxVal = item.income;
      if (item.expense > maxVal) maxVal = item.expense;
      incSum += item.income;
      expSum += item.expense;
    });
    const incAvg = incSum / data.length;
    const expAvg = expSum / data.length;
    return { incomeAvg: incAvg, expenseAvg: expAvg };
  }, [data]);

  // 2) 处理避免重叠
  function getIncomeLabel() {
    // 可类似前面动态调 dy
    return {
      value: `${t("average")}(${t("income")}): ${incomeAvg.toFixed(2)}`,
      position: "top",
      dy: -5,
      fill: "green",
      fontSize: 12,
    };
  }
  function getExpenseLabel() {
    // 避免跟income冲突时, dx可微调
    return {
      value: `${t("average")}(${t("expense")}): ${expenseAvg.toFixed(2)}`,
      position: "top",
      dy: 15,
      fill: "red",
      fontSize: 12,
    };
  }

  // 如果data空，则return noData
  if (!data || !data.length) {
    return <div style={{ textAlign: "center" }}>{t("noData")}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        // 关键: 在这里监听 onClick, 并回调给外部
        onClick={(chartEvent) => {
          if (onBarClick) {
            onBarClick(chartEvent);
          }
        }}
        margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          tickFormatter={(val) => Number(val).toFixed(0)}
          dataKey="label"
        />
        <YAxis tickFormatter={(val) => Number(val).toFixed(2)} />
        <ReTooltip formatter={(val, name) => [Number(val).toFixed(2), name]} />
        <Legend />

        {/* 收入平均线 */}
        {showIncome && (
          <ReferenceLine
            y={incomeAvg}
            stroke="green"
            strokeDasharray="3 3"
            label={getIncomeLabel()}
          />
        )}

        {/* 支出平均线 */}
        {showExpense && (
          <ReferenceLine
            y={expenseAvg}
            stroke="red"
            strokeDasharray="3 3"
            label={getExpenseLabel()}
          />
        )}

        {/* 柱子 */}
        {showIncome && (
          <Bar
            dataKey="income"
            fill="green"
            name={t("income")}
            label={{
              position: "top",
              formatter: (val) => Number(val).toFixed(2),
            }}
          />
        )}
        {showExpense && (
          <Bar
            dataKey="expense"
            fill="red"
            name={t("expense")}
            label={{
              position: "top",
              formatter: (val) => Number(val).toFixed(2),
            }}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
