import { useState } from "react";

import * as expenseApi from "@/api/expense.api";
import { useCurrency } from "@/features/settings/CurrencyContext";
import type {
  Category,
  Expense,
  ExpenseKind,
  Frequency,
  UtilityLevel,
} from "@/types/domain";

interface Habit {
  key: string;
  label: string;
  categoryName: string;
  kind: ExpenseKind;
  frequency: Frequency;
  utility: UtilityLevel;
  unit: string;
}

// Spese personali ricorrenti più comuni: attivabili una sola volta per membro,
// così non vanno ripetute ogni volta come una spesa "una tantum".
const HABITS: Habit[] = [
  {
    key: "SMOKING",
    label: "Fumo (sigarette)",
    categoryName: "Fumo",
    kind: "VARIABLE",
    frequency: "DAILY",
    utility: 1,
    unit: "al giorno",
  },
  {
    key: "GYM",
    label: "Abbonamento palestra",
    categoryName: "Palestra",
    kind: "FIXED",
    frequency: "MONTHLY",
    utility: 4,
    unit: "al mese",
  },
];

interface Props {
  memberId: string;
  categories: Category[];
  expenses: Expense[];
  onChange: () => void;
}

export function PersonalHabits({
  memberId,
  categories,
  expenses,
  onChange,
}: Props) {
  const { symbol } = useCurrency();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const memberExpenses = expenses.filter((e) => e.memberId === memberId);

  const activate = async (habit: Habit) => {
    const amount = Number(drafts[habit.key]);
    if (!amount || amount <= 0) return;
    setSubmitting(habit.key);
    try {
      const category = categories.find((c) => c.name === habit.categoryName);
      await expenseApi.createExpense({
        name: habit.label,
        kind: habit.kind,
        amount,
        frequency: habit.frequency,
        utility: habit.utility,
        categoryId: category?.id,
        memberId,
        isRecurring: true,
        date: new Date().toISOString(),
      });
      onChange();
    } finally {
      setSubmitting(null);
    }
  };

  const remove = async (expenseId: string) => {
    await expenseApi.deleteExpense(expenseId);
    onChange();
  };

  return (
    <div className="list" style={{ marginTop: 8 }}>
      {HABITS.map((habit) => {
        const existing = memberExpenses.find((e) => e.name === habit.label);
        return (
          <div className="list-item" key={habit.key}>
            <div className="list-item__main">
              <span className="list-item__title">{habit.label}</span>
              <span className="list-item__meta">
                {existing
                  ? `${existing.amount} ${symbol} ${habit.unit}`
                  : "Non ancora attivata come spesa ricorrente"}
              </span>
            </div>
            <div className="list-item__actions">
              {existing ? (
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => remove(existing.id)}
                >
                  Disattiva
                </button>
              ) : (
                <>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder={`${symbol} ${habit.unit}`}
                    value={drafts[habit.key] ?? ""}
                    onChange={(e) =>
                      setDrafts({ ...drafts, [habit.key]: e.target.value })
                    }
                    style={{ width: 100 }}
                  />
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={submitting === habit.key}
                    onClick={() => activate(habit)}
                  >
                    Attiva
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
