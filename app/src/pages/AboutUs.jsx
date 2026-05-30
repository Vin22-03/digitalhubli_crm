import PublicLayout from "../components/PublicLayout";

function AboutUs() {
  return (
    <PublicLayout badge="About" title="Built in Hubballi for insurance advisors across India." subtitle="digitalhubli is focused on making daily insurance selling simpler, more organized and more professional for advisors who rely on mobile and WhatsApp.">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">Why digitalhubli exists</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Many insurance advisors work hard but lose time in repeated typing, manual follow-ups, scattered contact lists and inconsistent client communication. digitalhubli is being built to bring structure, speed and professionalism into that daily workflow.</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">The product is intentionally practical: select company, choose plan, generate message, share on WhatsApp, save lead and follow up at the right time.</p>
        </section>
        <section className="rounded-[32px] border border-blue-100 bg-blue-50 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-950">Our values</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <li><strong>Clarity:</strong> simple CRM, no unnecessary complexity.</li>
            <li><strong>Responsibility:</strong> ethical communication and advisor accountability.</li>
            <li><strong>Mobile-first:</strong> built for real field usage.</li>
            <li><strong>Trust:</strong> clear terms, refund policy, support and privacy practices.</li>
          </ul>
        </section>
      </div>
    </PublicLayout>
  );
}

export default AboutUs;
