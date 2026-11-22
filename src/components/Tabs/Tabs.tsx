import "./Tabs.css";

import { FC, KeyboardEvent, ReactNode, useId, useRef, useState } from "react";
import classNames from "classnames";

type Tab = {
  children: ReactNode;
  danger?: boolean;
  icon?: ReactNode;
  key: string;
  shortTitle?: string;
  title: string;
};

type TabsProps = {
  label: string;
  tabs: Tab[];
};

const Tabs: FC<TabsProps> = ({ label, tabs }) => {
  const id = useId();
  const [activeKey, setActiveKey] = useState(tabs[0].key);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  const focusTab = (index: number) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    setActiveKey(tab.key);
    tabRefs.current[tab.key]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const moves: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      End: tabs.length - 1,
      Home: 0,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusTab(moves[event.key]);
    }
  };

  return (
    <div className="tabs">
      <div aria-label={label} className="tabs__list" role="tablist">
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeTab.key;
          return (
            <button
              aria-controls={`${id}-panel-${tab.key}`}
              aria-selected={isActive}
              className={classNames("tabs__tab", {
                "tabs__tab--active": isActive,
                "tabs__tab--danger": tab.danger,
              })}
              id={`${id}-tab-${tab.key}`}
              key={tab.key}
              ref={(element) => {
                tabRefs.current[tab.key] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => setActiveKey(tab.key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.icon}
              {tab.shortTitle ? (
                <>
                  <span className="tabs__title--long">{tab.title}</span>
                  <span className="tabs__title--short">{tab.shortTitle}</span>
                </>
              ) : (
                tab.title
              )}
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`${id}-tab-${activeTab.key}`}
        className="tabs__panel"
        id={`${id}-panel-${activeTab.key}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab.children}
      </div>
    </div>
  );
};

export default Tabs;
