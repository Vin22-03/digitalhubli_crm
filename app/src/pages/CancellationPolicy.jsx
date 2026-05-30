import PublicLayout from "../components/PublicLayout";

function CancellationPolicy() {
  return (
    <PublicLayout badge="Payments" title="Cancellation Policy" subtitle="This page explains how subscription cancellation works for digitalhubli CRM.">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Subscription cancellation</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Users may request cancellation of future renewal or continued use by contacting support. If no auto-renewal is enabled, the subscription naturally ends on the expiry date.</p>
        </section>
        <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Access after cancellation</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Unless otherwise communicated, users may continue using the CRM until the end of the paid subscription period. After expiry, access may be restricted until renewal.</p>
        </section>
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">No partial refund by default</h2>
          <p className="mt-3 text-sm leading-7 text-amber-950/80">Cancellation does not automatically mean refund for unused days. Refunds are handled separately under the Refund Policy.</p>
        </section>
      </div>
    </PublicLayout>
  );
}

export default CancellationPolicy;
