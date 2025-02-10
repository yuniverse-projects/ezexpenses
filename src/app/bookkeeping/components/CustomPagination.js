"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGridApiContext,
  useGridSelector,
  GridPagination,
} from "@mui/x-data-grid";
import { gridPageSelector, gridPageCountSelector } from "@mui/x-data-grid";
import { Stack, Button, TextField } from "@mui/material";

/**
 * 自定义 DataGrid 分页组件
 */
export default function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector); // 当前页(0-based)
  const pageCount = useGridSelector(apiRef, gridPageCountSelector); // 总页数

  const { t } = useTranslation();
  const [gotoInput, setGotoInput] = useState(page + 1);

  function handleFirstPage() {
    apiRef.current.setPage(0);
    setGotoInput(1);
  }
  function handleLastPage() {
    apiRef.current.setPage(pageCount - 1);
    setGotoInput(pageCount);
  }
  function handlePrevPage() {
    if (page > 0) {
      apiRef.current.setPage(page - 1);
      setGotoInput(gotoInput - 1);
    }
  }
  function handleNextPage() {
    if (page < pageCount - 1) {
      apiRef.current.setPage(page + 1);
      setGotoInput(gotoInput + 1);
    }
  }
  function handleGoto() {
    let val = parseInt(gotoInput, 10);
    if (!isNaN(val)) {
      val = Math.max(1, Math.min(val, pageCount));
      apiRef.current.setPage(val - 1);
      setGotoInput(val);
    }
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleFirstPage}
        disabled={page === 0}
      >
        {t("firstPage")}
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={handlePrevPage}
        disabled={page === 0}
      >
        {t("prevPage")}
      </Button>

      {/* 这里使用 DataGrid 自带的小分页组件 */}
      <GridPagination rowsPerPageOptions={[10, 50, 100]} />

      <Button
        variant="outlined"
        size="small"
        onClick={handleNextPage}
        disabled={page >= pageCount - 1}
      >
        {t("nextPage")}
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={handleLastPage}
        disabled={page >= pageCount - 1}
      >
        {t("lastPage")}
      </Button>

      <TextField
        size="small"
        type="number"
        value={gotoInput}
        onChange={(e) => setGotoInput(e.target.value)}
        placeholder={t("gotoPagePlaceholder")}
        sx={{ width: 80 }}
      />
      <Button variant="outlined" size="small" onClick={handleGoto}>
        {t("gotoPage")}
      </Button>
    </Stack>
  );
}
