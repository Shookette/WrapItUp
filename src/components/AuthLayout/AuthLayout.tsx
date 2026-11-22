import "./AuthLayout.css";

import { FC, PropsWithChildren, ReactNode } from "react";
import { IconGift } from "@tabler/icons-react";

type AuthLayoutProps = PropsWithChildren<{
  footer?: ReactNode;
  title: string;
}>;

const AuthLayout: FC<AuthLayoutProps> = ({ children, footer, title }) => (
  <div className="auth-layout">
    <header className="auth-layout__banner">
      <div className="auth-layout__banner-content">
        <span aria-hidden className="auth-layout__logo">
          <IconGift size={30} stroke={1.8} />
        </span>
        <p className="auth-layout__name">Wrap It Up !</p>
        <p className="auth-layout__tagline">
          Des listes de cadeaux à partager, sans gâcher la surprise.
        </p>
      </div>
    </header>

    <main className="auth-layout__main">
      <section aria-labelledby="auth-title" className="auth-layout__card">
        <h1 className="auth-layout__title" id="auth-title">
          {title}
        </h1>
        {children}
      </section>
      {footer && <p className="auth-layout__footer">{footer}</p>}
    </main>
  </div>
);

export default AuthLayout;
