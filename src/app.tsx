import { MetaProvider, Title } from "@solidjs/meta";
import { Router, Route } from "@solidjs/router";
import { Suspense } from "solid-js";
import "./app.css";
import Home from "./routes/index";
import NotFound from "./routes/[...404]";
import DateTool from "./routes/date-tool";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <nav>
            <a href="/">首页</a>
            <a href="/date-tool">日期工具</a>
          </nav>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <Route path="/" component={Home} />
      <Route path="/date-tool" component={DateTool} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
