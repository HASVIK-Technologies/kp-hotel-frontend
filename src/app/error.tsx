"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 pt-24 text-center">
      <div className="max-w-md">
        <h1 className="text-5xl text-green">Something went wrong</h1>
        <p className="mt-3 text-muted">An unexpected error occurred. Please try again, your search and booking details are safe.</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
