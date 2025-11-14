export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_70%)] pointer-events-none" />
      <section className="relative max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
            Economia Gold 2.0
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-slate-50">
            Eldora Realms — o Play-to-Earn que recompensa cada decisão.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Farme GOLD passivamente com sua coleção de NFTs, assista anúncios recompensados
            homologados e participe de batalhas PvP balanceadas. Controle toda a economia
            pelo painel administrativo em tempo real.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/dashboard"
              className="rounded-lg bg-amber-400 px-6 py-3 text-slate-950 font-semibold shadow-lg shadow-amber-400/40 hover:bg-amber-300 transition"
            >
              Entrar no Player Hub
            </a>
            <a
              href="/admin"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:border-amber-300 hover:text-amber-200 transition"
            >
              Acessar Painel Admin
            </a>
          </div>
          <dl className="grid grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="glass rounded-xl px-4 py-5">
              <dt className="uppercase text-[11px] font-semibold tracking-widest text-amber-300">
                Economia
              </dt>
              <dd className="text-2xl font-bold text-white mt-1">GOLD ↔ USD</dd>
              <p className="text-xs text-slate-400 mt-2">
                Conversão dupla registrada a cada transação para auditorias instantâneas.
              </p>
            </div>
            <div className="glass rounded-xl px-4 py-5">
              <dt className="uppercase text-[11px] font-semibold tracking-widest text-emerald-300">
                Monetização
              </dt>
              <dd className="text-2xl font-bold text-white mt-1">Ads Habilitados</dd>
              <p className="text-xs text-slate-400 mt-2">
                Integração com Unity Ads, AdMob, AppLovin e IronSource com anti-bot.
              </p>
            </div>
          </dl>
        </div>
        <div className="glass relative rounded-3xl border border-slate-800/60 p-10 shadow-2xl">
          <div className="absolute -top-12 right-0 w-48 h-48 bg-amber-500/30 rounded-full blur-3xl" />
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-100">Recursos principais</h2>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Sistema de GOLD com compra/saque configuráveis e lastro USD.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Farm passivo escalável pela raridade da sua coleção NFT.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Batalhas PvP com entry fee em GOLD e recompensas instantâneas.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                Loja de energia, boosts, boxes e cosméticos totalmente tokenizada.
              </li>
            </ul>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-6">
              <h3 className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
                Compliance
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Todos os movimentos do jogador registram GOLD e USD simultaneamente,
                permitindo auditoria total e integração com gateways de pagamento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
