import PublicLayout from "../components/PublicLayout";

function Section({ title, children }) {
  return <section className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-950">{title}</h2><div className="mt-2 space-y-2 text-sm leading-7 text-slate-600">{children}</div></section>;
}

function PrivacyPolicy() {
  return (
    <PublicLayout badge="Legal" title="Privacy Policy" subtitle="This policy explains how digitalhubli collects, uses, stores and protects information when advisors use the CRM platform.">
      <div className="mx-auto max-w-4xl space-y-4">
        <Section title="1. Information we collect"><p>We may collect account details such as name, phone number, email, advisor profile details, company selections, subscription information and support communication. Advisors may also store client lead/contact details such as name, mobile number, age, location, notes and follow-up information.</p></Section>
        <Section title="2. How we use information"><p>Information is used to provide CRM features, authenticate users, manage subscriptions, generate templates, maintain leads/contacts, send support communication, prevent misuse and improve the platform.</p></Section>
        <Section title="3. Client data responsibility"><p>Advisors are responsible for collecting client information lawfully and with consent. Advisors should not upload sensitive or unnecessary personal data unless it is required for legitimate business follow-up.</p></Section>
        <Section title="4. Data sharing"><p>We do not sell user or client data. Data may be shared only with service providers required for hosting, payment processing, support, legal compliance, security or platform operations.</p></Section>
        <Section title="5. Security"><p>We use authentication, protected routes, role-based access and reasonable technical controls. No internet system is 100% risk-free, so users must keep passwords secure and report suspicious activity immediately.</p></Section>
        <Section title="6. Data retention"><p>Account, billing and CRM records may be retained while the account is active and for a reasonable period afterward for legal, audit, security and operational purposes. Deletion requests can be raised through support.</p></Section>
        <Section title="7. Contact"><p>For privacy questions, contact digitalhubli support through the Contact Us page.</p></Section>
      </div>
    </PublicLayout>
  );
}

export default PrivacyPolicy;
