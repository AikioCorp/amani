import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, ChevronRight, DollarSign, CheckCircle, Lock, Loader2, X, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useArticles } from '../hooks/useArticles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../services/apiConfig';
import { getSessionToken } from '../services/authService';

interface InvestmentOpportunity {
  id: string;
  title: string;
  category: string;
  risk_level: string;
  expected_return: string;
  min_investment: string;
  time_horizon: string;
  description: string;
  highlights: string[];
  image: string | null;
  status: string;
  funded_percent: number;
}

interface UserInvestmentRequest {
  id: string;
  opportunity_id?: string;
  amount: string;
  investor_type: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  created_at: string;
  opportunity?: InvestmentOpportunity;
}

const Investissement = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);

  // Demandes de l'utilisateur connecté pour suivi d'avancement
  const [myRequests, setMyRequests] = useState<UserInvestmentRequest[]>([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Modal de souscription / d'engagement d'investissement
  const [selectedPledgeOpp, setSelectedPledgeOpp] = useState<InvestmentOpportunity | null>(null);
  const [submittingPledge, setSubmittingPledge] = useState(false);
  const [pledgeForm, setPledgeForm] = useState({
    investor_type: "Particulier",
    company_name: "",
    full_name: "",
    email: "",
    phone: "",
    amount: "",
    notes: "",
    need_data_room: false,
  });

  // Charger les demandes de l'utilisateur s'il est connecté
  const fetchMyRequests = async () => {
    const token = getSessionToken();
    if (!token && !user) return;
    setLoadingMyRequests(true);
    try {
      const res = await fetch(getApiUrl('/investments/my-requests'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();
      if (json.success) setMyRequests(json.data || []);
    } catch (e) {
    } finally {
      setLoadingMyRequests(false);
    }
  };

  // Prefill avec profil si connecté
  useEffect(() => {
    if (user) {
      fetchMyRequests();
      const fullName = `${user.first_name || user.firstName || ""} ${user.last_name || user.lastName || ""}`.trim();
      setPledgeForm((prev) => ({
        ...prev,
        full_name: fullName || prev.full_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user?.id]);

  const handleOpenPledgeModal = (opp: InvestmentOpportunity) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedPledgeOpp(opp);
    const fullName = `${user.first_name || user.firstName || ""} ${user.last_name || user.lastName || ""}`.trim();
    setPledgeForm({
      investor_type: "Particulier",
      company_name: "",
      full_name: fullName,
      email: user.email || "",
      phone: user.phone || "",
      amount: opp.min_investment || "",
      notes: "",
      need_data_room: false,
    });
  };

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeForm.full_name.trim() || !pledgeForm.email.trim() || !pledgeForm.phone.trim() || !pledgeForm.amount.trim()) {
      toastError("Champs requis", "Veuillez remplir votre nom, email, téléphone et le montant engagé.");
      return;
    }

    setSubmittingPledge(true);
    try {
      const token = getSessionToken();
      const res = await fetch(getApiUrl('/investments/pledge'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          opportunity_id: selectedPledgeOpp?.id,
          full_name: pledgeForm.company_name
            ? `${pledgeForm.full_name} (${pledgeForm.company_name})`
            : pledgeForm.full_name,
          email: pledgeForm.email,
          phone: pledgeForm.phone,
          amount: pledgeForm.amount,
          investor_type: pledgeForm.investor_type,
          notes: pledgeForm.need_data_room
            ? `[Demande d'accès Data Room / Due Diligence] ${pledgeForm.notes || ''}`.trim()
            : pledgeForm.notes,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toastSuccess(
          "Demande transmise",
          "Votre intérêt pour cette opportunité a été enregistré avec succès dans notre base de données. Vous pouvez suivre son avancement ci-dessous."
        );
        setSelectedPledgeOpp(null);
        fetchMyRequests();
        // Mise à jour de la liste
        fetch(getApiUrl('/investments'))
          .then((r) => r.json())
          .then((j) => { if (j.success) setOpportunities(j.data); });
      } else {
        toastError("Erreur", json.error || "Échec de l'envoi de la demande.");
      }
    } catch (err: any) {
      toastError("Erreur réseau", "Impossible de transmettre votre dossier d'investissement.");
    } finally {
      setSubmittingPledge(false);
    }
  };

  // Opportunités d'investissement réelles
  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl('/investments'))
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setOpportunities(json.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingOpportunities(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch real published investment articles
  const { articles: dbArticles, loading } = useArticles({
    status: 'published',
    category: 'investissement',
    limit: 10
  });

  const investmentArticles = useMemo(() => {
    return (dbArticles || []).map((art: any) => ({
      id: art.id,
      title: art.title,
      summary: art.summary || art.excerpt || '',
      category: art.category_info?.name || 'Investissement',
      image: art.featured_image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      date: art.published_at || art.created_at,
      readTime: `${art.read_time || 5} min`,
      views: art.views || 0,
      author: art.author ? `${art.author.first_name} ${art.author.last_name}` : 'Amani Rédaction',
    }));
  }, [dbArticles]);

  const investmentCategories = [
    { id: 'all', name: 'Tous les secteurs' },
    { id: 'tech', name: 'Technologie' },
    { id: 'energy', name: 'Énergie Renouvelable' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'healthcare', name: 'Santé' },
    { id: 'finance', name: 'Services Financiers' },
    { id: 'infrastructure', name: 'Infrastructure' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Faible': return 'text-green-600 bg-green-100';
      case 'Modéré': return 'text-yellow-600 bg-yellow-100';
      case 'Élevé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'coming_soon': return 'Bientôt';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'coming_soon': return 'text-blue-600 bg-blue-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || opportunity.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Amani Brand Palette */}
      <section className="bg-[#373B3A] text-white py-20 border-b border-[#373B3A]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 tracking-tight text-white">
              Opportunités d'Investissement Régionales
            </h1>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed text-[#E5DDD5]/90">
              Explorez des opportunités qualifiées d'investissement en Afrique de l'Ouest, 
              suivez l'avancement de vos souscriptions et échangez directement avec notre équipe.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" className="bg-[#9C8464] hover:bg-[#867052] text-white font-extrabold rounded-xl shadow-lg transition-all" asChild>
                <a href="#opportunites">
                  Voir les opportunités
                </a>
              </Button>
              {!user && (
                <Button size="lg" variant="outline" className="bg-[#FDFBF9] hover:bg-[#E5DDD5] text-[#373B3A] font-extrabold border border-[#9C8464]/30 rounded-xl transition-all" asChild>
                  <Link to="/login">
                    Se connecter pour investir
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SUIVI EN TEMPS RÉEL DES DOSSIERS DE L'UTILISATEUR CONNECTÉ */}
      {user && (
        <section className="py-12 bg-[#373B3A] border-b border-[#373B3A]/30 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#9C8464]" /> Mes Demandes & Suivi de Dossier
                </h2>
                <p className="text-sm text-[#E5DDD5]/80">
                  Consultez l'état d’avancement de vos souscriptions d'investissement en temps réel.
                </p>
              </div>
              <span className="px-3.5 py-1.5 bg-[#9C8464]/20 text-[#E5DDD5] font-bold border border-[#9C8464]/40 rounded-full text-xs">
                Connecté en tant que {user.first_name || user.email}
              </span>
            </div>

            {loadingMyRequests ? (
              <div className="flex items-center gap-2 text-[#E5DDD5]/70 py-6">
                <Loader2 className="w-5 h-5 animate-spin" /> Chargement de vos souscriptions…
              </div>
            ) : myRequests.length === 0 ? (
              <div className="bg-[#2B231A] border border-[#3E342B] rounded-2xl p-6 text-center shadow-lg">
                <p className="text-white font-bold mb-2">Vous n'avez pas encore posé d'option d'investissement.</p>
                <p className="text-xs text-[#E5DDD5]/70">
                  Sélectionnez une opportunité ci-dessous et cliquez sur "Souscrire / Soumettre un intérêt" pour lancer votre dossier.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myRequests.map((req) => (
                  <div key={req.id} className="bg-[#2B231A] border border-[#3E342B] rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-white">
                          {req.opportunity?.title || 'Opportunité d\'investissement'}
                        </h3>
                        <p className="text-xs text-[#E5DDD5]/70 font-medium">
                          Montant souscrit : <span className="text-amber-400 font-bold">{req.amount}</span> · Profil: {req.investor_type}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'pending'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : req.status === 'contacted'
                          ? 'bg-[#9C8464]/20 text-[#E5DDD5] border border-[#9C8464]/40'
                          : req.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {req.status === 'pending' && '⏳ En cours d\'analyse'}
                        {req.status === 'contacted' && '📞 Équipe en contact'}
                        {req.status === 'approved' && '✅ Dossier Approuvé'}
                        {req.status === 'rejected' && '❌ Dossier Rejeté'}
                      </span>
                    </div>

                    {/* Timeline d'avancement du dossier */}
                    <div className="border-t border-[#3E342B] pt-4">
                      <p className="text-xs text-[#E5DDD5]/60 font-bold mb-3 uppercase tracking-wider">Avancement du traitement :</p>
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex flex-col items-center gap-1 text-emerald-400">
                          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center font-bold">1</div>
                          <span>Transmis</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-2 ${req.status !== 'pending' ? 'bg-[#9C8464]' : 'bg-[#3E342B]'}`}></div>
                        <div className={`flex flex-col items-center gap-1 ${req.status !== 'pending' ? 'text-amber-400' : 'text-slate-500'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border ${req.status !== 'pending' ? 'bg-[#9C8464]/30 border-[#9C8464]' : 'bg-[#2B231A] border-[#3E342B]'}`}>2</div>
                          <span>Prise de contact</span>
                        </div>
                        <div className={`h-0.5 flex-1 mx-2 ${req.status === 'approved' ? 'bg-emerald-500' : 'bg-[#3E342B]'}`}></div>
                        <div className={`flex flex-col items-center gap-1 ${req.status === 'approved' ? 'text-emerald-400' : 'text-slate-500'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold border ${req.status === 'approved' ? 'bg-emerald-950 border-emerald-500' : 'bg-[#2B231A] border-[#3E342B]'}`}>3</div>
                          <span>Validation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Investment Opportunities */}
      <section id="opportunites" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Opportunités d'Investissement
          </h2>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des opportunités d'investissement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#373B3A] focus:border-transparent"
            >
              {investmentCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Opportunities Grid */}
          {loadingOpportunities ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 mb-2">
                Aucune opportunité d'investissement publiée pour le moment.
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Contactez-nous pour en savoir plus sur nos partenariats d'investissement.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Nous contacter <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={opportunity.image || '/placeholder.svg'}
                      alt={opportunity.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="secondary">{opportunity.category}</Badge>
                      <Badge className={getStatusColor(opportunity.status)}>
                        {statusLabel(opportunity.status)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {opportunity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Rendement Attendu</p>
                        <p className="font-semibold text-green-600">{opportunity.expected_return}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Niveau de Risque</p>
                        <Badge className={getRiskColor(opportunity.risk_level)}>
                          {opportunity.risk_level}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Investissement Min.</p>
                        <p className="font-semibold">{opportunity.min_investment}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Horizon</p>
                        <p className="font-semibold">{opportunity.time_horizon}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Financement</span>
                        <span>{opportunity.funded_percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#373B3A] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${opportunity.funded_percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Highlights */}
                    {opportunity.highlights.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Points Clés:</p>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.highlights.map((highlight, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-[#373B3A] hover:bg-black text-white font-semibold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      disabled={opportunity.status === 'closed'}
                      onClick={() => handleOpenPledgeModal(opportunity)}
                    >
                      {opportunity.status === 'closed' ? (
                        'Opportunité Clôturée'
                      ) : opportunity.status === 'coming_soon' ? (
                        'S\'inscrire pour le lancement'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Souscrire / Soumettre un intérêt
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Investment Articles */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#373B3A]">
            Analyses & Actualités d'Investissement
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : investmentArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun article d'investissement disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {investmentArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-[#373B3A] text-white">{article.category}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-[#373B3A] group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                      <span>{article.author}</span>
                      <span>{article.readTime}</span>
                    </div>
                  </CardContent>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Avertissement sur les Risques
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les investissements présentent des risques de perte en capital. Les performances passées 
            ne préjugent pas des performances futures. Il est recommandé de diversifier ses investissements 
            et de consulter un conseiller financier avant toute décision d'investissement.
          </p>
        </div>
      </section>

      {/* Modal de Souscription / Formulaire d'Engagement d'Investissement - Minimalist Modern Design */}
      <Dialog open={!!selectedPledgeOpp} onOpenChange={() => setSelectedPledgeOpp(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
          <DialogHeader className="space-y-1 pb-2 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-[#373B3A] tracking-tight">
              Option d'Investissement
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 font-medium">
              Sélectionnez votre profil pour transmettre votre intention d'investissement à l'équipe Amani.
            </DialogDescription>
          </DialogHeader>

          {selectedPledgeOpp && (
            <form onSubmit={handlePledgeSubmit} className="space-y-4 mt-3">
              {/* Opportunity Summary Card */}
              <div className="bg-[#FDFBF9] border border-[#E5DDD5]/80 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#373B3A] text-sm leading-snug">{selectedPledgeOpp.title}</h4>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {selectedPledgeOpp.category} · Min: {selectedPledgeOpp.min_investment}
                  </p>
                </div>
                <span className="bg-[#9C8464] text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0">
                  {selectedPledgeOpp.expected_return}
                </span>
              </div>

              {/* 1. SELECTION DU PROFIL INVESTISSEUR AU SOMMET */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                  Profil Investisseur *
                </label>
                <select
                  value={pledgeForm.investor_type}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, investor_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#373B3A] focus:border-[#9C8464] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Particulier">Particulier / Investisseur Privé</option>
                  <option value="Business Angel">Business Angel / Investisseur Qualifié</option>
                  <option value="Fonds d'investissement">Fonds d'investissement / Capital-Risque</option>
                  <option value="Institutionnel / Entreprise">Institutionnel / Entreprise / Holding</option>
                </select>
              </div>

              {/* 2. CHAMPS ADAPTATIFS SELON LE PROFIL */}
              {(pledgeForm.investor_type.includes("Fonds") || pledgeForm.investor_type.includes("Institutionnel")) ? (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                      Nom du Fonds ou de l'Entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: West Africa Capital"
                      value={pledgeForm.company_name}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, company_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                        Représentant *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nom & Fonction"
                        value={pledgeForm.full_name}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, full_name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                        Email Pro *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="direction@fonds.com"
                        value={pledgeForm.email}
                        onChange={(e) => setPledgeForm({ ...pledgeForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                      Nom et Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Salika Famanta"
                      value={pledgeForm.full_name}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, full_name: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                      Adresse Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="s.famanta@gmail.com"
                      value={pledgeForm.email}
                      onChange={(e) => setPledgeForm({ ...pledgeForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Téléphone & Montant d'option */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                    Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+223 70 00 00 00"
                    value={pledgeForm.phone}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                    Montant d'option *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={selectedPledgeOpp?.min_investment || '10 000 000 FCFA'}
                    value={pledgeForm.amount}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#9C8464] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Data Room Request Option */}
              {(pledgeForm.investor_type.includes("Fonds") || pledgeForm.investor_type.includes("Institutionnel") || pledgeForm.investor_type.includes("Business")) && (
                <div className="bg-[#FDFBF9] border border-[#E5DDD5]/80 rounded-xl p-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="data_room_check"
                    checked={pledgeForm.need_data_room}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, need_data_room: e.target.checked })}
                    className="w-4 h-4 accent-[#9C8464] rounded cursor-pointer shrink-0"
                  />
                  <label htmlFor="data_room_check" className="text-xs font-semibold text-[#373B3A] cursor-pointer">
                    Demander l'accès à la Data Room (Mémorandum Financier / Due Diligence)
                  </label>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#373B3A] mb-1.5">
                  Notes ou Précisions (Optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Précisions ou demandes particulières..."
                  value={pledgeForm.notes}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#373B3A] placeholder-gray-400 focus:border-[#9C8464] focus:outline-none transition-colors font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPledgeOpp(null)}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPledge}
                  className="bg-[#373B3A] hover:bg-[#9C8464] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  {submittingPledge ? "Transmission..." : "Valider l'intention"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'Invitation à la Connexion */}
      <Dialog open={authModalOpen} onOpenChange={setAuthModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6 shadow-2xl text-center">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-slate-900" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 text-center">
              Connexion requise
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2 mb-2">
              Pour garantir la sécurité et le suivi réglementaire de vos options d'investissement, vous devez posséder un compte Amani.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button className="w-full bg-[#373B3A] hover:bg-[#9C8464] text-white font-bold rounded-xl py-2.5 transition-colors" asChild>
              <Link to="/login" onClick={() => setAuthModalOpen(false)}>
                Se Connecter
              </Link>
            </Button>
            <Button variant="outline" className="w-full border-slate-300 text-slate-700 font-bold rounded-xl py-2.5" asChild>
              <Link to="/register" onClick={() => setAuthModalOpen(false)}>
                Créer un compte gratuitement
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investissement;
