// src/app/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    warning: {
      main: "#ff5722", // 橙色
      contrastText: "#fff", // 文字是白色
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

export default theme;
