import classNames from 'classnames';
import './Grid.css';

import { FC, ReactNode } from "react";

type GridProps = {
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode
}

const Grid: FC<GridProps> = ({ size = 'md', children }) => {
    const className = classNames("grid", {
        [`grid__size--${size}`]: true,
    });


    return <div className={className}>{children}</div>
}

export default Grid;