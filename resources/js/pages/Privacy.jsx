import { PageHeader, Section } from '../components/site/Blocks.jsx';
import { useSiteSettings } from '../components/site/SiteSettings.jsx';
import { usePageMeta } from '../lib/hooks.js';

export default function Privacy() {
  usePageMeta('Privacy policy', 'How 3DP collects, uses and protects personal data submitted through this website.');
  const { contact_email: email, address } = useSiteSettings();
  const mail = email ? (
    <a href={`mailto:${email}`} className="link">
      {email}
    </a>
  ) : (
    'the email address on our contact page'
  );

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        intro="How 3DP collects, uses and protects the personal data you share with us through this website."
        breadcrumbs={[{ label: 'Privacy policy' }]}
      >
        <p className="mt-6 text-[0.9rem] text-ink-faint">Last updated: October 2026</p>
      </PageHeader>

      <Section>
        <div className="prose-3dp mx-auto max-w-[760px]">
          <p>
            3DP (Data Driven Decisions Partners) is based in {address || 'Kigali, Rwanda'}. We take the protection of personal
            data seriously and handle it in line with Rwanda's Law No. 058/2021 relating to the protection of personal data
            and privacy, and good international practice.
          </p>

          <h2>What we collect</h2>
          <p>We only collect the personal data you choose to give us through this website:</p>
          <ul>
            <li>
              <strong>Contact form:</strong> your name, email address, and optionally your phone number and organisation,
              the topic you are interested in, and your message.
            </li>
            <li>
              <strong>Program applications:</strong> your name, email address, phone number, and optionally your
              occupation, preferred track, experience level and motivation for applying.
            </li>
            <li>
              <strong>Technical data:</strong> your IP address is recorded with each form submission to help us prevent
              spam and abuse.
            </li>
          </ul>
          <p>We do not use advertising trackers or sell personal data.</p>

          <h2>Why we use it</h2>
          <ul>
            <li>To reply to your enquiry and discuss how we can help</li>
            <li>To review your program application and contact you about next steps</li>
            <li>To protect this website against spam and misuse</li>
          </ul>
          <p>
            We process this data on the basis of your consent, which you give when submitting a form, and our legitimate
            interest in responding to requests and running our programs.
          </p>

          <h2>Who can see it</h2>
          <p>
            Your data is stored in our secure database and is accessible only to authorised 3DP staff who need it to
            respond to you. We do not share it with third parties except service providers that host our systems on our
            behalf, or where the law requires us to.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep enquiries for up to two years after our last contact with you, and program applications for up to
            two years after the relevant cohort ends, unless you become a client or participant, in which case we keep
            records for as long as needed for that relationship and our legal obligations.
          </p>

          <h2>Your rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>ask for a copy of the personal data we hold about you</li>
            <li>ask us to correct inaccurate data or delete your data</li>
            <li>withdraw your consent or object to how we use your data</li>
            <li>lodge a complaint with the national data protection supervisory authority</li>
          </ul>
          <p>To exercise any of these rights, contact us at {mail}. We will respond within a reasonable time and as required by law.</p>

          <h2>Security</h2>
          <p>
            We use technical and organisational measures to protect your data, including encrypted connections, access
            controls for staff accounts, and regular review of who has access to submitted information.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top of this page shows when it was last
            changed.
          </p>

          <h2>Contact</h2>
          <p>Questions about this policy or how we handle your data can be sent to {mail}.</p>
        </div>
      </Section>
    </>
  );
}
