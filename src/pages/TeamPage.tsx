import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Field, Input } from '../components/ui/Input';
import { Table, TBody, TD, TH, THead, TR } from '../components/ui/Table';
import { Toggle } from '../components/ui/Controls';
import { EmptyState } from '../components/ui/EmptyState';
import { Avatar } from '../components/ui/Avatar';
import { Dropdown } from '../components/ui/Dropdown';
import { moreTrigger } from '../components/ui/moreTrigger';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useTeamStore, type MemberInput } from '../stores/team';
import { toast } from '../stores/toast';
import { useDocumentTitle } from '../hooks';
import { memberWorkload, memberProjectCount } from '../utils/selectors';
import { formatDate } from '../utils';
import type { TeamMember } from '../types';

const HUES = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-violet-500'];

interface MemberFormState extends MemberInput {
  color: string;
}

const EMPTY: MemberFormState = { name: '', email: '', role: '', active: true, color: HUES[0] };

export function TeamPage() {
  useDocumentTitle('Team');
  const members = useTeamStore((s) => s.items);
  const add = useTeamStore((s) => s.add);
  const update = useTeamStore((s) => s.update);
  const remove = useTeamStore((s) => s.remove);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | undefined>(undefined);
  const [deleting, setDeleting] = useState<TeamMember | undefined>(undefined);
  const [form, setForm] = useState<MemberFormState>(EMPTY);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!formOpen) return;
    setForm(
      editing
        ? { name: editing.name, email: editing.email, role: editing.role, active: editing.active, color: editing.color }
        : EMPTY,
    );
    setError(undefined);
  }, [formOpen, editing]);

  const activeCount = members.filter((m) => m.active).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('A valid email address is required.');
      return;
    }
    if (editing) {
      update(editing.id, form);
      toast.success('Member updated', form.name);
    } else {
      add(form);
      toast.success('Member added', form.name);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    const name = deleting.name;
    remove(deleting.id);
    toast.info('Member removed', `${name} was removed from the workspace`);
    setDeleting(undefined);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Team</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {members.length} members · {activeCount} active
          </p>
        </div>
        <Button onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Add member
        </Button>
      </div>

      <Card className="mt-6" padded={false} hasTable>
        {members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden />}
            title="No team members"
            description="Add teammates to assign them work."
            action={
              <Button size="sm" onClick={() => { setEditing(undefined); setFormOpen(true); }}>
                <Plus className="mr-1 h-4 w-4" aria-hidden />
                Add member
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Member</TH>
                  <TH>Role</TH>
                  <TH>Projects</TH>
                  <TH>Workload</TH>
                  <TH>Active</TH>
                  <TH>Joined</TH>
                  <TH className="sr-only">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {members.map((m) => {
                  const load = memberWorkload(m.id);
                  const projects = memberProjectCount(m.id);
                  return (
                    <TR key={m.id}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} color={m.color} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-white">{m.name}</p>
                            <p className="truncate text-xs text-slate-400">{m.email}</p>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{m.role}</span>
                      </TD>
                      <TD>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{projects}</span>
                      </TD>
                      <TD>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{load.active} open</span>
                          {load.overdue > 0 ? (
                            <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                              {load.overdue} overdue
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                              On track
                            </span>
                          )}
                        </span>
                      </TD>
                      <TD>
                        <Toggle
                          label=""
                          id={`active-${m.id}`}
                          checked={m.active}
                          onChange={() => {
                            update(m.id, { active: !m.active });
                            toast.success(m.active ? 'Member deactivated' : 'Member activated', m.name);
                          }}
                        />
                      </TD>
                      <TD>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(m.joinedAt)}</span>
                      </TD>
                      <TD>
                        <Dropdown
                          ariaLabel={`Actions for ${m.name}`}
                          trigger={moreTrigger(`More actions for ${m.name}`)}
                          items={[
                            { label: 'Edit', icon: <Pencil className="h-4 w-4" aria-hidden />, onClick: () => { setEditing(m); setFormOpen(true); } },
                            { label: 'Remove', icon: <Trash2 className="h-4 w-4" aria-hidden />, danger: true, onClick: () => setDeleting(m) },
                          ]}
                        />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit member' : 'Add member'}
        description="Team members appear in project assignments and task dropdowns."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" form="member-form">{editing ? 'Save changes' : 'Add member'}</Button>
          </>
        }
      >
        <form id="member-form" onSubmit={submit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </p>
          )}
          <Field label="Full name" required htmlFor="m-name">
            <Input id="m-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sara Ahmed" autoFocus />
          </Field>
          <Field label="Email" required htmlFor="m-email">
            <Input id="m-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="sara@acme.com" />
          </Field>
          <Field label="Role" htmlFor="m-role">
            <Input id="m-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Frontend Engineer" />
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Avatar color</legend>
            <div className="flex gap-2">
              {HUES.map((hue) => (
                <button
                  key={hue}
                  type="button"
                  aria-label={`Color ${hue}`}
                  aria-pressed={form.color === hue}
                  onClick={() => setForm((f) => ({ ...f, color: hue }))}
                  className={`h-8 w-8 rounded-full ${hue} ${form.color === hue ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : ''}`}
                />
              ))}
            </div>
          </fieldset>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Remove member?"
        description={`${deleting?.name} will be removed from projects and their tasks will be unassigned.`}
        danger
        confirmLabel="Remove member"
        onCancel={() => setDeleting(undefined)}
        onConfirm={confirmDelete}
      />
    </>
  );
}