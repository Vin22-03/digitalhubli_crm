import PublicLayout from "../components/PublicLayout";

const practices = [
  ["Role-based access", "Admin and advisor routes are separated so users see only the workspace intended for their role."],
  ["Protected authentication", "Login-protected CRM pages require authenticated access before opening advisor or admin modules."],
  ["Password protection", "Passwords should be stored using secure hashing on the backend and never shown back to users."],
  ["Tenant-aware design", "Business data should be separated by user/workspace rules so one advisor cannot access another advisor's data."],
  ["Responsible data collection", "Advisors should collect only the client data required for genuine follow-up and service."],
  ["Payment verification", "For Razorpay, backend order verification and webhooks should be used instead of trusting frontend success alone."],
];

function Security() {
  return (
    <PublicLayout badge="Trust & Security" title="Security and responsible data handling." subtitle="Insurance CRM data includes phone numbers, leads and follow-up records. The product should be built with privacy, access control and ethical usage from day one.">
      <div className="grid gap-4 md:grid-cols-2">
        {practices.map(([title, desc]) => (
          <div key={title} className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[28px] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950/85">
        <strong>Important:</strong> Security is an ongoing process. Before public launch, review production hosting, backups, logging, upload storage, rate limits, CORS, token expiry, input validation and database access rules.
      </div>
    </PublicLayout>
  );
}

export default Security;
