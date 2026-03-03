import { MetaProvider, Title } from "@solidjs/meta";
import { Router, Route } from "@solidjs/router";
import { Suspense } from "solid-js";
import "./app.css";
import Home from "./routes/index";
import NotFound from "./routes/[...404]";

export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>SolidStart - Basic</Title>
          <a href="/">Index</a>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <Route path="/" component={Home} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
