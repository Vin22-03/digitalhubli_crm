import PublicLayout from "../components/PublicLayout";

function Section({ title, children }) {
  return <section className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-950">{title}</h2><div className="mt-2 space-y-2 text-sm leading-7 text-slate-600">{children}</div></section>;
}

function TermsAndConditions() {
  return (
    <PublicLayout badge="Legal" title="Terms & Conditions" subtitle="These terms define responsible use of digitalhubli CRM. By using the platform, users agree to follow these terms.">
      <div className="mx-auto max-w-4xl space-y-4">
        <Section title="1. Nature of service"><p>digitalhubli provides CRM software for insurance advisors. It does not act as an insurer, insurance broker, financial advisor or claim authority. Insurance product details must be verified with the relevant insurer.</p></Section>
        <Section title="2. User responsibility"><p>Users are responsible for accurate communication, client consent, lawful follow-up, correct policy information and compliance with insurer and regulatory requirements.</p></Section>
        <Section title="3. Account security"><p>Users must keep login credentials confidential. Any activity from the user's account may be treated as activity by that user.</p></Section>
        <Section title="4. Prohibited use"><p>Users must not use the platform for spam, misleading claims, unlawful marketing, harassment, data scraping, unauthorized access, abusive content, or sharing false insurance benefits.</p></Section>
        <Section title="5. Subscription and access"><p>Access may depend on active subscription status. digitalhubli may suspend access for expired subscriptions, misuse, payment failure, security risks or violation of these terms.</p></Section>
        <Section title="6. Templates and content"><p>Templates are productivity aids. Users must review messages before sending and ensure that all benefits, premium, maturity, eligibility and disclosures are accurate for the specific client and plan.</p></Section>
        <Section title="7. Limitation of liability"><p>The platform is provided on a reasonable-effort basis. digitalhubli is not responsible for business loss, missed sales, incorrect advisor communication, insurer-side changes or client decisions based on unverified information.</p></Section>
        <Section title="8. Changes"><p>digitalhubli may update these terms as the product, pricing, compliance needs and features evolve.</p></Section>
      </div>
    </PublicLayout>
  );
}

export default TermsAndConditions;
