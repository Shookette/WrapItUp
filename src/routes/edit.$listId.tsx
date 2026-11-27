import "./edit.css";

import { useRef, useState } from "react";
import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { revalidateLogic } from "@tanstack/react-form";
import { z } from "zod";
import {
  IconExclamationCircle,
  IconGift,
  IconPencil,
  IconPlus,
  IconShare,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";

import {
  deleteList,
  getListByID,
  updateList,
} from "#/repository/ListRepository.ts";
import { List } from "#/interfaces/List.ts";
import { Present } from "#/interfaces/Present.ts";
import { useUserContext } from "#/hooks/UserContext.tsx";
import { useAppForm } from "#/hooks/useAppForm.ts";
import { useIsDesktop } from "#/hooks/useMediaQuery.ts";
import { isAuthenticated } from "#/utils/routeUtils.ts";
import { listTitleSchema } from "#/utils/formSchemas.ts";
import { plural } from "#/utils/plural.ts";
import {
  addPresent,
  PresentDraft,
  removePresent,
  toggleFavorite,
  updatePresent,
} from "#/utils/presents.ts";
import { useToast } from "#/components/Toast/toastContext.ts";
import { useConfirm } from "#/components/Confirm/confirmContext.ts";

import ListPresents from "#/components/ListEdit/ListPresents.tsx";
import ListUserForm from "#/components/ListEdit/ListUserForm.tsx";
import PresentForm from "#/components/PresentForm/PresentForm.tsx";
import PrivateLayout from "#/components/PrivateLayout.tsx";
import Button from "#/components/Button/Button.tsx";
import Dialog from "#/components/Dialog/Dialog.tsx";
import Tabs from "#/components/Tabs/Tabs.tsx";
import Tile from "#/components/Tile/Tile.tsx";
import Title from "#/components/Title/Title.tsx";

const tabKeys = ["presents", "users", "danger"] as const;

const editSearchSchema = z.object({
  tab: z.enum(tabKeys).optional().catch(undefined),
});

const ADDED_HIGHLIGHT_DURATION = 4000;

type PresentDialog = { mode: "add" } | { mode: "edit"; present: Present };

export const Route = createFileRoute("/edit/$listId")({
  component: EditComponent,
  validateSearch: editSearchSchema,
  loader: ({ params: { listId } }) => getListByID(listId),
  beforeLoad: ({ context, location }) => {
    isAuthenticated(context, location);
  },
});

function EditComponent() {
  const list = Route.useLoaderData();
  const { tab = "presents" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const { user } = useUserContext();
  const toast = useToast();
  const confirm = useConfirm();
  const [removingUserUID, setRemovingUserUID] = useState<string>();
  const [isRenaming, setIsRenaming] = useState(false);
  const [presentDialog, setPresentDialog] = useState<PresentDialog>();
  const [addedPresentId, setAddedPresentId] = useState<string>();
  const highlightTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = async (
    change: (list: List) => List,
    { success, failure }: { success: string; failure: string },
  ): Promise<boolean> => {
    if (!list) {
      return false;
    }
    try {
      await updateList(list.id, change);
      await router.invalidate();
      toast.show({ type: "success", message: success });
      return true;
    } catch (error: unknown) {
      console.error(failure, error);
      toast.show({ type: "danger", message: failure });
      return false;
    }
  };

  const renameForm = useAppForm({
    defaultValues: { title: list?.title ?? "" },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: z.object({ title: listTitleSchema }) },
    onSubmit: async ({ value }) => {
      const saved = await save(
        (current) => ({ ...current, title: value.title.trim() }),
        {
          success: "Liste renommée",
          failure: "La liste n'a pas pu être renommée, veuillez réessayer",
        },
      );
      if (saved) {
        setIsRenaming(false);
      }
    },
  });

  if (!list || list.userUID !== user?.uid) {
    return <Navigate to="/" />;
  }

  const goToTab = (key: string) => {
    const nextTab = editSearchSchema.shape.tab.parse(key);
    void navigate({
      replace: true,
      search: { tab: nextTab === "presents" ? undefined : nextTab },
    });
  };

  const openRename = () => {
    renameForm.reset({ title: list.title });
    setIsRenaming(true);
  };

  const handleAddPresent = async (draft: PresentDraft) => {
    const id = crypto.randomUUID();
    const saved = await save(
      (current) => ({
        ...current,
        presents: addPresent(current.presents ?? [], draft, {
          id,
          listUID: current.id,
        }),
      }),
      {
        success: `« ${draft.title.trim()} » ajouté à la liste`,
        failure: "Le cadeau n'a pas pu être ajouté, veuillez réessayer",
      },
    );
    if (saved) {
      clearTimeout(highlightTimeout.current);
      setAddedPresentId(id);
      highlightTimeout.current = setTimeout(
        () => setAddedPresentId(undefined),
        ADDED_HIGHLIGHT_DURATION,
      );
    }
    return saved;
  };

  const handleEditPresent = (present: Present) => (draft: PresentDraft) =>
    save(
      (current) => ({
        ...current,
        presents: updatePresent(current.presents ?? [], present.id, draft),
      }),
      {
        success: "Cadeau modifié",
        failure: "Le cadeau n'a pas pu être modifié, veuillez réessayer",
      },
    );

  const handleToggleFavorite = (present: Present) =>
    save(
      (current) => ({
        ...current,
        presents: toggleFavorite(current.presents ?? [], present.id),
      }),
      {
        success: present.favorite
          ? `« ${present.title} » n'est plus un coup de cœur`
          : `« ${present.title} » est un coup de cœur`,
        failure: "Le cadeau n'a pas pu être modifié, veuillez réessayer",
      },
    );

  const handleDeletePresent = async (present: Present) => {
    const confirmed = await confirm({
      title: `Supprimer « ${present.title} » ?`,
      message: "Le cadeau disparaîtra de la liste pour tout le monde.",
      confirmLabel: "Supprimer le cadeau",
    });
    if (!confirmed) {
      return;
    }
    await save(
      (current) => ({
        ...current,
        presents: removePresent(current.presents ?? [], present.id),
      }),
      {
        success: "Cadeau supprimé",
        failure: "Le cadeau n'a pas pu être supprimé, veuillez réessayer",
      },
    );
  };

  const handleDeleteList = async () => {
    const confirmed = await confirm({
      title: `Supprimer « ${list.title} » ?`,
      message:
        "La liste, ses cadeaux et leurs réservations seront supprimés pour tout le monde. Cette action est définitive.",
      confirmLabel: "Supprimer la liste",
    });
    if (!confirmed) {
      return;
    }

    await deleteList(list.id);
    toast.show({ type: "success", message: "Liste supprimée" });
    return navigate({ to: "/" });
  };

  const removeUser = async (userUID: string) => {
    const guest = list.allowedUsers.find((user) => user.userUID === userUID);
    const confirmed = await confirm({
      title: `Retirer ${guest?.username ?? "cet·te invité·e"} ?`,
      message:
        "Cette personne ne verra plus la liste. Elle pourra la rejoindre à nouveau avec le lien d'invitation.",
      confirmLabel: "Retirer",
    });
    if (!confirmed) {
      return;
    }

    setRemovingUserUID(userUID);
    await save(
      (current) => ({
        ...current,
        allowedUsers: current.allowedUsers.filter((uid) => uid !== userUID),
      }),
      {
        success: "L'invité·e a été retiré·e de la liste",
        failure: "L'invité·e n'a pas pu être retiré·e, veuillez réessayer",
      },
    );
    setRemovingUserUID(undefined);
  };

  const presents = list.presents ?? [];

  const tabs = [
    {
      children: (
        <div className="edit-presents">
          <ListPresents
            addedPresentId={addedPresentId}
            presents={presents}
            onDelete={handleDeletePresent}
            onEdit={(present) => setPresentDialog({ mode: "edit", present })}
            onToggleFavorite={handleToggleFavorite}
          />
          {isDesktop && (
            <aside aria-labelledby="add-present-title" className="add-present">
              <div className="add-present__header">
                <Tile shape="square" size="small">
                  <IconPlus size={22} />
                </Tile>
                <h2 className="add-present__title" id="add-present-title">
                  Ajouter un cadeau
                </h2>
              </div>
              <PresentForm
                resetAfterSubmit
                submitLabel="Ajouter à la liste"
                onSubmit={handleAddPresent}
              />
              <p className="add-present__hint">
                Le formulaire reste ouvert après l'ajout : vous pouvez enchaîner
                plusieurs cadeaux.
              </p>
            </aside>
          )}
        </div>
      ),
      icon: <IconGift size={20} />,
      key: "presents",
      title: "Cadeaux",
    },
    {
      children: (
        <ListUserForm
          list={list}
          removingUserUID={removingUserUID}
          onRemove={removeUser}
        />
      ),
      icon: <IconUser size={20} />,
      key: "users",
      title: "Invité·es",
    },
    {
      children: (
        <div className="edit-danger">
          <h3 className="edit-danger__title">Supprimer la liste</h3>
          <p className="edit-danger__text">
            La liste, ses cadeaux et leurs réservations seront supprimés pour
            tout le monde, invité·es compris. Cette action est définitive.
          </p>
          <div>
            <Button
              icon={<IconTrash size={20} />}
              type="danger"
              onClick={() => handleDeleteList()}
            >
              Supprimer la liste
            </Button>
          </div>
        </div>
      ),
      danger: true,
      icon: <IconExclamationCircle size={20} />,
      key: "danger",
      shortTitle: "Danger",
      title: "Danger zone",
    },
  ];

  return (
    <PrivateLayout back={{ label: "Mes listes", to: "/" }}>
      <Title
        actions={
          <Button
            ariaLabel="Renommer la liste"
            icon={<IconPencil size={22} />}
            type="secondary"
            onClick={openRename}
          />
        }
        subtitle={`${plural(presents.length, "cadeau", "cadeaux")} · ${plural(list.allowedUsers.length, "invité·e", "invité·es")}`}
        variant="page"
      >
        {list.title}
      </Title>

      <Tabs
        activeKey={tab}
        label="Modifier la liste"
        tabs={tabs}
        onChange={goToTab}
      />

      {tab === "presents" && !isDesktop && (
        <div className="edit-actions">
          <Button
            icon={<IconShare size={20} />}
            type="secondary"
            onClick={() => goToTab("users")}
          >
            Partager
          </Button>
          <Button
            fullWidth
            icon={<IconPlus size={20} />}
            onClick={() => setPresentDialog({ mode: "add" })}
          >
            Ajouter un cadeau
          </Button>
        </div>
      )}

      <Dialog
        open={!!presentDialog}
        title={
          presentDialog?.mode === "edit"
            ? "Modifier le cadeau"
            : "Nouveau cadeau"
        }
        onClose={() => setPresentDialog(undefined)}
      >
        {presentDialog && (
          <PresentForm
            initialValues={
              presentDialog.mode === "edit" ? presentDialog.present : undefined
            }
            key={
              presentDialog.mode === "edit" ? presentDialog.present.id : "new"
            }
            onCancel={() => setPresentDialog(undefined)}
            submitLabel={
              presentDialog.mode === "edit"
                ? "Enregistrer"
                : "Ajouter le cadeau"
            }
            onSubmit={async (draft) => {
              const saved =
                presentDialog.mode === "edit"
                  ? await handleEditPresent(presentDialog.present)(draft)
                  : await handleAddPresent(draft);
              if (saved) {
                setPresentDialog(undefined);
              }
              return saved;
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={isRenaming}
        title="Renommer la liste"
        onClose={() => setIsRenaming(false)}
      >
        <renameForm.AppForm>
          <renameForm.Form>
            <renameForm.AppField name="title">
              {(field) => <field.TextField label="Nom de la liste" required />}
            </renameForm.AppField>
            <renameForm.SubmitButton>Renommer</renameForm.SubmitButton>
          </renameForm.Form>
        </renameForm.AppForm>
      </Dialog>
    </PrivateLayout>
  );
}
