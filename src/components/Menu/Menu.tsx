import "./Menu.css";

import { FC, ReactNode, useEffect, useRef, useState } from "react";
import classNames from "classnames";

export type MenuItem = {
  danger?: boolean;
  icon?: ReactNode;
  key: string;
  label: string;
  onClick: () => void;
};

type MenuProps = {
  icon: ReactNode;
  items: MenuItem[];
  label: string;
  variant?: "filled" | "ghost";
};

const Menu: FC<MenuProps> = ({ icon, items, label, variant = "filled" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="menu" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={label}
        className={classNames("menu__trigger", `menu__trigger--${variant}`)}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        {icon}
      </button>

      {isOpen && (
        <ul className="menu__dropdown" role="menu">
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                className={classNames("menu__item", {
                  "menu__item--danger": item.danger,
                })}
                role="menuitem"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Menu;
