import { classNames } from "@/utils/classNames";

export function Card({ className, children, ...props }) {
  return <section className={classNames("surface rounded-2xl border border-default shadow-[var(--shadow-soft)]", className)} {...props}>{children}</section>;
}

export function CardHeader({ className, children }) {
  return <div className={classNames("flex items-start justify-between gap-4 border-b border-default px-5 py-4 sm:px-6", className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={classNames("p-5 sm:p-6", className)}>{children}</div>;
}
