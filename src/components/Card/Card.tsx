import { FC, ReactNode } from "react";
import './Card.css'

type CardProps = {
    children: ReactNode;
}

const Card: FC<CardProps> = ({ children }) => {
    return <div className="card">{children}</div>
}

export default Card;