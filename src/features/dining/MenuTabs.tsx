"use client";

import { useState } from "react";
import { Drumstick, Leaf } from "lucide-react";
import { TabPills } from "@/components/ui/TabPills";
import { MENU, type MealKey } from "@/content/dining";
import { inr } from "@/lib/format";
import { cn } from "@/lib/cn";

const MEALS: { id: MealKey; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
];

export function MenuTabs() {
  const [meal, setMeal] = useState<MealKey>("dinner");
  return (
    <div id="menu" className="scroll-mt-28">
      <TabPills tabs={MEALS} value={meal} onChange={setMeal} label="Meal" controls="menu-panel" />
      <ul id="menu-panel" role="tabpanel" className="mt-6 divide-y divide-line">
        {MENU[meal].map((d) => (
          <li key={d.name} className="flex items-start justify-between gap-6 py-5">
            <div>
              <h3 className="flex items-center gap-2 font-sans text-lg font-bold text-ink">
                {d.name}
                <span className={cn("grid size-4 place-items-center rounded-sm border", d.veg ? "border-action text-action" : "border-danger text-danger")} title={d.veg ? "Vegetarian" : "Non-vegetarian"}>
                  {d.veg ? <Leaf className="size-2.5" aria-label="Vegetarian" /> : <Drumstick className="size-2.5" aria-label="Non-vegetarian" />}
                </span>
              </h3>
              <p className="mt-0.5 text-sm text-muted">{d.desc}</p>
            </div>
            <p className="price text-xl text-green">{inr(d.price)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
