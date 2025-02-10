"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import * as XLSX from "xlsx";

// 若你的 BookkeepingService 路径不同，请自行修改
import {
  addRecord,
  getAllTagsPool,
  addTagsToPool,
} from "../../lib/BookkeepingService";

/**
 * 用于 Excel 日期单元格兼容：
 * - 如果是数字(Excel日期)，解析为 YYYY-MM-DD
 * - 如果是YYYY-MM-DD字符串，返回原格式
 */
function parseExcelDate(rowDate) {
  if (typeof rowDate === "number") {
    const dateObj = XLSX.SSF.parse_date_code(rowDate);
    const yyyy = dateObj.y.toString().padStart(4, "0");
    const mm = dateObj.m.toString().padStart(2, "0");
    const dd = dateObj.d.toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } else if (typeof rowDate === "string") {
    const str = rowDate.trim();
    // 简单判断是否是 YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    return null;
  }
  return null;
}

/**
 * 批量添加新的标签到标签池(避免重复)
 */
function updateTagsPoolWithNewTags(newTagsArr) {
  if (!newTagsArr || newTagsArr.length === 0) return;
  const currentPool = getAllTagsPool();
  const uniqueNewTags = [...new Set(newTagsArr)];
  const toAdd = uniqueNewTags.filter((tg) => !currentPool.includes(tg));
  if (toAdd.length > 0) {
    addTagsToPool(toAdd);
  }
}

/**
 * ImportDialog 组件
 * @param {Object} props
 * @param {boolean} props.open - 是否打开对话框
 * @param {Function} props.onClose - 关闭对话框
 * @param {Function} props.onImported - 导入完成后通知父组件(可刷新数据)
 */
export default function ImportDialog({ open, onClose, onImported }) {
  const [importFile, setImportFile] = useState(null);

  // 用于在导入完成后显示提示
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [importResult, setImportResult] = useState({
    success: false,
    error: "",
  });

  function handleFileChange(e) {
    setImportFile(e.target.files[0]);
  }

  function handleCloseSnackbar() {
    setSnackbarOpen(false);
  }

  function handleCloseDialog() {
    // 关闭对话框前，可以把文件state置空，防止下次进来还保留
    setImportFile(null);
    onClose?.();
  }

  /**
   * 核心导入逻辑:
   * 1. 解析 Excel
   * 2. 校验字段 (type, amount, date, tags, note)
   * 3. addRecord
   * 4. 更新标签池
   * 5. 显示结果 & 通知父组件刷新
   */
  function handleImport() {
    if (!importFile) {
      alert("请先选择文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // 以二维数组方式读取, header:1 表示第一行是表头
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!jsonData || jsonData.length <= 1) {
          setImportResult({ success: false, error: "空文件或格式错误" });
          setSnackbarOpen(true);
          return;
        }

        // 取表头
        const header = jsonData[0];
        const typeIdx = header.indexOf("type");
        const amountIdx = header.indexOf("amount");
        const dateIdx = header.indexOf("date");
        const tagsIdx = header.indexOf("tags");
        const noteIdx = header.indexOf("note");
        if (
          typeIdx === -1 ||
          amountIdx === -1 ||
          dateIdx === -1 ||
          tagsIdx === -1 ||
          noteIdx === -1
        ) {
          setImportResult({
            success: false,
            error: "模板字段不完整(type,amount,date,tags,note)",
          });
          setSnackbarOpen(true);
          return;
        }

        let failCount = 0;
        let newTagsArr = [];

        // 从第二行开始读取
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue; // 跳过空行

          const rowType = (row[typeIdx] || "").toString().trim();
          const rowAmount = row[amountIdx];
          const rawDate = row[dateIdx];
          const rowDate = parseExcelDate(rawDate) || "";
          const rowTagsStr = (row[tagsIdx] || "").toString().trim();
          const rowNote = (row[noteIdx] || "").toString().trim();

          // 校验必填
          if (!rowType || !rowAmount || !rowDate) {
            failCount++;
            continue;
          }
          // 进一步校验
          const parsedAmount = parseFloat(rowAmount);
          if (
            (rowType !== "income" && rowType !== "expense") ||
            isNaN(parsedAmount)
          ) {
            failCount++;
            continue;
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(rowDate)) {
            failCount++;
            continue;
          }

          // 解析标签
          const theseTags = rowTagsStr
            ? rowTagsStr
                .split(/[\s,]+/)
                .map((tg) => (tg.startsWith("#") ? tg.slice(1) : tg))
            : [];

          // 组装记录
          const record = {
            id: Date.now() + Math.floor(Math.random() * 100000), // 简易唯一ID
            createdAt: Date.now(),
            updatedAt: Date.now(),
            type: rowType,
            amount: parsedAmount,
            date: rowDate,
            tags: theseTags,
            note: rowNote,
          };
          addRecord(record);
          newTagsArr.push(...theseTags);
        }

        // 更新标签池
        updateTagsPoolWithNewTags(newTagsArr);

        // 导入完毕 => 结果
        if (failCount === 0) {
          setImportResult({ success: true, error: "" });
        } else {
          setImportResult({
            success: false,
            error: `有 ${failCount} 行数据导入失败`,
          });
        }
        setSnackbarOpen(true);

        // 通知父组件刷新(若需要父组件加载最新记录)
        onImported?.();

        // 关闭对话框
        handleCloseDialog();
      } catch (err) {
        console.error(err);
        setImportResult({ success: false, error: err.message });
        setSnackbarOpen(true);
      }
    };
    // 读取文件为 array buffer
    reader.readAsArrayBuffer(importFile);
  }

  return (
    <>
      {/* 对话框本体 */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>导入数据</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            请上传包含 type,amount,date,tags,note 的Excel文件
          </Typography>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            style={{ marginTop: "16px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button variant="contained" onClick={handleImport}>
            确认导入
          </Button>
        </DialogActions>
      </Dialog>

      {/* 导入完成后的小提示(成功或失败) */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        {importResult.success ? (
          <Alert severity="success" onClose={handleCloseSnackbar}>
            导入成功
          </Alert>
        ) : (
          <Alert severity="error" onClose={handleCloseSnackbar}>
            {importResult.error || "导入失败"}
          </Alert>
        )}
      </Snackbar>
    </>
  );
}
