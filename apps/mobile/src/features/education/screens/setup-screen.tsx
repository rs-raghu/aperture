import { useCallback, useState } from "react";
import type { AcademicProgram, Institution, Semester } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, PreviewNotice, RecordCard, Screen, TextField } from "../components/ui";
import { useEducation } from "../providers/education-provider";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { formatDate } from "../view-models/formatting";

interface SetupData {
  readonly institutions: readonly Institution[];
  readonly programs: readonly AcademicProgram[];
  readonly semesters: readonly Semester[];
}

export function SetupScreen() {
  const { service, context } = useEducation();
  const load = useCallback(async (): Promise<SetupData> => {
    const [institutions, programs, semesters] = await Promise.all([
      service.listInstitutions(context),
      service.listPrograms(context),
      service.listSemesters(context),
    ]);
    return { institutions: institutions.items, programs: programs.items, semesters: semesters.items };
  }, [service, context]);
  const query = useEducationQuery(load);

  return (
    <Screen testID="setup-screen">
      <PageHeader title="Academic setup" description="Create each parent explicitly so every course has a clear academic home." />
      <PreviewNotice />
      <InstitutionForm />
      <ProgramForm institutions={query.data?.institutions ?? []} />
      <SemesterForm programs={query.data?.programs ?? []} />
      <Panel title="Current hierarchy" description="Institution → program → semester">
        <ErrorBanner error={query.error} />
        {query.loading ? <LoadingState /> : !query.data?.institutions.length ? (
          <EmptyState title="No setup yet" description="Start with the institution form. No hidden records are created." />
        ) : <SetupHierarchy data={query.data} />}
      </Panel>
    </Screen>
  );
}

function InstitutionForm() {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [name, setName] = useState("");
  const submit = () => void action.execute(() => service.createInstitution(context, { name, type: "university", status: "active" })).then((saved) => { if (saved) setName(""); });
  return (
    <Panel title="1. Institution" description="Your school or learning provider.">
      <TextField name="name" label="Institution name" required value={name} onChangeText={setName} error={action.error?.fieldErrors.name} />
      <ErrorBanner error={action.error} />
      <ActionButton label="Create institution" onPress={submit} pending={action.pending} />
    </Panel>
  );
}

function ProgramForm({ institutions }: { readonly institutions: readonly Institution[] }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [institutionId, setInstitutionId] = useState("");
  const [name, setName] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const submit = () => void action.execute(() => service.createProgram(context, { institutionId, name, programType: "degree", startsOn, status: "active" })).then((saved) => { if (saved) { setName(""); setStartsOn(""); } });
  return (
    <Panel title="2. Program" description="Select the institution before creating a program.">
      <ChoiceField label="Institution" required value={institutionId} options={institutions.map((item) => ({ value: item.id, label: item.name }))} onChange={setInstitutionId} error={action.error?.fieldErrors.institutionId} />
      {!institutions.length ? <EmptyState title="Institution required" description="Create an institution above first." /> : null}
      <TextField name="name" label="Program name" required value={name} onChangeText={setName} error={action.error?.fieldErrors.name} />
      <TextField name="startsOn" label="Start date" required value={startsOn} onChangeText={setStartsOn} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.startsOn} />
      <ErrorBanner error={action.error} />
      <ActionButton label="Create program" onPress={submit} pending={action.pending} disabled={!institutions.length} />
    </Panel>
  );
}

function SemesterForm({ programs }: { readonly programs: readonly AcademicProgram[] }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [programId, setProgramId] = useState("");
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [sequence, setSequence] = useState("1");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const submit = () => void action.execute(() => service.createSemester(context, { programId, name, academicYear, sequence: Number(sequence), startsOn, endsOn, status: "planned" })).then((saved) => { if (saved) { setName(""); setAcademicYear(""); setStartsOn(""); setEndsOn(""); } });
  return (
    <Panel title="3. Semester" description="Dates use YYYY-MM-DD and the end cannot precede the start.">
      <ChoiceField label="Program" required value={programId} options={programs.map((item) => ({ value: item.id, label: item.name }))} onChange={setProgramId} error={action.error?.fieldErrors.programId} />
      {!programs.length ? <EmptyState title="Program required" description="Create a program above first." /> : null}
      <TextField name="name" label="Semester name" required value={name} onChangeText={setName} error={action.error?.fieldErrors.name} />
      <TextField name="academicYear" label="Academic year" required value={academicYear} onChangeText={setAcademicYear} placeholder="2026–27" error={action.error?.fieldErrors.academicYear} />
      <TextField name="sequence" label="Sequence" required value={sequence} onChangeText={setSequence} keyboardType="number-pad" error={action.error?.fieldErrors.sequence} />
      <TextField name="startsOn" label="Start date" required value={startsOn} onChangeText={setStartsOn} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.startsOn} />
      <TextField name="endsOn" label="End date" required value={endsOn} onChangeText={setEndsOn} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.endsOn} />
      <ErrorBanner error={action.error} />
      <ActionButton label="Create semester" onPress={submit} pending={action.pending} disabled={!programs.length} />
    </Panel>
  );
}

function SetupHierarchy({ data }: { readonly data: SetupData }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  return (
    <>
      <ErrorBanner error={action.error} />
      {data.institutions.map((institution) => (
        <RecordCard key={institution.id} title={institution.name} status={institution.status} details={[`${data.programs.filter((item) => item.institutionId === institution.id).length} programs`]}>
          {data.programs.filter((program) => program.institutionId === institution.id).map((program) => (
            <RecordCard key={program.id} title={program.name} status={program.status} details={[`Starts ${formatDate(program.startsOn)}`]}>
              {data.semesters.filter((semester) => semester.programId === program.id).map((semester) => (
                <RecordCard key={semester.id} title={`${semester.name} · ${semester.academicYear}`} status={semester.status} details={[`${formatDate(semester.startsOn)} – ${formatDate(semester.endsOn)}`]}>
                  {semester.status === "planned" ? <ActionButton label={`Activate ${semester.name}`} tone="secondary" pending={action.pending} onPress={() => void action.execute(() => service.activateSemester(context, semester.id))} /> : null}
                </RecordCard>
              ))}
            </RecordCard>
          ))}
        </RecordCard>
      ))}
    </>
  );
}
