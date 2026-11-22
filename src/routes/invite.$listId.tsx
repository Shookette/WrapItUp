import "./invite.css";

import { useState } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { IconArrowRight, IconGift, IconLock } from "@tabler/icons-react";
import { getListByID, joinList } from "#/repository/ListRepository.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { plural } from "#/utils/plural.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import Button from "#/components/Button/Button.tsx";
import { buttonClassNames } from "#/components/Button/buttonClassNames.ts";
import LogoUrl from "#/assets/logo.svg";

export const Route = createFileRoute("/invite/$listId")({
  component: InviteComponent,
  loader: ({ context, params: { listId } }) =>
    context.auth?.isAuthenticated ? getListByID(listId) : null,
});

function InviteComponent() {
  const list = Route.useLoaderData();
  const { listId } = Route.useParams();
  const { user } = useUserContext();
  const toast = useToast();
  const navigate = Route.useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const redirect = `/invite/${listId}`;

  if (user && list?.userUID === user.uid) {
    return <Navigate params={{ listId }} to="/edit/$listId" />;
  }
  if (user && list?.allowedUsers.some(({ userUID }) => userUID === user.uid)) {
    return <Navigate params={{ listId }} to="/list/$listId" />;
  }

  const join = async () => {
    if (!user) {
      return;
    }
    setIsJoining(true);
    try {
      await joinList(listId, user.uid);
      toast.show({
        type: "success",
        message: `Vous avez rejoint « ${list?.title} »`,
      });
      await navigate({ to: "/list/$listId", params: { listId } });
    } catch (error: unknown) {
      console.error("rejoindre la liste :", error);
      toast.show({
        type: "danger",
        message: "La liste n'a pas pu être rejointe, veuillez réessayer",
      });
      setIsJoining(false);
    }
  };

  const owner = list?.username ?? "Un·e proche";

  return (
    <div className="invite">
      <header className="invite__header">
        <img alt="" className="invite__logo" src={LogoUrl} />
        Wrap It Up
      </header>

      <main className="invite__main">
        <span aria-hidden className="invite__picture">
          <IconGift size={80} stroke={1.4} />
        </span>

        {!user ? (
          <>
            <div className="invite__heading">
              <h1 className="invite__title">Vous avez reçu une invitation</h1>
              <p className="invite__text">
                Connectez-vous ou créez un compte pour découvrir la liste de
                cadeaux et réserver ceux que vous offrirez.
              </p>
            </div>
            <SecretNote owner="La personne qui vous invite" />
            <div className="invite__actions">
              <Link
                className={buttonClassNames({ fullWidth: true, size: "large" })}
                search={{ redirect }}
                to="/login"
              >
                Se connecter
              </Link>
              <Link
                className={buttonClassNames({
                  fullWidth: true,
                  type: "secondary",
                })}
                search={{ redirect }}
                to="/register"
              >
                Créer un compte
              </Link>
            </div>
          </>
        ) : !list ? (
          <div className="invite__heading">
            <h1 className="invite__title">Liste introuvable</h1>
            <p className="invite__text">
              Le lien est peut-être incomplet, ou la liste a été supprimée.
              Demandez un nouveau lien à la personne qui vous l'a envoyé.
            </p>
            <Link className={buttonClassNames({ fullWidth: true })} to="/">
              Revenir à mes listes
            </Link>
          </div>
        ) : (
          <>
            <div className="invite__heading">
              <p className="invite__text">
                <strong>{owner}</strong> vous invite à rejoindre
              </p>
              <h1 className="invite__title">{list.title}</h1>
              <p className="invite__text">
                {plural(list.presents?.length ?? 0, "cadeau", "cadeaux")} à
                découvrir et à réserver
              </p>
            </div>
            <SecretNote owner={owner} />
            <div className="invite__actions">
              <Button fullWidth loading={isJoining} size="large" onClick={join}>
                Rejoindre la liste
                <IconArrowRight aria-hidden size={20} />
              </Button>
              <p className="invite__signed-in">
                Connecté·e en tant que {user.email}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SecretNote({ owner }: { owner: string }) {
  return (
    <p className="invite__secret">
      <IconLock aria-hidden className="invite__secret-icon" size={20} />
      {owner} ne verra jamais ce que vous réservez. Les autres invité·es verront
      seulement qu'un cadeau est pris.
    </p>
  );
}
