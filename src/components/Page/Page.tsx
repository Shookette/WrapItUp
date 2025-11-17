import classNames from "classnames";
import { FC, ReactNode } from "react";
import './Page.css'

type PageProps = {
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const Page: FC<PageProps> = ({ children, size = 'md' }) => {
    const className = classNames("card", {
        [`card__size--${size}`]: true,
    });

    return <div className={className}>{children}</div>
}

export default Page;