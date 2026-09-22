import type { WeeklyPlan } from "@aperture/planner";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlanner } from "../providers/planner-provider";
import { plannerStyles as styles } from "./planner-screen";

export function WeeklyPlannerScreen() {
  const { service, context, clock, revision } = usePlanner();
  const [date, setDate] = useState(() => clock.now().slice(0, 10));
  const [week, setWeek] = useState<WeeklyPlan | null>(null);
  useEffect(() => {
    let active = true;
    const request = { context, date, revision };
    void service.getWeeklyPlan(request.context, request.date).then((value) => { if (active) setWeek(value); });
    return () => { active = false; };
  }, [context, date, revision, service]);
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.screen}><View style={styles.header}><Text style={styles.eyebrow}>WEEKLY PLANNER</Text><Text style={styles.title}>See the whole week</Text><Text style={styles.copy}>Recurring work expands across the week while missed deadlines remain visible.</Text></View><View style={styles.card}><Text style={styles.label}>Week containing</Text><TextInput accessibilityLabel="Week containing" value={date} onChangeText={setDate} style={styles.input} placeholder="YYYY-MM-DD" /></View>{week?.days.map((day) => <View style={styles.card} key={day.date}><Text style={styles.cardTitle}>{day.date}</Text><Text style={styles.caption}>{day.scheduled.length} open · {day.completed.length} complete · {day.overdue.length} overdue</Text>{day.scheduled.length === 0 ? <Text style={styles.empty}>Nothing scheduled.</Text> : day.scheduled.map(({ item }) => <View style={styles.item} key={item.id}><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.caption}>{item.itemType} · priority {item.priority}</Text></View></View>)}</View>)}</ScrollView></SafeAreaView>;
}
