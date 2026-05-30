import PublicLayout from "../components/PublicLayout";

const faqs = [
  ["Who is digitalhubli CRM for?", "It is built for insurance advisors, agents, CLIA/team leaders and small insurance teams who want a mobile-first system for leads, contacts, templates and follow-ups."],
  ["Does digitalhubli sell insurance policies?", "No. digitalhubli is a CRM/software platform. Insurance advice, policy sale, suitability and official product communication remain the advisor's responsibility."],
  ["Can I use it on mobile?", "Yes. The product is being built mobile-first because most advisors work from phone and WhatsApp."],
  ["Is WhatsApp API included?", "Currently the workflow is WhatsApp-first sharing through advisor's own WhatsApp/Web flow. Official WhatsApp Business API integration can be added later as a separate feature."],
  ["Can admin manage advisors?", "Yes. Admin-side flows can manage advisors, companies, templates, subscriptions and workspace operations depending on enabled modules."],
  ["Can I get refund after subscribing?", "Please refer to the Refund Policy. Generally, activated SaaS subscriptions are non-refundable except duplicate payments, technical billing errors, or cases approved by digitalhubli."],
  ["Is my client data safe?", "The platform uses protected routes, role-based access and backend authentication. Advisors should still collect and use client information only with consent."],
];

function FAQ() {
  return (
    <PublicLayout
      badge="Questions"
      title="Frequently asked questions."
      subtitle="Clear answers for advisors before they subscribe and start using the CRM."
    >
      <div className="mx-auto max-w-4xl space-y-4">
        {faqs.map(([q, a]) => (
          <div key={q} className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-950">{q}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{a}</p>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}

export default FAQ;
