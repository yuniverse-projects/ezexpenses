"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";

function parseTags(str) {
  const raw = str.split(/[\s,]+/).filter(Boolean);
  return raw.map((r) => (r.startsWith("#") ? r.slice(1) : r));
}

// 同样的汇率，也可从一个共享文件中import
const currencyRates2024 = {
  USD: 1,
  CNY: 0.14,
  TWD: 0.032,
  EUR: 1.07,
  CHF: 1.12,
};

export default function EditRecordDialog({ open, onClose, record, onSave }) {
  const { t } = useTranslation();

  const [editType, setEditType] = useState("expense");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editDate, setEditDate] = useState("");
  const [editTagInput, setEditTagInput] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [editNote, setEditNote] = useState("");

  const isComposingEdit = useRef(false);

  // 当对话框打开、且有record时，初始化
  useEffect(() => {
    if (record && open) {
      setEditType(record.type);
      setEditAmount(String(record.amount));
      setEditCurrency(record.currency || "USD");
      setEditDate(record.date);
      setEditTags([...record.tags]);
      setEditTagInput("");
      setEditNote(record.note || "");
    }
  }, [record, open]);

  function handleCloseDialog(save) {
    if (save && record) {
      const now = Date.now();
      // 重新计算USD
      const rate = currencyRates2024[editCurrency] || 1;
      const numericAmt = parseFloat(editAmount) || 0;
      const converted = numericAmt * rate;

      const updated = {
        ...record,
        type: editType,
        amount: numericAmt,
        currency: editCurrency,
        convertedUSD: converted,
        date: editDate,
        tags: [...editTags],
        note: editNote.trim(),
        updatedAt: now,
      };
      onSave?.(updated);
    }
    onClose?.();
  }

  function handleEditTagKeyDown(e) {
    if (isComposingEdit.current) return;
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      const newTags = parseTags(e.target.value);
      setEditTags((prev) => [...prev, ...newTags]);
      setEditTagInput("");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => handleCloseDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t("editRecord")}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 类型 */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>{t("type")}</InputLabel>
          <Select
            value={editType}
            label={t("type")}
            onChange={(e) => setEditType(e.target.value)}
          >
            <MenuItem value="expense">{t("expense")}</MenuItem>
            <MenuItem value="income">{t("income")}</MenuItem>
          </Select>
        </FormControl>

        {/* 金额 */}
        <TextField
          type="number"
          label={t("amount")}
          variant="outlined"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
        />

        {/* 币种 */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>{t("currency")}</InputLabel>
          <Select
            value={editCurrency}
            label={t("currency")}
            onChange={(e) => setEditCurrency(e.target.value)}
          >
            {Object.keys(currencyRates2024).map((cur) => (
              <MenuItem key={cur} value={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 日期 */}
        <TextField
          type="date"
          label={t("date")}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
        />

        {/* 标签 */}
        <Box>
          <TextField
            label={t("tagsPlaceholder")}
            variant="outlined"
            value={editTagInput}
            onChange={(e) => setEditTagInput(e.target.value)}
            onCompositionStart={() => {
              isComposingEdit.current = true;
            }}
            onCompositionEnd={() => {
              isComposingEdit.current = false;
            }}
            onKeyDown={handleEditTagKeyDown}
          />
          {editTags.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {editTags.map((tg) => (
                <Chip
                  key={tg}
                  label={tg}
                  onDelete={() =>
                    setEditTags(editTags.filter((tt) => tt !== tg))
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
          multiline
          rows={3}
          variant="outlined"
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleCloseDialog(false)}>{t("cancel")}</Button>
        <Button variant="contained" onClick={() => handleCloseDialog(true)}>
          {t("saveChanges")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
