import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import heroConstruction from '../assets/hero-construction.png';
import georrandesImg from '../assets/georrandes.jpg';
import dashboardMockup from '../assets/dashboard-mockup.png';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-900 text-white font-sans selection:bg-primary selection:text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              Edifica<span className="text-primary">Locação</span>
            </h1>
          </div>
          
          <div className={`flex items-center gap-4 transition-all duration-300 ${isLoginOpen ? 'mr-80' : ''}`}>
            <button 
              onClick={() => navigate('/register')}
              className="text-sm text-neutral-400 hover:text-white transition-colors hidden sm:block"
            >
              Cadastre-se
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsLoginOpen(!isLoginOpen)} 
                className="btn-primary px-5 py-2 rounded-full shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 text-sm"
              >
                Fazer Login
              </button>
              {isLoginOpen && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-secondary-800 rounded-2xl shadow-2xl border border-white/10 p-4 animate-slide-up z-50">
                  {error && <div className="bg-red-500/10 text-red-400 p-2 rounded-lg mb-3 text-sm">{error}</div>}
                  <form onSubmit={handleLogin} className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="E-mail"
                      className="text-sm py-2 px-3 bg-neutral-400 border-0 text-secondary-900 placeholder-neutral-500 rounded-lg outline-none w-36"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Senha"
                      className="text-sm py-2 px-3 bg-neutral-400 border-0 text-secondary-900 placeholder-neutral-500 rounded-lg outline-none w-28"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary text-sm px-4 py-2 rounded-lg whitespace-nowrap" disabled={loading}>
                      {loading ? '...' : 'Entrar'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col">
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 -z-20">
            <img src={heroConstruction} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-900/95 via-secondary-900/90 to-secondary-900/95"></div>
          </div>
          <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 left-1/4 w-[35rem] h-[35rem] bg-yellow-500/5 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="max-w-6xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left animate-slide-up">

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Gestão inteligente para sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-500">frota de máquinas</span>
              </h2>
              <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-xl leading-relaxed">
                Controle seu estoque, gerencie clientes, emita contratos em PDF automaticamente e acompanhe o faturamento em tempo real. Tudo em um só lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary text-lg px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
                >
                  Ver Funcionalidades
                </button>
                <button 
                  onClick={() => { setShowAbout(true); setTimeout(() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} 
                  className="btn-ghost text-lg px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  Sobre Nós
                </button>
              </div>

              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/5">
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-neutral-500">Clientes ativos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10k+</p>
                  <p className="text-sm text-neutral-500">Máquinas gerenciadas</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">99%</p>
                  <p className="text-sm text-neutral-500">Satisfação</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-yellow-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={dashboardMockup} alt="Dashboard" className="w-full h-auto" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE NÓS */}
        <section id="about-section" className="py-24 bg-secondary-900 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Sobre Nós</span>
              <h3 className="text-4xl font-bold mb-4 mt-3">Conheça a Edifica Locação</h3>
              <p className="text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                Somos especializados em gestão de locação de máquinas e equipamentos para construção civil. 
                Com anos de experiência no mercado, oferecemos soluções completas para otimizar o controle 
                de frota, contratos e faturamento da sua locadora.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl mx-auto">
              <div className="flex-shrink-0">
                <img src={georrandesImg} alt="Georrandes" className="w-48 h-48 rounded-2xl object-cover shadow-xl border-2 border-primary/20" />
              </div>
              <div className="text-left text-neutral-400 space-y-4">
                <p className="leading-relaxed">
                  <span className="text-white font-semibold">Georrandes</span> — Fundador & CEO da Edifica Locação, 
                  profissional dedicado a transformar a gestão de locação de máquinas para a construção com tecnologia e inovação.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">CNPJ</p>
                    <p className="text-sm text-white">54.567.138/0001-04</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Contato</p>
                    <p className="text-sm text-white">(83) 99664-7788</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-wider text-neutral-500">Endereço</p>
                    <p className="text-sm text-white">Rua Carine Cristina Monteiro da Silva, 305 - Lot. Oceania VI, Portal do Poço, Cabedelo - PB. CEP: 58106-086</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-24 bg-secondary-800/50 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-primary font-semibold text-sm uppercase tracking-widest">Funcionalidades</span>
              <h3 className="text-4xl font-bold mb-4 mt-3">Tudo que você precisa para crescer</h3>
              <p className="text-neutral-400 max-w-2xl mx-auto">Ferramentas pensadas para o dia a dia da locação na construção civil.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard 
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                }
                title="Estoque em Tempo Real" 
                description="Saiba exatamente quantas máquinas estão disponíveis, alugadas ou em manutenção com nosso painel de estoque consolidado."
              />
              <FeatureCard 
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                }
                title="Contratos Automáticos" 
                description="Gere contratos de locação em PDF com apenas um clique, já preenchidos com os dados do cliente e da máquina."
              />
              <FeatureCard 
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                }
                title="Dashboard Financeiro" 
                description="Acompanhe seu faturamento mensal, histórico de locações e performance de equipamentos através de gráficos claros."
              />
              <FeatureCard 
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                }
                title="Gestão de Clientes" 
                description="Cadastro completo de clientes com histórico de locações, documentos e contatos centralizados."
              />
              <FeatureCard 
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                }
                title="Notificações Inteligentes" 
                description="Receba alertas sobre vencimentos de contratos, manutenções preventivas e pagamentos pendentes."
              />
              <FeatureCard 
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
                title="Suporte Prioritário" 
                description="Equipe dedicada para ajudar você e sua equipe a extrair o máximo da plataforma."
              />
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary-900 to-yellow-500/5"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-3xl"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">Pronto para transformar sua locadora?</h3>
            <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já modernizaram sua gestão de locação com a Edifica.
            </p>
            <button 
              onClick={() => navigate('/register')} 
              className="btn-primary text-lg px-10 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
            >
              Criar Conta Grátis
            </button>
            <p className="text-sm text-neutral-500 mt-4">Sem cartão de crédito · Cancelamento gratuito</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-secondary-800/50 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <span className="font-bold text-lg">Edifica<span className="text-primary">Locação</span></span>
              </div>
              <p className="text-sm text-neutral-500">Sistema completo para gestão de locação de máquinas e equipamentos.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-neutral-400">Produto</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Cadastre-se</button></li>
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Funcionalidades</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-neutral-400">Empresa</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><span className="hover:text-white transition-colors cursor-default">Sobre</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Contato</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-neutral-400">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><span className="hover:text-white transition-colors cursor-default">Privacidade</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Termos</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Edifica Locação. Todos os direitos reservados.
            </div>
            <div className="text-sm font-medium text-neutral-500">
              Desenvolvido para profissionais da construção.
            </div>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/5583996647788"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg hover:shadow-green-500/50 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-105 before:absolute before:inset-0 before:rounded-full before:bg-green-500 before:animate-ping before:opacity-30 before:-z-10"
        aria-label="Fale conosco pelo WhatsApp"
      >
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-secondary-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg border border-white/5">
          Fale conosco
        </div>
        <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
      {icon}
    </div>
    <h4 className="text-lg font-bold mb-2">{title}</h4>
    <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
  </div>
);

export default WelcomePage;
