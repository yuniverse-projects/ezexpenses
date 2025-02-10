"use client";

import { useTranslation } from "react-i18next";

/**
 * 返回一个对象，用来覆盖 DataGrid 的默认文案
 */
export default function useMyDataGridLocaleText() {
  const { t } = useTranslation();

  return {
    noRowsLabel: t("noData"),
    columnMenuSortAsc: t("columnMenuSortAsc"),
    columnMenuSortDesc: t("columnMenuSortDesc"),
    columnMenuFilter: t("columnMenuFilter"),
    columnMenuHideColumn: t("columnMenuHideColumn"),
    columnMenuManageColumns: t("columnMenuManageColumns"),
    columnHeaderMenuTooltip: t("columnHeaderMenuTooltip"),
    filterPanelColumns: t("filterPanelColumns"),
    filterPanelOperator: t("filterPanelOperator"),
    filterPanelInputLabel: t("filterPanelInputLabel"),
    filterPanelInputPlaceholder: t("filterPanelInputPlaceholder"),
  };
}
