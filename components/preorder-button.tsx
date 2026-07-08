"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface PreorderButtonProps {
  description: string;
  url: string;
  isIconAdded?: boolean;
}

export function PreorderButton({
  description,
  url,
  isIconAdded = false,
}: PreorderButtonProps) {
  return (
    <Button
      onClick={() => {
        redirect(url);
      }}
    >
      {description}
      {isIconAdded && (
        <IconArrowRight className="ml-2 size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
