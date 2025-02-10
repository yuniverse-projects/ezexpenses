"use client";
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { updateRecord } from "../../lib/BookkeepingService";

/** 简单的标签解析: 以空格、逗号分隔，并去掉 '#' 前缀 */
function parseTags(str) {
  const raw = str.split(/[\s,]+/).filter(Boolean);
  return raw.map((r) => (r.startsWith("#") ? r.slice(1) : r));
}

// 例示一些常用币种(可自行增减)
const currencyOptions = ["USD", "CNY", "TWD", "EUR", "CHF"];

export default function BulkEditDialog({
  open,
  onClose,
  selectedIds,
  records,
  onRecordsUpdated,
  clearSelection,
}) {
  const { t } = useTranslation();

  // 这里的状态只在对话框中使用
  const [bulkEditType, setBulkEditType] = useState("");
  const [bulkEditAmount, setBulkEditAmount] = useState("");
  const [bulkEditCurrency, setBulkEditCurrency] = useState(""); // 新增: 批量修改的币种
  const [bulkEditDate, setBulkEditDate] = useState(null);
  const [bulkEditTagInput, setBulkEditTagInput] = useState("");
  const [bulkEditTags, setBulkEditTags] = useState([]);
  const [bulkEditNote, setBulkEditNote] = useState("");

  const isComposingBulk = useRef(false);

  function handleBulkEditTagsKeyDown(e) {
    if (isComposingBulk.current) return;
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      const newTags = parseTags(e.target.value);
      setBulkEditTags((prev) => [...prev, ...newTags]);
      setBulkEditTagInput("");
    }
  }

  function handleSaveBulkEdit() {
    if (!selectedIds || selectedIds.length === 0) return;
    const now = Date.now();
    // 只有用户填写了(或选择了)的字段才会更新
    const updates = {};

    if (bulkEditType) updates.type = bulkEditType;
    if (bulkEditAmount) updates.amount = parseFloat(bulkEditAmount);
    if (bulkEditCurrency) updates.currency = bulkEditCurrency; // 如果不为空 => 更新
    if (bulkEditDate) {
      const y = bulkEditDate.getFullYear();
      const m = String(bulkEditDate.getMonth() + 1).padStart(2, "0");
      const d = String(bulkEditDate.getDate()).padStart(2, "0");
      updates.date = `${y}-${m}-${d}`;
    }
    if (bulkEditTags.length > 0) {
      updates.tags = bulkEditTags;
    }
    if (bulkEditNote.trim()) {
      updates.note = bulkEditNote.trim();
    }

    selectedIds.forEach((id) => {
      const rec = records.find((r) => r.id === id);
      if (rec) {
        const updated = { ...rec, ...updates, updatedAt: now };
        updateRecord(updated);
      }
    });

    // 通知父层刷新、清空选中
    onRecordsUpdated?.();
    clearSelection?.();

    // 关闭对话框
    handleClose();
  }

  function handleClose() {
    onClose?.();
    // 重置输入
    setBulkEditType("");
    setBulkEditAmount("");
    setBulkEditCurrency(""); // 重置币种
    setBulkEditDate(null);
    setBulkEditTagInput("");
    setBulkEditTags([]);
    setBulkEditNote("");
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("bulkEdit")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 类型 */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>{t("type")}</InputLabel>
          <Select
            value={bulkEditType}
            label={t("type")}
            onChange={(e) => setBulkEditType(e.target.value)}
          >
            <MenuItem value="">{t("noChange")}</MenuItem>
            <MenuItem value="expense">{t("expense")}</MenuItem>
            <MenuItem value="income">{t("income")}</MenuItem>
          </Select>
        </FormControl>

        {/* 金额 */}
        <TextField
          type="number"
          label={t("amount")}
          variant="outlined"
          placeholder={t("noChange")}
          value={bulkEditAmount}
          onChange={(e) => setBulkEditAmount(e.target.value)}
        />

        {/* 币种 (新增) */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>{t("currency")}</InputLabel>
          <Select
            value={bulkEditCurrency}
            label={t("currency")}
            onChange={(e) => setBulkEditCurrency(e.target.value)}
          >
            {/* 留空 => 不修改 */}
            <MenuItem value="">{t("noChange")}</MenuItem>
            {currencyOptions.map((cur) => (
              <MenuItem key={cur} value={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 日期 */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={t("date")}
            value={bulkEditDate}
            onChange={(newValue) => setBulkEditDate(newValue)}
          />
        </LocalizationProvider>

        {/* 标签输入 */}
        <Box>
          <TextField
            label={t("tagsPlaceholder")}
            variant="outlined"
            placeholder={t("noChange")}
            value={bulkEditTagInput}
            onChange={(e) => setBulkEditTagInput(e.target.value)}
            onCompositionStart={() => {
              isComposingBulk.current = true;
            }}
            onCompositionEnd={() => {
              isComposingBulk.current = false;
              setBulkEditTagInput(e.target.value);
            }}
            onKeyDown={handleBulkEditTagsKeyDown}
          />
          {bulkEditTags.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {bulkEditTags.map((tg) => (
                <Chip
                  key={tg}
                  label={tg}
                  onDelete={() =>
                    setBulkEditTags(bulkEditTags.filter((tt) => tt !== tg))
                  }
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          )}
        </Box>

        {/* 备注 */}
        <TextField
          label={t("note")}
          placeholder={t("noChange")}
          multiline
          rows={3}
          variant="outlined"
          value={bulkEditNote}
          onChange={(e) => setBulkEditNote(e.target.value)}
        />

        <Typography variant="body2" color="text.secondary">
          {t("bulkEditDesc")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button variant="contained" onClick={handleSaveBulkEdit}>
          {t("saveChanges")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
