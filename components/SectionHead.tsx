import { eyebrow } from '@/lib/i18n';

type Props = { id: string; label: string; title: string; lead?: string; as?: 'h1' | 'h2' };

export function SectionHead({ id, label, title, lead, as: Tag = 'h2' }: Props) {
  return (
    <div className="section-head reveal">
      <div className="section-head__main rule-top">
        <p className="eyebrow">{eyebrow(label)}</p>
        <Tag className="section-title" id={`${id}-title`}>{title}</Tag>
      </div>
      {lead && <p className="prose section-head__lead">{lead}</p>}
    </div>
  );
}
