import "./Tabs.css";

import { FC, ReactNode, useMemo, useState } from "react";
import classNames from "classnames";

type Tab = {
  children: ReactNode;
  icon?: ReactNode;
  key: string;
  title: string;
};
type TabsProps = {
  tabs: Tab[];
}

const Tabs: FC<TabsProps> = ({ tabs }) => {
  const className = classNames("tabs", {});

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const currentTabComponent = useMemo(() => {
    const currentTab = tabs.find((tab) => tab.key === activeTab);
    return currentTab ? currentTab.children : "";
  }, [activeTab, tabs]);

  return (
    <div className={className}>
      <div className="tabs__options">
        {tabs.map((tab) => (
          <span
            className={`tabs__options_option${activeTab === tab.key ? ' tabs__options_option--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.title}
          </span>
        ))}
      </div>

      {currentTabComponent}
    </div>
  );
};

export default Tabs;
