"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { allWebCalculators, calculatorCategories, type CalculatorPresentationCategory } from "../calculators/calculator-catalog";
import { FinanceEmptyState, FinancePageHeader, FinancePanel, FinanceSelectInput, FinanceTextInput } from "../components/ui";
import { useFinance } from "../providers/finance-provider";

function CalculatorCard({ calculator }: { readonly calculator: (typeof allWebCalculators)[number] }) {
  const { favorites, toggleFavorite } = useFinance();
  const favorite = favorites.has(calculator.id);
  return <article className="calculator-card"><div><span className="calculator-category">{calculator.categoryLabel}</span><h3><Link href={`/calculators/${calculator.id}`}>{calculator.title}</Link></h3><p>{calculator.description}</p></div><button className="favorite-button" aria-pressed={favorite} aria-label={`${favorite ? "Remove" : "Add"} ${calculator.title} ${favorite ? "from" : "to"} favorites`} onClick={() => toggleFavorite(calculator.id)}>{favorite ? "★" : "☆"}</button></article>;
}

export function CalculatorHubScreen() {
  const { favorites, recentCalculatorIds } = useFinance();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CalculatorPresentationCategory | "all">("all");
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return allWebCalculators.filter((item) => (category === "all" || item.category === category) && (!term || `${item.title} ${item.description} ${item.categoryLabel}`.toLocaleLowerCase().includes(term)));
  }, [search, category]);
  const favoriteItems = allWebCalculators.filter(({ id }) => favorites.has(id));
  const recentItems = recentCalculatorIds.flatMap((id) => { const item = allWebCalculators.find((calculator) => calculator.id === id); return item ? [item] : []; });
  return <>
    <FinancePageHeader eyebrow="38 tested calculators" title="Calculator Hub" description="Search academic and financial calculators. Rates and policy rules remain explicit inputs, results preserve decimal strings, and every estimate shows its formula and assumptions." />
    <div className="calculator-filters"><FinanceTextInput label="Search calculators" name="calculatorSearch" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try SIP, GPA, tax, or EMI" /><FinanceSelectInput label="Category" name="calculatorCategory" value={category} onChange={(event) => setCategory(event.target.value as CalculatorPresentationCategory | "all")}><option value="all">All categories</option>{calculatorCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</FinanceSelectInput></div>
    {(favoriteItems.length > 0 || recentItems.length > 0) && <div className="grid grid-2">
      <FinancePanel title="Favorites" description="Favorites remain available until this preview is refreshed.">{favoriteItems.length === 0 ? <FinanceEmptyState title="No favorites" description="Use the star on any calculator to keep it here." /> : <div className="calculator-grid compact">{favoriteItems.map((item) => <CalculatorCard key={item.id} calculator={item} />)}</div>}</FinancePanel>
      <FinancePanel title="Recently used" description="The six most recent calculations in this runtime.">{recentItems.length === 0 ? <FinanceEmptyState title="Nothing used yet" description="Run a calculator to build this list." /> : <div className="calculator-grid compact">{recentItems.map((item) => <CalculatorCard key={item.id} calculator={item} />)}</div>}</FinancePanel>
    </div>}
    <FinancePanel title={`${filtered.length} calculators`} description="Each calculator is registered through its package manifest and tested implementation.">
      {filtered.length === 0 ? <FinanceEmptyState title="No calculator matches" description="Change the search text or category filter." /> : <div className="calculator-grid">{filtered.map((item) => <CalculatorCard key={item.id} calculator={item} />)}</div>}
    </FinancePanel>
  </>;
}
