"use client";

import { useCallback, useState, type FormEvent } from "react";
import type { AcademicProgram, Institution, Semester } from "@aperture/education";
import { useEducation } from "../providers/education-provider";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { ErrorBanner, EmptyState, LoadingState, PageHeader, Panel, SelectInput, StatusBadge, SubmitButton, TextInput, formatDate } from "../components/ui";

interface SetupData { readonly institutions: readonly Institution[]; readonly programs: readonly AcademicProgram[]; readonly semesters: readonly Semester[]; }

export function SetupScreen() {
  const { service, context } = useEducation();
  const load = useCallback(async (): Promise<SetupData> => {
    const [institutions, programs, semesters] = await Promise.all([
      service.listInstitutions(context), service.listPrograms(context), service.listSemesters(context),
    ]);
    return { institutions: institutions.items, programs: programs.items, semesters: semesters.items };
  }, [service, context]);
  const query = useEducationQuery(load);

  return <><PageHeader eyebrow="Foundation" title="Set up your academic structure" description="Create the institution, program, and semester that courses will belong to. Nothing is created silently." />
    <ErrorBanner error={query.error} />
    <div className="grid grid-3">
      <InstitutionForm />
      <ProgramForm institutions={query.data?.institutions ?? []} />
      <SemesterForm programs={query.data?.programs ?? []} />
    </div>
    <Panel title="Current hierarchy" description="The explicit parent chain used by every Education workflow.">
      {query.loading ? <LoadingState /> : !query.data?.institutions.length ? <EmptyState title="No setup yet" description="Start by creating an institution above. Your data remains local to this mounted preview." /> : <SetupHierarchy data={query.data} />}
    </Panel>
  </>;
}

function InstitutionForm() {
  const { service, context } = useEducation(); const action = useEducationAction();
  const [name, setName] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const saved = await action.execute(() => service.createInstitution(context, { name, type: "university", status: "active" })); if (saved) setName(""); }
  return <Panel title="1. Institution" description="Your school or learning provider."><form className="form-grid" onSubmit={submit} noValidate><div className="field-full"><TextInput name="institutionName" label="Institution name *" required value={name} onChange={(event) => setName(event.target.value)} error={action.error?.fieldErrors.name} /></div><ErrorBanner error={action.error} /><div className="form-actions"><SubmitButton pending={action.pending}>Create institution</SubmitButton></div></form></Panel>;
}

function ProgramForm({ institutions }: { readonly institutions: readonly Institution[] }) {
  const { service, context } = useEducation(); const action = useEducationAction();
  const [institutionId, setInstitutionId] = useState(""); const [name, setName] = useState(""); const [startsOn, setStartsOn] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const saved = await action.execute(() => service.createProgram(context, { institutionId, name, programType: "degree", startsOn, status: "active" })); if (saved) { setName(""); setStartsOn(""); } }
  return <Panel title="2. Program" description="A degree or course of study."><form className="form-grid" onSubmit={submit} noValidate><div className="field-full"><SelectInput name="programInstitution" label="Institution *" required value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} error={action.error?.fieldErrors.institutionId}><option value="">Select institution</option>{institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></div><div className="field-full"><TextInput name="programName" label="Program name *" required value={name} onChange={(event) => setName(event.target.value)} error={action.error?.fieldErrors.name} /></div><div className="field-full"><TextInput name="programStart" label="Start date *" type="date" required value={startsOn} onChange={(event) => setStartsOn(event.target.value)} error={action.error?.fieldErrors.startsOn} /></div><ErrorBanner error={action.error} /><div className="form-actions"><SubmitButton pending={action.pending}>Create program</SubmitButton></div></form></Panel>;
}

function SemesterForm({ programs }: { readonly programs: readonly AcademicProgram[] }) {
  const { service, context } = useEducation(); const action = useEducationAction();
  const [programId, setProgramId] = useState(""); const [name, setName] = useState(""); const [year, setYear] = useState(""); const [sequence, setSequence] = useState("1"); const [startsOn, setStartsOn] = useState(""); const [endsOn, setEndsOn] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const saved = await action.execute(() => service.createSemester(context, { programId, name, academicYear: year, sequence: Number(sequence), startsOn, endsOn, status: "planned" })); if (saved) { setName(""); setYear(""); setStartsOn(""); setEndsOn(""); } }
  return <Panel title="3. Semester" description="A dated teaching period."><form className="form-grid" onSubmit={submit} noValidate><div className="field-full"><SelectInput name="semesterProgram" label="Program *" required value={programId} onChange={(event) => setProgramId(event.target.value)} error={action.error?.fieldErrors.programId}><option value="">Select program</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></div><TextInput name="semesterName" label="Semester name *" required value={name} onChange={(event) => setName(event.target.value)} error={action.error?.fieldErrors.name} /><TextInput name="academicYear" label="Academic year *" required placeholder="2026–27" value={year} onChange={(event) => setYear(event.target.value)} error={action.error?.fieldErrors.academicYear} /><TextInput name="semesterSequence" label="Sequence *" type="number" min="1" required value={sequence} onChange={(event) => setSequence(event.target.value)} error={action.error?.fieldErrors.sequence} /><TextInput name="semesterStarts" label="Start date *" type="date" required value={startsOn} onChange={(event) => setStartsOn(event.target.value)} error={action.error?.fieldErrors.startsOn} /><TextInput name="semesterEnds" label="End date *" type="date" required value={endsOn} onChange={(event) => setEndsOn(event.target.value)} error={action.error?.fieldErrors.endsOn} /><ErrorBanner error={action.error} /><div className="form-actions"><SubmitButton pending={action.pending}>Create semester</SubmitButton></div></form></Panel>;
}

function SetupHierarchy({ data }: { readonly data: SetupData }) {
  const { service, context } = useEducation(); const action = useEducationAction();
  return <><ErrorBanner error={action.error} /><ul className="hierarchy">{data.institutions.map((institution) => <li key={institution.id}><strong>{institution.name}</strong> <StatusBadge value={institution.status} />
    <ul className="hierarchy">{data.programs.filter((program) => program.institutionId === institution.id).map((program) => <li key={program.id}><strong>{program.name}</strong> · starts {formatDate(program.startsOn)} <StatusBadge value={program.status} />
      <ul className="hierarchy">{data.semesters.filter((semester) => semester.programId === program.id).map((semester) => <li key={semester.id}><strong>{semester.name}</strong> · {semester.academicYear} <StatusBadge value={semester.status} /> {semester.status === "planned" && <button className="button button-small button-secondary" disabled={action.pending} onClick={() => void action.execute(() => service.activateSemester(context, semester.id))}>Activate</button>}</li>)}</ul>
    </li>)}</ul>
  </li>)}</ul></>;
}
