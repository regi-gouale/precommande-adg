"use client";

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export interface PreorderButtonProps {
  description: string;
  url: string;
}

export function PreorderButton({ description, url }: PreorderButtonProps) {
  return (
    <Button
      onClick={() => {
        redirect(url);
      }}
    >
      {description}
    </Button>
  );
}
