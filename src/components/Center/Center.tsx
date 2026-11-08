import { FC, PropsWithChildren } from "react";
import './Center.css'

const Center: FC<PropsWithChildren> = ({ children }) => {
    return <div className="center">{children}</div>
}

export default Center;