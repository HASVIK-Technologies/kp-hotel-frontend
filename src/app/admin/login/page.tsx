"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { z } from "zod";
import { adminApi } from "@/services/api";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (v: Values) => {
    setError("");
    try {
      await adminApi.login(v.email, v.password);
      router.replace("/admin");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#151a2c] px-4">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <LogoMark size={56} className="mx-auto" />
        <h1 className="mt-4 text-center text-4xl text-green">Staff sign in</h1>
        <p className="mt-1 text-center text-sm text-muted">Operations console for Hotel KP</p>
        {error && <p role="alert" className="mt-5 rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger">{error}</p>}
        <div className="mt-6 space-y-4">
          <Field label="Email" required error={errors.email?.message}>
            {(a) => <Input {...a} type="email" autoComplete="username" {...register("email")} />}
          </Field>
          <Field label="Password" required error={errors.password?.message}>
            {(a) => <Input {...a} type="password" autoComplete="current-password" {...register("password")} />}
          </Field>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-6 w-full"><Lock className="size-4" aria-hidden /> Sign in</Button>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-4 rounded-lg bg-sand-soft p-3 text-center text-xs text-muted">Local demo: <b>admin@kphotel.com</b> / <b>KpAdmin@2026</b></p>
        )}
      </form>
    </div>
  );
}
