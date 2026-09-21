import { useMemo, useState } from "react";
import { allCalculatorPresentations, calculatorPresentationCategories, type CalculatorPresentationCategory, type CalculatorPresentationDefinition } from "@aperture/calculators";
import { ActionButton, ChoiceField, EmptyState, NavigationCard, PageHeader, Panel, PreviewNotice, RecordList, Screen, TextField } from "../components/ui";
import { useFinance } from "../providers/finance-provider";

function CalculatorCard({ calculator }: { readonly calculator: CalculatorPresentationDefinition }) {
  const { favorites, toggleFavorite } = useFinance(); const favorite = favorites.has(calculator.id);
  return <Panel title={calculator.title} description={`${calculator.categoryLabel}. ${calculator.description}`}><NavigationCard href={`/calculators/${calculator.id}`} title="Open calculator" description={`Example: ${calculator.exampleName}`} /><ActionButton label={`${favorite ? "★ Remove" : "☆ Add"} ${calculator.title} ${favorite ? "from" : "to"} favorites`} tone="secondary" pressed={favorite} onPress={() => toggleFavorite(calculator.id)} /></Panel>;
}

export function CalculatorHubScreen() {
  const { favorites, recentCalculatorIds } = useFinance(); const [search, setSearch] = useState(""); const [category, setCategory] = useState<CalculatorPresentationCategory | "all">("all");
  const filtered = useMemo(() => { const term = search.trim().toLocaleLowerCase(); return allCalculatorPresentations.filter((item) => (category === "all" || item.category === category) && (!term || `${item.title} ${item.description} ${item.categoryLabel}`.toLocaleLowerCase().includes(term))); }, [search, category]);
  const favoriteItems = allCalculatorPresentations.filter(({ id }) => favorites.has(id));
  const recentItems = recentCalculatorIds.flatMap((id) => { const item = allCalculatorPresentations.find((calculator) => calculator.id === id); return item ? [item] : []; });
  return <Screen testID="calculator-hub-screen"><PageHeader eyebrow="38 tested calculators" title="Calculator Hub" description="Search academic and financial calculators. Rates remain explicit inputs, results preserve decimal strings, and every estimate shows its formula and assumptions." /><PreviewNotice /><TextField label="Search calculators" name="calculator-search" value={search} onChangeText={setSearch} placeholder="Try SIP, GPA, tax, or EMI" /><ChoiceField label="Category" value={category} onChange={setCategory} options={[{ value: "all", label: "All categories" }, ...calculatorPresentationCategories.map((item) => ({ value: item.id, label: item.label }))]} />
    {favoriteItems.length > 0 ? <Panel title="Favorites"><RecordList items={favoriteItems} keyExtractor={(item) => item.id} accessibilityLabel="Favorite calculators" renderItem={(item) => <CalculatorCard calculator={item} />} /></Panel> : null}
    {recentItems.length > 0 ? <Panel title="Recently used"><RecordList items={recentItems} keyExtractor={(item) => item.id} accessibilityLabel="Recently used calculators" renderItem={(item) => <CalculatorCard calculator={item} />} /></Panel> : null}
    <Panel title={`${filtered.length} calculators`} description="Each implementation comes from the shared calculator package.">{filtered.length === 0 ? <EmptyState title="No calculator matches" description="Change the search text or category filter." /> : <RecordList items={filtered} keyExtractor={(item) => item.id} accessibilityLabel="Calculator search results" renderItem={(item) => <CalculatorCard calculator={item} />} />}</Panel>
  </Screen>;
}
