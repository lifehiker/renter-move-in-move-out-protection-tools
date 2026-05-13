import { notFound } from "next/navigation";
import { addRoommate, saveChecklistItem, saveIssueNote, uploadPhoto } from "@/app/actions/app-actions";
import { SectionCard, Pill } from "@/components/ui-shell";
import { checklistStatuses, issueSeverities } from "@/lib/checklist";
import { getPropertyForUser, groupChecklistByRoom, severityTone, statusTone } from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/session";
import { shortDate } from "@/lib/utils";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const user = await requireCurrentUser();
  const property = await getPropertyForUser(propertyId, user.id);

  if (!property) {
    notFound();
  }

  const grouped = groupChecklistByRoom(
    property.checklistItems.map((item) => ({
      id: item.id,
      area: item.area,
      label: item.label,
      status: item.status,
      note: item.note,
    })),
  );

  return (
    <div className="space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">Move-in and move-out documentation</p>
        <h1 className="display-title">Capture evidence before it turns into a dispute.</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Walk the property room by room, update condition statuses, log issues,
          and tie photos directly to the rooms or checklist items they support.
        </p>
      </section>

      <section className="two-column">
        <SectionCard title="Checklist" description="Update existing items or add custom rows for unit-specific details.">
          <div className="space-y-5">
            {grouped.map(([room, items]) => (
              <div key={room} className="rounded-[22px] bg-white/70 p-4">
                <h3 className="text-xl font-semibold text-slate-950">{room}</h3>
                <div className="mt-4 space-y-4">
                  {items.map((item) => (
                    <form action={saveChecklistItem} className="rounded-[18px] border border-slate-200/70 bg-white/70 p-4" key={item.id}>
                      <input name="propertyId" type="hidden" value={property.id} />
                      <input name="itemId" type="hidden" value={item.id} />
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{item.label}</p>
                          <p className="text-sm text-slate-600">Document current condition and any notable issue.</p>
                        </div>
                        <Pill tone={statusTone(item.status)}>{item.status.replace("_", " ")}</Pill>
                      </div>
                      <div className="mt-4 inline-form-grid">
                        <label className="field">
                          <span>Status</span>
                          <select defaultValue={item.status} name="status">
                            {checklistStatuses.map((status) => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          <span>Notes</span>
                          <textarea defaultValue={item.note ?? ""} name="note" />
                        </label>
                      </div>
                      <button className="button-secondary mt-4" type="submit">Save item</button>
                    </form>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Add custom checklist item" description="Use this for anything unique about the property.">
            <form action={saveChecklistItem} className="space-y-3">
              <input name="propertyId" type="hidden" value={property.id} />
              <label className="field"><span>Area</span><input name="area" placeholder="Hallway closet" required /></label>
              <label className="field"><span>Label</span><input name="label" placeholder="Bi-fold door track" required /></label>
              <label className="field"><span>Notes</span><textarea name="note" /></label>
              <button className="button-primary" type="submit">Add item</button>
            </form>
          </SectionCard>

          <SectionCard title="Issue log" description="Severity helps you separate cosmetic notes from high-risk deposit concerns.">
            <form action={saveIssueNote} className="space-y-3">
              <input name="propertyId" type="hidden" value={property.id} />
              <label className="field"><span>Room</span><input name="room" placeholder="Kitchen" required /></label>
              <label className="field">
                <span>Related checklist item</span>
                <select name="checklistItemId">
                  <option value="">No specific item</option>
                  {property.checklistItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.area} • {item.label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Severity</span>
                <select name="severity">
                  {issueSeverities.map((severity) => (
                    <option key={severity.value} value={severity.value}>{severity.label}</option>
                  ))}
                </select>
              </label>
              <label className="field"><span>Details</span><textarea name="body" /></label>
              <button className="button-primary" type="submit">Save issue</button>
            </form>
            <ul className="list-clean mt-5">
              {property.issueNotes.map((issue) => (
                <li className="rounded-[18px] bg-white/70 p-4" key={issue.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{issue.room}</p>
                      <p className="text-sm text-slate-600">{issue.body}</p>
                    </div>
                    <Pill tone={severityTone(issue.severity)}>{issue.severity}</Pill>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </section>

      <section className="two-column">
        <SectionCard title="Upload evidence photos" description="Server-side upload timestamps are always stored. EXIF dates are preserved when available.">
          <form action={uploadPhoto} className="space-y-3">
            <input name="propertyId" type="hidden" value={property.id} />
            <label className="field"><span>Photo</span><input accept="image/*" name="file" type="file" required /></label>
            <label className="field"><span>Room</span><input name="room" placeholder="Bathroom" required /></label>
            <label className="field">
              <span>Checklist item</span>
              <select name="checklistItemId">
                <option value="">No specific item</option>
                {property.checklistItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.area} • {item.label}</option>
                ))}
              </select>
            </label>
            <label className="field"><span>Captured at</span><input name="captureTimestamp" type="datetime-local" /></label>
            <label className="field"><span>Note</span><textarea name="note" /></label>
            <button className="button-primary" type="submit">Upload photo</button>
          </form>
        </SectionCard>

        <SectionCard title="Recent photo evidence" description="Recent uploads are shown here with room context and recorded timestamps.">
          <ul className="list-clean">
            {property.photos.map((photo) => (
              <li className="rounded-[18px] bg-white/70 p-4" key={photo.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{photo.room}</p>
                    <p className="text-sm text-slate-600">
                      Uploaded {shortDate(photo.uploadTimestamp)} • {photo.fileName}
                    </p>
                  </div>
                  <Pill>{photo.storageMode}</Pill>
                </div>
                {photo.note ? <p className="mt-2 text-sm text-slate-600">{photo.note}</p> : null}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </div>
  );
}
