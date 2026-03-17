import { requireUser } from "@/app/data/user/require-user";
import { SettingsForm } from "./_components/SettingsForm";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mt-5 max-w-2xl">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile
        </p>
      </div>
      <SettingsForm
        name={user.name}
        email={user.email}
        image={user.image || ""}
      />
    </div>
  );
}
