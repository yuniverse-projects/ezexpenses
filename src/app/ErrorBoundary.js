import React from "react";
// 如果集成Sentry，需要先npm install @sentry/react @sentry/tracing
import * as Sentry from "@sentry/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error);
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>
          抱歉，页面出现错误，请稍后重试。
          <br />
          {/* 可以把具体报错信息也显示出来 */}
          {this.state.error && this.state.error.toString()}
        </h1>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
