import { ReactNode, useState } from "react";

interface Props {
  content: string;
  children: ReactNode;
  placement?: "top" | "bottom";
}

export function Tooltip({ content, children, placement = "top" }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded shadow-lg whitespace-normal max-w-[220px] ${
            placement === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
              : "top-full left-1/2 -translate-x-1/2 mt-2"
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
