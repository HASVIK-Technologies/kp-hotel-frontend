import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center px-4 pt-24 text-center">
      <div className="max-w-md">
        <LogoMark className="mx-auto" size={72} />
        <p className="eyebrow mt-6 text-brass-deep">Error 404</p>
        <h1 className="mt-2 text-5xl text-green">This page has checked out</h1>
        <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to the lobby.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/rooms" variant="secondary">Browse rooms</ButtonLink>
        </div>
      </div>
    </div>
  );
}
