import "./list.css";

import { useState } from "react";
import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import {
  IconCheck,
  IconExternalLink,
  IconGift,
  IconLogout2,
  IconX,
} from "@tabler/icons-react";
import classNames from "classnames";
import {
  getListByID,
  leaveList,
  updateList,
} from "#/repository/ListRepository.ts";
import { Present } from "#/interfaces/Present.ts";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { isHttpUrl } from "#/utils/url.ts";
import {
  cancelReservation,
  countByState,
  presentState,
  ReservationError,
  reservePresent,
} from "#/utils/presents.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useToast } from "#/components/Toast/toastContext.ts";
import { useConfirm } from "#/components/Confirm/confirmContext.ts";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Badge from "#/components/Badge/Badge.tsx";
import Button from "#/components/Button/Button.tsx";
import EmptyState from "#/components/EmptyState/EmptyState.tsx";
import Title from "#/components/Title/Title.tsx";

const filterKeys = ["all", "available", "mine"] as const;
type Filter = (typeof filterKeys)[number];

const listSearchSchema = z.object({
  filter: z.enum(filterKeys).optional().catch(undefined),
});

const emptyMessages: Record<Filter, { title: string; text: string }> = {
  all: {
    title: "Aucun cadeau pour l'instant",
    text: "La liste est encore vide : revenez un peu plus tard.",
  },
  available: {
    title: "Plus aucun cadeau disponible",
    text: "Tous les cadeaux de la liste sont déjà réservés.",
  },
  mine: {
    title: "Aucune réservation",
    text: "Les cadeaux que vous réservez apparaîtront ici.",
  },
};

const reservationErrors: Record<ReservationError["reason"], string> = {
  missing: "Ce cadeau a été retiré de la liste entre-temps",
  taken: "Ce cadeau vient d'être réservé par quelqu'un d'autre",
  "not-mine": "Cette réservation n'est plus la vôtre",
};

export const Route = createFileRoute("/list/$listId")({
  component: ViewComponent,
  validateSearch: listSearchSchema,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function ViewComponent() {
  const list = Route.useLoaderData();
  const { filter = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const { user } = useUserContext();
  const toast = useToast();
  const confirm = useConfirm();
  const [pendingPresentId, setPendingPresentId] = useState<string>();
  const [isLeaving, setIsLeaving] = useState(false);

  const uid = user?.uid;

  if (
    !list ||
    !uid ||
    !list.allowedUsers.some(({ userUID }) => userUID === uid)
  ) {
    return <Navigate to="/" />;
  }

  const presents = list.presents ?? [];
  const counts = countByState(presents, uid);
  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Tous", count: presents.length },
    { key: "available", label: "Disponibles", count: counts.available },
    { key: "mine", label: "Mes réservations", count: counts.mine },
  ];
  const visiblePresents = presents.filter(
    (present) => filter === "all" || presentState(present, uid) === filter,
  );

  const changeReservation = async (present: Present, reserve: boolean) => {
    setPendingPresentId(present.id);
    try {
      await updateList(list.id, (current) => ({
        ...current,
        presents: (reserve ? reservePresent : cancelReservation)(
          current.presents ?? [],
          present.id,
          uid,
        ),
      }));
      toast.show({
        type: "success",
        message: reserve
          ? `Vous avez réservé « ${present.title} »`
          : `Réservation de « ${present.title} » annulée`,
      });
    } catch (error: unknown) {
      console.error("réservation :", error);
      toast.show({
        type: "danger",
        message:
          error instanceof ReservationError
            ? reservationErrors[error.reason]
            : "La réservation n'a pas pu être enregistrée, veuillez réessayer",
      });
    } finally {
      await router.invalidate();
      setPendingPresentId(undefined);
    }
  };

  const handleLeave = async () => {
    const confirmed = await confirm({
      title: `Quitter « ${list.title} » ?`,
      message:
        "Elle n'apparaîtra plus dans vos invitations. Pour la rejoindre à nouveau, il faudra le lien d'invitation.",
      confirmLabel: "Quitter la liste",
    });
    if (!confirmed) {
      return;
    }

    setIsLeaving(true);
    try {
      await leaveList(list.id, uid);
      toast.show({
        type: "success",
        message: `Vous avez quitté la liste « ${list.title} »`,
      });
      await navigate({ to: "/lists" });
    } catch (error: unknown) {
      console.error("erreur en quittant la liste :", error);
      toast.show({
        type: "danger",
        message: "La liste n'a pas pu être quittée, veuillez réessayer",
      });
      setIsLeaving(false);
    }
  };

  return (
    <PrivateLayout back={{ label: "Invitations", to: "/lists" }}>
      <Title
        actions={
          <Button
            ariaLabel="Quitter la liste"
            icon={<IconLogout2 size={22} />}
            loading={isLeaving}
            type="danger"
            onClick={handleLeave}
          />
        }
        subtitle={`Liste de ${list.username ?? "…"}`}
        variant="page"
      >
        {list.title}
      </Title>

      <div
        aria-label="Filtrer les cadeaux"
        className="list-filters"
        role="group"
      >
        {filters.map(({ key, label, count }) => (
          <button
            aria-pressed={filter === key}
            className="list-filters__filter"
            key={key}
            type="button"
            onClick={() =>
              navigate({
                replace: true,
                search: { filter: key === "all" ? undefined : key },
              })
            }
          >
            {label} · {count}
          </button>
        ))}
      </div>

      {visiblePresents.length === 0 ? (
        <EmptyState
          icon={<IconGift size={32} stroke={1.75} />}
          title={emptyMessages[filter].title}
        >
          {emptyMessages[filter].text}
        </EmptyState>
      ) : (
        <ul className="list-view">
          {visiblePresents.map((present) => {
            const state = presentState(present, uid);
            const isPending = pendingPresentId === present.id;
            return (
              <li
                className={classNames("present-card", {
                  "present-card--taken": state === "taken",
                })}
                key={present.id}
              >
                <div>
                  <h2 className="present-card__title">{present.title}</h2>
                  {present.description && (
                    <p className="present-card__description">
                      {present.description}
                    </p>
                  )}
                </div>
                <div className="present-card__footer">
                  {isHttpUrl(present.url) ? (
                    <a
                      className="present-card__link"
                      href={present.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <IconExternalLink aria-hidden size={16} />
                      Voir le cadeau
                    </a>
                  ) : (
                    <span />
                  )}

                  {state === "available" && (
                    <Button
                      loading={isPending}
                      size="small"
                      onClick={() => changeReservation(present, true)}
                    >
                      Réserver
                    </Button>
                  )}
                  {state === "mine" && (
                    <div className="present-card__reserved">
                      <Badge icon={<IconCheck size={16} />} type="success">
                        Réservé par vous
                      </Badge>
                      <Button
                        ariaLabel={`Annuler la réservation de ${present.title}`}
                        icon={<IconX size={20} />}
                        loading={isPending}
                        type="secondary"
                        onClick={() => changeReservation(present, false)}
                      />
                    </div>
                  )}
                  {state === "taken" && (
                    <Badge type="neutral">Déjà réservé</Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PrivateLayout>
  );
}
