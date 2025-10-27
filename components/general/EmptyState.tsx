import { Ban, PlusCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface iAppProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export function EmptyState({ title, buttonText, description,href }: iAppProps) {
  return (
    <div className="flex flex-col flex-1 h-full items-center justify-center rounded-md border-dashed border p-8 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary opacity-10">
        <Ban className="size-10 text-primary " />
      </div>
      <h2 className="mt-6 text-xl">{title}</h2>
      <p className="mb-8 mt-2 text-center text-sm leading-tight text-muted-foreground">
        {description}
      </p>
      <Link href={href} className={buttonVariants()}>
        <PlusCircle className="size-4 mr-2" />
        {buttonText}
      </Link>
    </div>
  );
}
