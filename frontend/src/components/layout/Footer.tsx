export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-night-800/60 py-16 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mb-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }}
            >
              <span className="text-night-950 font-display font-bold">L</span>
            </div>
            <span className="font-display text-lg text-night-50">LuxeStay</span>
          </div>
          <p className="text-night-500 text-sm leading-relaxed">
            Votre partenaire de voyage premium. Hôtels et transports de luxe,
            réservés en un instant.
          </p>
        </div>

        {[
          {
            title: "Services",
            links: ["Hôtels", "Transports", "Forfaits", "Business"],
          },
          {
            title: "Aide",
            links: ["FAQ", "Annulations", "Contact", "Politique de confidentialité"],
          },
          {
            title: "Légal",
            links: ["CGU", "Mentions légales", "Cookies", "RGPD"],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-night-200 font-medium text-sm mb-4">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-night-500 hover:text-gold-400 text-sm transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-night-800/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-night-600 text-xs">
          © 2025 LuxeStay &amp; Transit. Tous droits réservés.
        </p>
        <p className="text-night-600 text-xs flex items-center gap-1.5">
          Paiements sécurisés par{" "}
          <span className="text-gold-600 font-medium">Stripe</span>
          {" · "}Base de données{" "}
          <span className="text-gold-600 font-medium">Supabase</span>
        </p>
      </div>
    </footer>
  );
}

