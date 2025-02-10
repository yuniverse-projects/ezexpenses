"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  getAllRecords,
  deleteRecord,
  updateRecord,
} from "../lib/BookkeepingService";

// 拆分后的组件
import AddRecordForm from "./components/AddRecordForm";
import RecordTable from "./components/RecordTable";
import ImportDialog from "./components/ImportDialog";
import BulkEditDialog from "./components/BulkEditDialog";
import EditRecordDialog from "./components/EditRecordDialog";

export default function Page() {
  const { t } = useTranslation();

  // 全局记录数据
  const [records, setRecords] = useState([]);
  // 是否展示“导入数据”对话框
  const [importOpen, setImportOpen] = useState(false);

  // 选中的记录id（DataGrid选中）
  const [selectedIds, setSelectedIds] = useState([]);

  // 批量编辑对话框
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  // “整行编辑”对话框
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [recordBeingEdited, setRecordBeingEdited] = useState(null);

  // 用 ref 指向 AddRecordForm，便于点击“常用标签”时自动加到表单
  const addRecordFormRef = useRef(null);

  useEffect(() => {
    loadRecords();
  }, []);

  /** 从本地/后端加载记录 */
  function loadRecords() {
    const data = getAllRecords();
    setRecords(data);
  }

  /** 删除单条记录 */
  function handleDeleteRecord(id) {
    if (window.confirm(t("confirmDelete"))) {
      deleteRecord(id);
      loadRecords();
    }
  }

  /** 打开“整行编辑”对话框 */
  function handleOpenEditDialog(row) {
    setRecordBeingEdited(row);
    setEditDialogOpen(true);
  }

  /** 保存整行编辑 */
  function handleSaveEditedRecord(updated) {
    updateRecord(updated);
    loadRecords();
  }

  /** 关闭“整行编辑” */
  function handleCloseEditDialog() {
    setEditDialogOpen(false);
    setRecordBeingEdited(null);
  }

  /** 批量删除 */
  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(t("confirmDelete"))) return;
    selectedIds.forEach((id) => deleteRecord(id));
    setSelectedIds([]);
    loadRecords();
  }

  /** 打开批量编辑对话框 */
  function handleOpenBulkEdit() {
    if (selectedIds.length === 0) return;
    setBulkEditOpen(true);
  }

  /** 关闭批量编辑对话框 */
  function handleCloseBulkEdit() {
    setBulkEditOpen(false);
  }

  /**
   * 统计信息（本月/上月/最近一周 + 常用标签）
   */
  const {
    thisMonthExp,
    lastMonthExp,
    last7AvgExp,
    thisMonthInc,
    lastMonthInc,
    last7AvgInc,
    topTagsExp,
    topTagsInc,
  } = useMemo(() => {
    // 如果 records 不是数组 或 还没加载到，就先返回一组安全的默认值
    if (!Array.isArray(records) || records.length === 0) {
      return {
        thisMonthExp: 0,
        lastMonthExp: 0,
        last7AvgExp: 0,
        thisMonthInc: 0,
        lastMonthInc: 0,
        last7AvgInc: 0,
        topTagsExp: [],
        topTagsInc: [],
      };
    }

    // 如果你有 try/catch，也可以加在这里，防止统计中异常
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const monthStart = new Date(currentYear, currentMonth, 1);
      const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);

      const lastMonthVal = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthStart = new Date(lastMonthYear, lastMonthVal, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 1);

      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const isExpense = (r) => r.type === "expense";
      const isIncome = (r) => r.type === "income";

      // ---- 本月支出/收入 ----
      let thisMonthExpSum = 0;
      let thisMonthIncSum = 0;
      records.forEach((r) => {
        const d = new Date(r.date);
        if (d >= monthStart && d < nextMonthStart) {
          if (isExpense(r)) thisMonthExpSum += r.amount;
          else if (isIncome(r)) thisMonthIncSum += r.amount;
        }
      });

      // ---- 上月支出/收入 ----
      let lastMonthExpSum = 0;
      let lastMonthIncSum = 0;
      records.forEach((r) => {
        const d = new Date(r.date);
        if (d >= lastMonthStart && d < lastMonthEnd) {
          if (isExpense(r)) lastMonthExpSum += r.amount;
          else if (isIncome(r)) lastMonthIncSum += r.amount;
        }
      });

      // ---- 最近一周(7天)平均支出/收入 ----
      let sumExp7 = 0,
        countExp7 = 0;
      let sumInc7 = 0,
        countInc7 = 0;
      records.forEach((r) => {
        const d = new Date(r.date);
        if (d >= sevenDaysAgo && d <= now) {
          if (isExpense(r)) {
            sumExp7 += r.amount;
            countExp7++;
          } else if (isIncome(r)) {
            sumInc7 += r.amount;
            countInc7++;
          }
        }
      });
      const last7AvgExpVal = countExp7 > 0 ? sumExp7 / 7 : 0;
      const last7AvgIncVal = countInc7 > 0 ? sumInc7 / 7 : 0;

      // ---- 常用标签统计(支出/收入 分别取前5) ----
      const expenseTagStats = {};
      const incomeTagStats = {};
      records.forEach((r) => {
        if (!Array.isArray(r.tags)) return;
        if (isExpense(r)) {
          r.tags.forEach((tg) => {
            if (!expenseTagStats[tg]) expenseTagStats[tg] = 0;
            expenseTagStats[tg] += r.amount;
          });
        } else if (isIncome(r)) {
          r.tags.forEach((tg) => {
            if (!incomeTagStats[tg]) incomeTagStats[tg] = 0;
            incomeTagStats[tg] += r.amount;
          });
        }
      });

      // 排序取前5
      const topExp = Object.entries(expenseTagStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tg, total]) => ({ tg, total }));

      const topInc = Object.entries(incomeTagStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tg, total]) => ({ tg, total }));

      return {
        thisMonthExp: thisMonthExpSum,
        lastMonthExp: lastMonthExpSum,
        last7AvgExp: last7AvgExpVal,
        thisMonthInc: thisMonthIncSum,
        lastMonthInc: lastMonthIncSum,
        last7AvgInc: last7AvgIncVal,
        topTagsExp: topExp,
        topTagsInc: topInc,
      };
    } catch (err) {
      console.error("Error computing stats:", err);
      // 如果统计中出错，返回一组默认值
      return {
        thisMonthExp: 0,
        lastMonthExp: 0,
        last7AvgExp: 0,
        thisMonthInc: 0,
        lastMonthInc: 0,
        last7AvgInc: 0,
        topTagsExp: [],
        topTagsInc: [],
      };
    }
  }, [records]);

  return (
    <Box sx={{ backgroundColor: "#f7f9fc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* 顶部标题 */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {t("EZExpenses")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t("poweredBy")}
          </Typography>
        </Box>

        {/* 导入按钮 */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}
        >
          <Button variant="outlined" onClick={() => setImportOpen(true)}>
            {t("importData")}
          </Button>
        </Box>

        {/* 添加记录表单 */}
        <AddRecordForm ref={addRecordFormRef} onRecordsChange={loadRecords} />

        {/* 统计信息 */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            {/* --- 支出统计 --- */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              {t("expenseStats")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                p: 2,
                mb: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
              }}
            >
              <Box textAlign="center">
                <Typography variant="subtitle2">
                  {t("currentMonthExpense")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {thisMonthExp.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2">
                  {t("lastMonthExpense")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {lastMonthExp.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2">
                  {t("last7DaysAverageExpense")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {last7AvgExp.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* --- 收入统计 --- */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              {t("incomeStats")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                p: 2,
                mb: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
              }}
            >
              <Box textAlign="center">
                <Typography variant="subtitle2">
                  {t("currentMonthIncome")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {thisMonthInc.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2">
                  {t("lastMonthIncome")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {lastMonthInc.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2">
                  {t("last7DaysAverageIncome")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {last7AvgInc.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* --- 常用标签(支出/收入) --- */}
            {(topTagsExp.length > 0 || topTagsInc.length > 0) && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t("commonTags")}:
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1}>
                  {topTagsExp.map((item) => (
                    <Button
                      key={"exp-" + item.tg}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // 点击“常用标签” -> 调用AddRecordForm的 addTag()
                        addRecordFormRef.current?.addTag(item.tg);
                      }}
                    >
                      #{item.tg} (-{item.total.toFixed(2)})
                    </Button>
                  ))}
                  {topTagsInc.map((item) => (
                    <Button
                      key={"inc-" + item.tg}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        addRecordFormRef.current?.addTag(item.tg);
                      }}
                    >
                      #{item.tg} (+{item.total.toFixed(2)})
                    </Button>
                  ))}
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* 记录表格 + 操作按钮 */}
        <RecordTable
          records={records}
          onDeleteRecord={handleDeleteRecord}
          onOpenEditDialog={handleOpenEditDialog}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onBulkDelete={handleBulkDelete}
          onOpenBulkEdit={handleOpenBulkEdit}
        />
      </Container>

      {/* 导入数据对话框 */}
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={loadRecords}
      />

      {/* 批量编辑对话框 */}
      <BulkEditDialog
        open={bulkEditOpen}
        onClose={handleCloseBulkEdit}
        selectedIds={selectedIds}
        records={records}
        onRecordsUpdated={loadRecords}
        clearSelection={() => setSelectedIds([])}
      />

      {/* 单条编辑对话框 */}
      <EditRecordDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        record={recordBeingEdited}
        onSave={handleSaveEditedRecord}
      />
    </Box>
  );
}
