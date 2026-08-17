import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  left?: ReactNode;
  meta?: string;
  children?: ReactNode;
}

export function NavBar({ left, meta, children }: Props) {
  return (
    <header className="masthead">
      {left}
      <div className="masthead-title">GitHub Copilot Certification</div>
      {meta && <div className="masthead-meta">{meta}</div>}
      {children}
      <nav className="tabs">
        <NavLink to="/course">Paper</NavLink>
        <NavLink to="/quiz">Questions</NavLink>
      </nav>
    </header>
  );
}
