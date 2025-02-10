"use client";

import React, { useMemo } from "react";
import { Box, Button, Card, CardContent, Stack, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import CustomPagination from "./CustomPagination";
import useMyDataGridLocaleText from "./useMyDataGridLocaleText";
import * as XLSX from "xlsx";

/**
 * @param {object} props
 * @param {Array} props.records
 * @param {Function} props.onDeleteRecord
 * @param {Function} props.onOpenEditDialog
 * @param {Array} props.selectedIds
 * @param {Function} props.setSelectedIds
 * @param {Function} props.onBulkDelete
 * @param {Function} props.onOpenBulkEdit
 * @param {Function} [props.onTagClick] - 当点击记录里某个标签时触发
 */
export default function RecordTable({
  records = [],
  onDeleteRecord,
  onOpenEditDialog,
  selectedIds = [],
  setSelectedIds,
  onBulkDelete,
  onOpenBulkEdit,
  onTagClick, // 新增
}) {
  const { t } = useTranslation();
  const localeText = useMyDataGridLocaleText();

  // 导出 Excel
  function handleExportExcel() {
    const exportData = records.map((r) => ({
      type: r.type,
      amount: r.amount,
      date: r.date,
      tags: (r.tags || []).join(", "),
      note: r.note,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Records");
    XLSX.writeFile(wb, "Records.xlsx");
  }

  const columns = useMemo(() => {
    return [
      {
        field: "type",
        headerName: t("type"),
        width: 100,
        renderCell: (params) => {
          const val = params.value;
          return val === "income" ? t("income") : t("expense");
        },
      },
      {
        field: "amount",
        headerName: t("amount"),
        width: 120,
      },
      {
        field: "date",
        headerName: t("date"),
        width: 130,
      },
      {
        field: "tags",
        headerName: t("tag"),
        width: 200,
        sortable: false,
        renderCell: (params) => {
          const tagsArr = params.value || [];
          return (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {tagsArr.map((tg) => (
                <Chip
                  key={tg}
                  label={tg}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // 让表内的标签可点击 => 触发父组件的onTagClick以进行多标签筛选
                    if (onTagClick) {
                      onTagClick(tg);
                    }
                  }}
                />
              ))}
            </Box>
          );
        },
      },
      {
        field: "note",
        headerName: t("note"),
        flex: 1,
        sortable: false,
      },
      {
        field: "action",
        headerName: t("action"),
        width: 200,
        sortable: false,
        renderCell: (params) => {
          const row = params.row;
          return (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => onOpenEditDialog && onOpenEditDialog(row)}
              >
                {t("edit")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => onDeleteRecord && onDeleteRecord(row.id)}
              >
                {t("delete")}
              </Button>
            </Stack>
          );
        },
      },
    ];
  }, [t, onTagClick, onDeleteRecord, onOpenEditDialog]);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        {/* 批量操作 + 导出按钮 */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={handleExportExcel}>
            {t("exportExcel")}
          </Button>
          <Button
            variant="outlined"
            disabled={selectedIds.length === 0}
            onClick={onBulkDelete}
          >
            {t("bulkDelete")}
          </Button>
          <Button
            variant="outlined"
            disabled={selectedIds.length === 0}
            onClick={onOpenBulkEdit}
          >
            {t("bulkEdit")}
          </Button>
        </Stack>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={records}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={(ids) => {
              if (setSelectedIds) {
                setSelectedIds(ids);
              }
            }}
            disableRowSelectionOnClick
            pagination
            pageSizeOptions={[10, 50, 100]}
            localeText={localeText}
            slots={{
              pagination: CustomPagination,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
