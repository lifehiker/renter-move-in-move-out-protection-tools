"use client";

import { useState } from "react";
import { currency } from "@/lib/utils";

function clampDays(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function calculateProrated(amount: number, daysInMonth: number, occupiedDays: number) {
  return (amount / daysInMonth) * occupiedDays;
}

export function ProratedCalculator({
  defaultRent = 2400,
  defaultUtilities = 180,
  defaultDaysInMonth = 30,
  title = "Prorated roommate transition calculator",
  description = "Enter rent, utilities, month length, and occupied days to split a mid-month handoff cleanly.",
}: {
  defaultRent?: number;
  defaultUtilities?: number;
  defaultDaysInMonth?: number;
  title?: string;
  description?: string;
}) {
  const [monthlyRent, setMonthlyRent] = useState(defaultRent);
  const [utilities, setUtilities] = useState(defaultUtilities);
  const [daysInMonth, setDaysInMonth] = useState(defaultDaysInMonth);
  const [occupiedDays, setOccupiedDays] = useState(Math.min(15, defaultDaysInMonth));

  const normalizedMonthDays = clampDays(daysInMonth, 30);
  const normalizedOccupiedDays = Math.min(
    clampDays(occupiedDays, 15),
    normalizedMonthDays,
  );
  const rentShare = calculateProrated(monthlyRent, normalizedMonthDays, normalizedOccupiedDays);
  const utilityShare = calculateProrated(utilities, normalizedMonthDays, normalizedOccupiedDays);
  const total = rentShare + utilityShare;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="section-title">{title}</h3>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      </div>
      <div className="inline-form-grid">
        <label className="field">
          <span>Monthly rent</span>
          <input
            min="0"
            step="0.01"
            type="number"
            value={monthlyRent}
            onChange={(event) => setMonthlyRent(Number(event.target.value) || 0)}
          />
        </label>
        <label className="field">
          <span>Monthly utilities</span>
          <input
            min="0"
            step="0.01"
            type="number"
            value={utilities}
            onChange={(event) => setUtilities(Number(event.target.value) || 0)}
          />
        </label>
        <label className="field">
          <span>Days in month</span>
          <input
            max="31"
            min="28"
            step="1"
            type="number"
            value={daysInMonth}
            onChange={(event) => setDaysInMonth(Number(event.target.value) || 30)}
          />
        </label>
        <label className="field">
          <span>Occupied days</span>
          <input
            max={normalizedMonthDays}
            min="1"
            step="1"
            type="number"
            value={occupiedDays}
            onChange={(event) => setOccupiedDays(Number(event.target.value) || 1)}
          />
        </label>
      </div>
      <div className="three-column">
        <div className="rounded-[18px] bg-white/70 p-5">
          <p className="font-semibold text-slate-950">Prorated rent</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{currency(rentShare)}</p>
          <p className="mt-2 text-sm text-slate-600">
            {normalizedOccupiedDays} of {normalizedMonthDays} days occupied.
          </p>
        </div>
        <div className="rounded-[18px] bg-white/70 p-5">
          <p className="font-semibold text-slate-950">Prorated utilities</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{currency(utilityShare)}</p>
          <p className="mt-2 text-sm text-slate-600">
            Uses the same occupied-day baseline for shared services.
          </p>
        </div>
        <div className="rounded-[18px] bg-white/70 p-5">
          <p className="font-semibold text-slate-950">Total handoff amount</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{currency(total)}</p>
          <p className="mt-2 text-sm text-slate-600">
            Helpful for roommate move-ins, move-outs, or short overlap periods.
          </p>
        </div>
      </div>
    </div>
  );
}
