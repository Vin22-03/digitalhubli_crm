import PublicLayout from "../components/PublicLayout";

const items = [
  { icon: "📲", title: "WhatsApp-first selling", desc: "Generate clean client messages from plan templates and share quickly through WhatsApp." },
  { icon: "👥", title: "Lead and contact CRM", desc: "Maintain client records, source, status, follow-ups, and activity history in one place." },
  { icon: "🏢", title: "Company and plan structure", desc: "Organize templates by insurance company, plan and eligibility so advisors find the right message faster." },
  { icon: "📄", title: "Brochures and resources", desc: "Share PDF links and resources from inside the advisor workspace." },
  { icon: "⏰", title: "Follow-up discipline", desc: "Help advisors remember who to call, when to follow up, and what was already shared." },
  { icon: "🔐", title: "Role-based workspace", desc: "Separate admin and advisor areas with protected routes and controlled access." },
  { icon: "📱", title: "Mobile-first UI", desc: "Designed for real advisors who work from phone, WhatsApp, and field meetings." },
  { icon: "🤖", title: "Future-ready funnels", desc: "The structure can support personalised plan pages and chatbot-assisted client education later." },
];

function Features() {
  return (
    <PublicLayout
      badge="Product features"
      title="A practical CRM made for daily insurance advisor work."
      subtitle="The goal is not to copy generic CRMs. digitalhubli focuses on the actual field workflow: contacts, templates, WhatsApp, follow-ups, and simple advisor productivity."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-[0_16px_44px_rgba(37,99,235,0.07)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">{item.icon}</div>
            <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}

export default Features;
