import { eyebrow } from '@/lib/i18n';

// reveal=false for headers that are on screen at load: they must not wait for JS.
type Props = { id: string; label: string; title: string; lead?: string; as?: 'h1' | 'h2'; reveal?: boolean };

export function SectionHead({ id, label, title, lead, as: Tag = 'h2', reveal = true }: Props) {
  return (
    <div className={reveal ? 'section-head reveal' : 'section-head'}>
      <div className="section-head__main rule-top">
        <p className="eyebrow">{eyebrow(label)}</p>
        <Tag className="section-title" id={`${id}-title`}>{title}</Tag>
      </div>
      {lead && <p className="prose section-head__lead">{lead}</p>}
    </div>
  );
}
