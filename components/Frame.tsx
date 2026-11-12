type Props = { id: string; coord: string; className?: string; children: React.ReactNode };

/** A section drawn like a sheet: crop marks at the corners and a coordinate tag. */
export function Frame({ id, coord, className = '', children }: Props) {
  return (
    <section id={id} className={`section ${className}`} aria-labelledby={`${id}-title`}>
      <div className="shell frame">
        <span className="frame__mark frame__mark--tl" aria-hidden="true" />
        <span className="frame__mark frame__mark--tr" aria-hidden="true" />
        <span className="frame__coord" aria-hidden="true">{coord}</span>
        {children}
      </div>
    </section>
  );
}
