import { useEffect, useState, type FormEvent } from "react";

import * as profileApi from "@/api/profile.api";
import { useFetch } from "@/hooks/useFetch";
import type { HousingType } from "@/types/domain";

export function HousingForm() {
  const { data: housing, loading, error } = useFetch(profileApi.getHousing, []);
  const [type, setType] = useState<HousingType>("RENT");
  const [propertyValue, setPropertyValue] = useState("");
  const [mortgagePayment, setMortgagePayment] = useState("");
  const [mortgageYears, setMortgageYears] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!housing) return;
    setType(housing.type);
    setPropertyValue(housing.propertyValue?.toString() ?? "");
    setMortgagePayment(housing.mortgagePayment?.toString() ?? "");
    setMortgageYears(housing.mortgageYears?.toString() ?? "");
    setRentAmount(housing.rentAmount?.toString() ?? "");
  }, [housing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      await profileApi.upsertHousing({
        type,
        propertyValue: propertyValue ? Number(propertyValue) : undefined,
        mortgagePayment: mortgagePayment ? Number(mortgagePayment) : undefined,
        mortgageYears: mortgageYears ? Number(mortgageYears) : undefined,
        rentAmount: rentAmount ? Number(rentAmount) : undefined,
      });
      setSaved(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2>Situazione abitativa</h2>
      {loading && <p className="page__hint">Caricamento…</p>}
      {error && <p className="form__error">{error}</p>}
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Tipologia abitazione</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as HousingType)}
          >
            <option value="OWNED">Casa di proprietà</option>
            <option value="MORTGAGE">Casa con mutuo</option>
            <option value="RENT">Casa in affitto</option>
          </select>
        </label>

        {type === "OWNED" && (
          <label className="field">
            <span>Valore immobile (€)</span>
            <input
              type="number"
              min={0}
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
            />
          </label>
        )}

        {type === "MORTGAGE" && (
          <div className="form-row">
            <label className="field">
              <span>Valore immobile (€)</span>
              <input
                type="number"
                min={0}
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Rata mutuo (€/mese)</span>
              <input
                type="number"
                min={0}
                value={mortgagePayment}
                onChange={(e) => setMortgagePayment(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Durata mutuo (anni)</span>
              <input
                type="number"
                min={0}
                value={mortgageYears}
                onChange={(e) => setMortgageYears(e.target.value)}
              />
            </label>
          </div>
        )}

        {type === "RENT" && (
          <label className="field">
            <span>Canone affitto (€/mese)</span>
            <input
              type="number"
              min={0}
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
          </label>
        )}

        <div className="list-item__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            Salva
          </button>
          {saved && (
            <span className="page__hint">Situazione abitativa aggiornata.</span>
          )}
        </div>
      </form>
    </div>
  );
}
