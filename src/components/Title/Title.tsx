import './Title.css'

import { FC, PropsWithChildren } from "react";

const Title: FC<PropsWithChildren> = ({ children }) => {
    return <h2 className="title">{children}</h2>
}

export default Title;
