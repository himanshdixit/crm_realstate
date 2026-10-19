import { FiInbox } from "react-icons/fi";

export function EmptyState({ icon: Icon = FiInbox, title, description, action }) {
  return (
    <div className="grid min-h-56 place-items-center px-5 py-10 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800"><Icon size={22} /></span>
        <h3 className="mt-4 font-bold">{title}</h3>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
