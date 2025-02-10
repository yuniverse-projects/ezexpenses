"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { addRecord } from "../../lib/BookkeepingService";

// 2024年硬编码汇率(示例)
const currencyRates2024 = {
  USD: 1,
  CNY: 0.14,
  TWD: 0.032,
  EUR: 1.07,
  CHF: 1.12,
};

function parseTags(str) {
  const raw = str.split(/[\s,]+/).filter(Boolean);
  return raw.map((r) => (r.startsWith("#") ? r.slice(1) : r));
}

/**
 * 添加记录表单 (forwardRef), 让父组件用 addTag()
 */
function AddRecordForm({ onRecordsChange }, ref) {
  const { t } = useTranslation();

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState("");
  const [lastRecord, setLastRecord] = useState(null);

  const isComposing = useRef(false);

  useImperativeHandle(ref, () => ({
    addTag(tg) {
      if (!tg) return;
      if (!tags.includes(tg)) {
        setTags((prev) => [...prev, tg]);
      }
    },
  }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || !date) {
      alert(t("pleaseFillAll"));
      return;
    }
    const now = Date.now();
    const rate = currencyRates2024[currency] || 1;
    const numericAmt = parseFloat(amount);
    const converted = numericAmt * rate;

    const newRecord = {
      id: now,
      createdAt: now,
      updatedAt: now,
      type,
      amount: numericAmt,
      currency,
      convertedUSD: converted,
      date,
      tags: [...tags],
      note: note.trim(),
    };
    addRecord(newRecord);
    setLastRecord(newRecord);

    // 重置
    setAmount("");
    setDate("");
    setTagInput("");
    setTags([]);
    setNote("");

    onRecordsChange?.();
  }

  function handleTagKeyDown(e) {
    if (isComposing.current) return;
    if (["Enter", ",", " "].includes(e.key)) {
      e.preventDefault();
      const newTags = parseTags(e.target.value);
      setTags([...tags, ...newTags]);
      setTagInput("");
    }
  }

  function handleLoadLast() {
    if (!lastRecord) return;
    setType(lastRecord.type);
    setAmount(String(lastRecord.amount));
    setCurrency(lastRecord.currency);
    setDate(lastRecord.date);
    setTags([...lastRecord.tags]);
    setNote(lastRecord.note || "");
  }

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t("addRecord")}
        </Typography>

        {/* 整个表单：金额 + 币种 + 日期 + 标签输入 + 备注 + 提交按钮 */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          {/* 收/支类型 */}
          <FormControl>
            <RadioGroup
              row
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <FormControlLabel
                value="expense"
                control={<Radio />}
                label={t("expense")}
              />
              <FormControlLabel
                value="income"
                control={<Radio />}
                label={t("income")}
              />
            </RadioGroup>
          </FormControl>

          {/* 金额 */}
          <TextField
            type="number"
            label={t("amount")}
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ width: 120 }}
          />

          {/* 币种 */}
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel>{t("currency")}</InputLabel>
            <Select
              value={currency}
              label={t("currency")}
              onChange={(e) => setCurrency(e.target.value)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* 备注(加大宽度占一行 or 参考UI) */}
          <TextField
            label={t("note")}
            multiline
            rows={2}
            variant="outlined"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ flex: "1 1 200px", minWidth: 200 }}
          />

          {/* 提交按钮 */}
          <Button
            type="submit"
            variant="contained"
            sx={{ alignSelf: "center" }}
          >
            {t("addRecord")}
          </Button>

          {/* 加载上一次 */}
          {lastRecord && (
            <Button
              variant="outlined"
              onClick={handleLoadLast}
              sx={{ alignSelf: "center" }}
            >
              {t("loadLastRecord")}
            </Button>
          )}
        </Box>

        {/* 下面这一行专门放“标签输入框 + 已选标签” */}
        <Box sx={{ mt: 2 }}>
          {/* 标签输入 */}
          <TextField
            fullWidth
            label={t("tagsPlaceholder")}
            variant="outlined"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onCompositionStart={() => (isComposing.current = true)}
            onCompositionEnd={() => (isComposing.current = false)}
            onKeyDown={handleTagKeyDown}
          />
          {/* 已选标签 */}
          {tags.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              {tags.map((tg) => (
                <Chip
                  key={tg}
                  label={tg}
                  onDelete={() => setTags(tags.filter((x) => x !== tg))}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default forwardRef(AddRecordForm);
