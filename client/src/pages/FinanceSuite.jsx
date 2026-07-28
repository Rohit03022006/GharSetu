import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calculator, FileText, Percent, Building2, Wallet, ShieldAlert, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';
import { EmiCalculatorCard } from '../components/finance/EmiCalculatorCard';
import { StampDutyGstCard } from '../components/finance/StampDutyGstCard';
import { MaintenanceCostCard } from '../components/finance/MaintenanceCostCard';
import { RentAffordabilityCard } from '../components/finance/RentAffordabilityCard';
import { AdminRateUpdateCard } from '../components/finance/AdminRateUpdateCard';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

export const FinanceSuite = () => {
  const { user } = useAuth();
  const { toolId } = useParams();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const allTools = [
    {
      id: 'emi',
      name: 'EMI Calculator',
      description: 'Equated Monthly Installment & Interest Breakdown',
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/50 border-blue-200 hover:border-blue-400 dark:bg-blue-950/20 dark:border-blue-900',
      adminOnly: false
    },
    {
      id: 'stamp-duty',
      name: 'Stamp Duty & Registration',
      description: 'State-wise Government Statutory Tax Estimator',
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/50 border-amber-200 hover:border-amber-400 dark:bg-amber-950/20 dark:border-amber-900',
      adminOnly: false
    },
    {
      id: 'gst',
      name: 'GST Calculation',
      description: 'Under Construction vs Ready-to-Move Tax Rules',
      icon: Percent,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900',
      adminOnly: false
    },
    {
      id: 'maintenance',
      name: 'Maintenance Estimator',
      description: 'Tier 1/2/3 City & Typology Maintenance Range',
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-900',
      adminOnly: false
    },
    {
      id: 'rent-affordability',
      name: 'Rent Affordability',
      description: '30% Net Income Golden Rule Rental Cap',
      icon: Wallet,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50/50 border-teal-200 hover:border-teal-400 dark:bg-teal-950/20 dark:border-teal-900',
      adminOnly: false
    },
    {
      id: 'admin-rate-update',
      name: 'Admin Rate Update',
      description: 'State Duty Rate Management & Dynamic Tax Overrides (Admin Only)',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50/50 border-rose-200 hover:border-rose-400 dark:bg-rose-950/20 dark:border-rose-900',
      adminOnly: true
    }
  ];

  const tools = allTools.filter(t => !t.adminOnly || isAdmin);

  const infoDocs = {
    emi: {
      title: 'EMI Calculator Mathematical Formula',
      formulaText: 'EMI = [ P × R × (1 + R)^N ] / [ (1 + R)^N - 1 ]',
      details: 'P = Loan Amount | R = Monthly Interest (Annual % / 12 / 100) | N = Tenure in Months',
      variables: [
        { name: 'P (Principal)', desc: 'Total Principal Loan Amount (e.g. ₹50,00,000)' },
        { name: 'R (Monthly Rate)', desc: 'Annual Interest Rate ÷ 12 ÷ 100 (e.g. 8.5% = 0.007083)' },
        { name: 'N (Tenure Months)', desc: 'Total loan duration in months (Years × 12)' }
      ]
    },
    'stamp-duty': {
      title: 'Stamp Duty & Registration Fee Formula',
      formulaText: 'Stamp Duty Amount = Property Price × ( Stamp Duty % / 100 )\nRegistration Fee = Property Price × ( Registration % / 100 )\nTotal Charges = Stamp Duty Amount + Registration Fee',
      details: 'Rates vary by state (e.g. Maharashtra 6% Stamp Duty, 1% Registration)',
      variables: [
        { name: 'Property Price', desc: 'Total Agreement / Consideration Value of Property' },
        { name: 'Stamp Duty %', desc: 'State-wise tax percentage (Default: 6%)' },
        { name: 'Registration %', desc: 'Statutory government registry fee (Default: 1%)' }
      ]
    },
    gst: {
      title: 'Goods and Services Tax (GST) Rules',
      formulaText: 'If UNDER_CONSTRUCTION: GST = Property Price × ( 5% / 100 )\nIf READY_TO_MOVE: GST = ₹ 0 (Exempt)\nTotal Price with GST = Property Price + GST Amount',
      details: 'Under construction properties incur 5% GST (1% for affordable housing < ₹45L)',
      variables: [
        { name: 'UNDER_CONSTRUCTION', desc: '5% Standard GST applicable on total price' },
        { name: 'READY_TO_MOVE', desc: '0% GST (Completely exempt if OC is received)' }
      ]
    },
    maintenance: {
      title: 'Maintenance Cost Estimator Formula',
      formulaText: 'Monthly Maintenance = Carpet Area (sq. ft.) × Monthly Rate per sq. ft.\nYearly Total = Monthly Maintenance × 12',
      details: 'Tier 1 Apt: ₹3-6/sq.ft | Tier 1 Villa: ₹4-7/sq.ft | Tier 2 Apt: ₹2-4/sq.ft | Plot: ₹0',
      variables: [
        { name: 'Tier 1 Cities', desc: 'Metro cities (Mumbai, Delhi, Bengaluru, Pune)' },
        { name: 'Tier 2 Cities', desc: 'Growth hubs (Jaipur, Lucknow, Kochi, Indore)' },
        { name: 'Tier 3 & Plot', desc: 'Emerging towns (₹1-2.5/sq.ft) | Plots: ₹0 maintenance' }
      ]
    },
    'rent-affordability': {
      title: 'Rent Affordability 30% Golden Rule',
      formulaText: 'Net Disposable Income = Gross Monthly Income - Active Loan EMIs\nSafe Rent Limit (30% Rule) = Net Income × 0.30\nAggressive Rent Limit (40% Rule) = Net Income × 0.40',
      details: 'Prevents over-leveraging household budget on rental payments',
      variables: [
        { name: 'Gross Monthly Income', desc: 'Total monthly take-home salary or income' },
        { name: 'Existing EMIs', desc: 'Current monthly obligations (car loan, personal loan)' },
        { name: '30% Golden Rule', desc: 'Maximum recommended monthly spend on rent' }
      ]
    },
    'admin-rate-update': {
      title: 'Admin State Tax Rate Management',
      formulaText: 'Upsert State Rates Table:\nUPDATE finance_rates SET stamp_duty = X, reg_fee = Y, gst = Z WHERE state = S',
      details: 'Restricted strictly to platform ADMIN JWT credentials',
      variables: [
        { name: 'RBAC Authorization', desc: 'Bearer Token with role === ADMIN' },
        { name: 'Dynamic Tax Override', desc: 'Updates state-wise calculations across all features' }
      ]
    }
  };

  const selectedTool = tools.find(t => t.id === toolId);
  const currentInfo = toolId ? (infoDocs[toolId] || infoDocs['emi']) : null;

  // If a toolId is active, render full-page dedicated tool workspace
  if (toolId && selectedTool) {
    const Icon = selectedTool.icon;
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back button & Tool Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/finance')}
                className="rounded-xl gap-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Calculators</span>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl bg-muted ${selectedTool.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-heading font-bold text-foreground">{selectedTool.name}</h1>
                  <p className="text-xs text-muted-foreground">{selectedTool.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Page Split View: Left (Theory) | Right (Interactive Calculator) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* Left Column: Theory & Formula Reference */}
            <div className="lg:col-span-5 space-y-6 bg-card border border-border p-6 rounded-2xl shadow-xs">
              <div className="flex items-center space-x-2 border-b border-border pb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-base font-heading font-bold text-foreground">Formula & Principles</h3>
              </div>

              {currentInfo && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">{currentInfo.title}</h4>
                    
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono font-semibold leading-relaxed border border-slate-800 whitespace-pre-line shadow-inner">
                      {currentInfo.formulaText}
                    </div>
                    
                    {currentInfo.details && (
                      <p className="text-[11px] text-muted-foreground mt-2.5 italic font-medium">
                        * {currentInfo.details}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Variables & Rules</h4>
                    <div className="space-y-3">
                      {currentInfo.variables.map((v, i) => (
                        <div key={i} className="text-xs border-b border-border/50 pb-2.5 flex flex-col gap-1">
                          <span className="font-semibold text-foreground">{v.name}</span>
                          <span className="text-muted-foreground text-xs leading-relaxed">{v.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Calculation Card */}
            <div className="lg:col-span-7">
              {toolId === 'emi' && <EmiCalculatorCard />}
              {toolId === 'stamp-duty' && <StampDutyGstCard />}
              {toolId === 'gst' && <StampDutyGstCard />}
              {toolId === 'maintenance' && <MaintenanceCostCard />}
              {toolId === 'rent-affordability' && <RentAffordabilityCard />}
              {toolId === 'admin-rate-update' && <AdminRateUpdateCard />}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Default View: Tool Cards Grid
  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Real Estate Finance Suite & Calculators
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Use our sophisticated financial modeling tools to evaluate home loans, taxes, and investment returns with ease.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => navigate(`/finance/${tool.id}`)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border shadow-xs hover:shadow-lg hover:-translate-y-1 group flex flex-col justify-between ${tool.bgColor}`}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-xs ${tool.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground flex items-center justify-between">
                      <span>{tool.name}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Open Calculator</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};


