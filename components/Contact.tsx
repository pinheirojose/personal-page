import { contactLinks, type Copy } from '@/lib/i18n';
import { Frame } from './Frame';
import { SectionHead } from './SectionHead';
import { ContactForm } from './ContactForm';
import '@/styles/contact.css';

export function Contact({ copy }: { copy: Copy }) {
  return (
    <Frame id="contact" coord="X 00 · Y 07" className="section--contact">
      <SectionHead id="contact" label={copy.contactEyebrow} title={copy.contactTitle} lead={copy.contactLead} />
      <div className="contact reveal">
        <dl className="contact-strip">
          {contactLinks(copy).map((c) => (
            <div key={c.label} className="contact-strip__cell">
              <dt className="eyebrow">{c.label}</dt>
              <dd>
                <a
                  className="link"
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                >
                  {c.text}
                </a>
              </dd>
            </div>
          ))}
          <div className="contact-strip__cell">
            <dt className="eyebrow">{copy.locationLabel}</dt>
            <dd>
              {copy.location}, Portugal
              <span className="contact-strip__note">{copy.locationNote}</span>
            </dd>
          </div>
        </dl>
        <ContactForm labels={copy} />
      </div>
    </Frame>
  );
}
