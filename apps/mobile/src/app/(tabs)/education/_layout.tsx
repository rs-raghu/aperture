import { Stack } from "expo-router";
import { EducationProvider } from "../../../features/education";

export default function EducationLayout() {
  return (
    <EducationProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#102a43" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#f3f7fa" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Education" }} />
        <Stack.Screen name="setup" options={{ title: "Academic setup" }} />
        <Stack.Screen name="courses" options={{ title: "Courses" }} />
        <Stack.Screen name="assignments" options={{ title: "Assignments" }} />
        <Stack.Screen name="exams" options={{ title: "Exams" }} />
        <Stack.Screen name="grades" options={{ title: "Grades" }} />
        <Stack.Screen name="attendance" options={{ title: "Attendance" }} />
        <Stack.Screen name="study-sessions" options={{ title: "Study sessions" }} />
      </Stack>
    </EducationProvider>
  );
}
